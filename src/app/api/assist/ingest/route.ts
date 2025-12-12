import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeParaCapture } from "@/lib/ai";
import { ItemClassification, ItemType } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const text = String(form.get("text") ?? "").trim();
  const image = form.get("image") as File | null;

  if (!text && (!image || image.size === 0)) {
    return NextResponse.json({ error: "Provide text or an image" }, { status: 400 });
  }

  let imageDataUrl: string | undefined;
  if (image && image.size > 0) {
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = image.type || "image/png";
    imageDataUrl = `data:${mime};base64,${base64}`;
  }

  try {
    const decision = await analyzeParaCapture({ text, imageDataUrl });
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

    return NextResponse.json({ ok: true, item: created, decision });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
