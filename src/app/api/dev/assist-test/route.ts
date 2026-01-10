import { NextResponse } from "next/server";
type WithStatus = { status?: number };
import { analyzeParaCapture } from "@/lib/ai";
import { ItemClassification, ItemType } from "@prisma/client";
import { takeToken } from "@/lib/rateLimiter";
import { validateText } from "@/lib/validateAssist";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // rate-limit by IP for dev route
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "dev:anonymous";
    takeToken(`ip:${ip}`);
  } catch (err: unknown) {
    const status = (err && typeof err === "object" && (err as unknown as WithStatus).status) || 429;
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(JSON.stringify({ error: message }), { status: Number(status), headers: { "Content-Type": "application/json" } });
  }

  const form = await request.formData();
  const textRaw = String(form.get("text") ?? "");
  const imageUrlRaw = String(form.get("imageUrl") ?? "").trim() || undefined;
  let text: string | null;
  try {
    text = validateText(textRaw);
  } catch (err: unknown) {
    const status = (err && typeof err === "object" && (err as unknown as WithStatus).status) || 400;
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(JSON.stringify({ error: message }), { status: Number(status), headers: { "Content-Type": "application/json" } });
  }
  if (!text) return new NextResponse(JSON.stringify({ error: "Provide text in `text` form field" }), { status: 400, headers: { "Content-Type": "application/json" } });

  let decision;
  let aiEnabled = false;
  
  if (process.env.GEMINI_API_KEY) {
    try {
      decision = await analyzeParaCapture({ text, imageUrl: imageUrlRaw });
      aiEnabled = true;
      return NextResponse.json({ ok: true, decision, aiEnabled });
    } catch (err) {
      console.warn("AI test failed, using fallback:", err);
      // Fall through to mock response
    }
  }

  // Mocked decision when no API key is present or AI fails (safe for local dev)
  const mock = {
    classification: ItemClassification.INBOX,
    title: text.slice(0, 80),
    details: text,
    type: ItemType.NOTE,
  };
  return NextResponse.json({ ok: true, decision: mock, aiEnabled: false, message: "AI not configured - using mock classification" });
}
