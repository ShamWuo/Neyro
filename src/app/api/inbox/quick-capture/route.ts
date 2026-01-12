import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAllowed } from "@/lib/rate-limiter";
import { validateText } from "@/lib/validateAssist";
import { analyzeParaCaptureSafe } from "@/lib/ai-safe";
import { trackAICredit, recordAICreditUsage } from "@/lib/ai-credits";
import { ItemClassification, ItemType } from "@prisma/client";
import { ParaDecision } from "@/lib/ai";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    // Per-user quick-capture limit (short window)
    try {
      const allowed = await isAllowed(`user:${session.user.id}:quick-capture`, 12, 60_000);
      if (!allowed) return new NextResponse(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Content-Type": "application/json" } });
    } catch (err: unknown) {
      // On limiter failure, allow the request but log
      logger.warn("Rate limiter check failed, allowing quick-capture request", { error: (err as Error)?.message || String(err) });
    }

    const form = await request.formData();
    const textRaw = String(form.get("text") ?? "").trim();
    let text: string | null;
    try {
      text = validateText(textRaw);
    } catch (err: unknown) {
      const status = (err && typeof err === "object" && (err as Record<string, unknown>).status) || 400;
      const message = err instanceof Error ? err.message : String(err);
      return new NextResponse(JSON.stringify({ error: message }), { status: Number(status), headers: { "Content-Type": "application/json" } });
    }

    if (!text) {
      return new NextResponse(JSON.stringify({ error: "Provide text in `text` form field" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Attempt AI classification if credits available
    let decision: ParaDecision | null = null;
    let aiEnabled = false;
    try {
      const creditCheck = await trackAICredit(session.user.id);
      if (creditCheck.allowed || creditCheck.remaining === -1) {
        try {
          decision = await analyzeParaCaptureSafe({ text });
          await recordAICreditUsage(session.user.id);
          aiEnabled = true;
        } catch (aiErr) {
          // Non-fatal - fall back to defaults
          logger.warn("quick-capture AI failed, using fallback", { error: aiErr });
          aiEnabled = false;
        }
      }
    } catch (err) {
      // If credit-check fails, proceed without AI
      logger.warn("quick-capture credit check failed", { error: (err as Error)?.message ?? String(err) });
    }

    const classification = (decision && decision.classification) || ItemClassification.INBOX;
    const title = (decision && decision.title) || text.slice(0, 80);
    const details = (decision && decision.details) || text;
    const type = (decision && decision.type) || ItemType.NOTE;

    const created = await prisma.item.create({
      data: {
        userId: session.user.id,
        title,
        details,
        classification,
        type,
      },
    });

    return new NextResponse(JSON.stringify({ ok: true, item: created, aiEnabled, decision }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error in quick-capture endpoint", { error });
    return new NextResponse(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
