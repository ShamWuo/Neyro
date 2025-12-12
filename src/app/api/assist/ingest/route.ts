import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeParaCapture } from "@/lib/ai";
import { ItemClassification, ItemType } from "@prisma/client";
import { takeToken } from "@/lib/rateLimiter";
import { validateText, validateImage } from "@/lib/validateAssist";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  // rate limit per-user
  try {
    takeToken(`user:${session.user.id}`);
  } catch (err: unknown) {
    type WithStatus = { status?: number; retryAfter?: number };
    const status = (err && typeof err === "object" && (err as unknown as WithStatus).status) || 429;
    const retryAfter = (err && typeof err === "object" && (err as unknown as WithStatus).retryAfter) || undefined;
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(JSON.stringify({ error: message }), {
      status: Number(status),
      headers: retryAfter ? { "Retry-After": String(retryAfter), "Content-Type": "application/json" } : { "Content-Type": "application/json" },
    });
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
    // prefer an externally-hosted imageUrl (e.g., S3 presigned upload) over base64 payload
    const decision = await analyzeParaCapture({ text: text ?? undefined, imageDataUrl: imageDataUrl ?? undefined, imageUrl });
    const classification = decision.classification ?? ItemClassification.INBOX;
    const created = await prisma.item.create({
      data: {
        userId: session.user.id,
        title: decision.title || text || "Captured note",
        details: decision.details || (text ? text : null),
        classification,
        type: decision.type ?? ItemType.NOTE,
      },
    });

    return new NextResponse(JSON.stringify({ ok: true, item: created, decision }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(JSON.stringify({ error: message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
