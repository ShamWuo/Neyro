import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { analyzeParaCaptureSafe } from "@/lib/ai-safe";
import { logger } from "@/lib/logger";
import { isAllowed } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const allowed = await isAllowed(`user:${session.user.id}:suggest-projects`, 5, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      console.warn("Rate limiter check failed", e?.message || e);
    }

    const { itemIds } = await request.json();
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: "itemIds required" }, { status: 400 });
    }

    // Fetch the inbox items
    const items = await prisma.item.findMany({
      where: {
        id: { in: itemIds },
        projectId: null,
        userId: session.user.id,
      },
      select: { id: true, title: true, content: true, classification: true },
    });

    if (items.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Use AI to suggest groupings
    const itemSummary = items.map(i => `- ${i.title} (${i.classification})`).join("\n");
    const prompt = `Analyze these inbox items and suggest 1-3 projects or groupings to organize them. Return a JSON array with objects: { title, itemIndices: [0,1,...], description }. Be concise.\n\n${itemSummary}`;

    let suggestions: Array<{ title: string; itemIndices: number[]; description?: string }> = [];
    try {
      const aiResult = await analyzeParaCaptureSafe({ text: prompt });
      // Note: This uses AI for grouping logic; in production you'd parse more carefully
      // For now, return a simple fallback
      suggestions = [];
    } catch (e) {
      logger.warn("AI suggestion failed, returning empty", e);
      suggestions = [];
    }

    // Convert back to itemIds
    const result = suggestions.map(s => ({
      suggestedTitle: s.title,
      itemIds: s.itemIndices.map(idx => items[idx]?.id).filter(Boolean),
      description: s.description,
    }));

    return NextResponse.json({ suggestions: result });
  } catch (error) {
    logger.error("Error suggesting projects", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
