import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeParaCaptureSafe } from "@/lib/ai-safe";
import { ItemClassification, ItemType } from "@prisma/client";
import { isAllowed } from "@/lib/rate-limiter";
import { validateText, validateImage } from "@/lib/validateAssist";
import { trackAICredit, recordAICreditUsage } from "@/lib/ai-credits";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  // rate limit per-user (Redis-capable)
  try {
    const allowed = await isAllowed(`user:${session.user.id}`, 12, 60_000);
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Content-Type": "application/json" } });
    }
  } catch (err: unknown) {
    // On limiter failure, log and allow (do not block core capture flow)
     
    console.warn("Rate limiter check failed for assist/ingest, allowing request:", (err as Error)?.message ?? String(err));
  }
  const form = await request.formData();
  const textRaw = String(form.get("text") ?? "");
  const imageFile = form.get("image") as File | null;
  const imageUrl = String(form.get("imageUrl") ?? "").trim() || undefined;

  let text: string | null;
  let imageDataUrl: string | null;
  try {
    text = validateText(textRaw);
    imageDataUrl = await validateImage(imageFile);
  } catch (err: unknown) {
    type WithStatus = { status?: number };
    const status = (err && typeof err === "object" && (err as unknown as WithStatus).status) || 400;
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(JSON.stringify({ error: message }), { status: Number(status), headers: { "Content-Type": "application/json" } });
  }

  if (!text && !imageDataUrl && !imageUrl) {
    return new NextResponse(JSON.stringify({ error: "Provide text or an image" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  try {
    // Check AI credits before using AI
    const creditCheck = await trackAICredit(session.user.id);

    let decision;
    let aiEnabled = true;

    // Only use AI if credits available or unlimited
    if (creditCheck.allowed || creditCheck.remaining === -1) {
      try {
        decision = await analyzeParaCaptureSafe({ text: text ?? undefined, imageDataUrl: imageDataUrl ?? undefined, imageUrl });
        // Record credit usage after successful AI call
        await recordAICreditUsage(session.user.id);
        aiEnabled = true;
      } catch (aiError) {
        // If AI fails, fall back to basic classification
        console.warn("AI classification failed, using fallback:", aiError);
        aiEnabled = false;
        decision = {
          classification: ItemClassification.INBOX,
          title: text?.slice(0, 80) || "Captured note",
          details: text || null,
          type: ItemType.NOTE,
        };
      }
    } else {
      // Out of credits - use fallback
      aiEnabled = false;
      decision = {
        classification: ItemClassification.INBOX,
        title: text?.slice(0, 80) || "Captured note",
        details: text || null,
        type: ItemType.NOTE,
      };
    }

    const classification = decision.classification ?? ItemClassification.INBOX;
    const created = await prisma.item.create({
      data: {
        userId: session.user.id,
        title: decision.title || text || "Captured note",
        details: decision.details || (text ? text : null),
        classification,
        classification,
        type: decision.type ?? ItemType.NOTE,
        dueDate: decision.dueDate ? new Date(decision.dueDate) : null,
      },
    });

    return new NextResponse(
      JSON.stringify({
        ok: true,
        item: created,
        decision,
        aiEnabled, // Indicate if AI was used
        message: aiEnabled ? "Item classified with AI" : (creditCheck.remaining === 0 ? "AI credits exhausted. Upgrade for unlimited AI." : "Item captured (AI unavailable, using default classification)"),
        creditsRemaining: creditCheck.remaining,
        creditsLimit: creditCheck.limit,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in assist/ingest:", error);
    return new NextResponse(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
