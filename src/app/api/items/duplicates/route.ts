import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { takeToken } from "@/lib/rateLimiter";
import { sanitizeString } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    try {
      takeToken(`user:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const titleRaw = searchParams.get("title");
    const detailsRaw = searchParams.get("details");

    // Validate and sanitize inputs
    if (!titleRaw || titleRaw.trim().length < 3) {
      return NextResponse.json({ similar: [] });
    }

    // Sanitize and limit length
    const title = sanitizeString(titleRaw, 500);
    const details = detailsRaw ? sanitizeString(detailsRaw, 500) : null;

    const userId = session.user.id;

    // Search for similar items by title (simple contains match)
    // TODO: Enhance with AI-powered similarity detection using embeddings
    const titleWords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const similarItems = await prisma.item.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: title, mode: "insensitive" as const } },
          // Also match if any significant word appears
          ...(titleWords.length > 0
            ? titleWords.map((word) => ({
                title: { contains: word, mode: "insensitive" as const },
              }))
            : []),
          ...(details && details.length > 3
            ? [{ details: { contains: details.slice(0, 100), mode: "insensitive" as const } }]
            : []),
        ],
        archivedAt: null,
      },
      select: {
        id: true,
        title: true,
        classification: true,
        details: true,
      },
      take: 10, // Get more to filter better
      orderBy: { createdAt: "desc" },
    });

    // Filter out exact matches and rank by similarity
    const filtered = similarItems
      .filter((item) => item.title.toLowerCase() !== title.toLowerCase())
      .map((item) => {
        // Calculate simple similarity score (word overlap)
        const itemWords = new Set(item.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
        const titleWordsSet = new Set(titleWords);
        const intersection = [...itemWords].filter((w) => titleWordsSet.has(w));
        const similarity = intersection.length / Math.max(itemWords.size, titleWordsSet.size);
        return { ...item, similarity };
      })
      .filter((item) => item.similarity > 0.3) // Only items with >30% similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Return top 5 most similar

    return NextResponse.json({
      similar: filtered.map((item) => ({
        id: item.id,
        title: item.title,
        classification: item.classification,
      })),
    });
  } catch (error) {
    logger.error("Error checking duplicates", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ similar: [] });
  }
}

