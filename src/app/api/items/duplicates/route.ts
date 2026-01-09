import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const details = searchParams.get("details");

  if (!title || title.length < 3) {
    return NextResponse.json({ similar: [] });
  }

  try {
    const userId = session.user.id;

    // Search for similar items by title (fuzzy match)
    const similarItems = await prisma.item.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: title, mode: "insensitive" } },
          ...(details && details.length > 3
            ? [{ details: { contains: details, mode: "insensitive" } }]
            : []),
        ],
        archivedAt: null,
      },
      select: {
        id: true,
        title: true,
        classification: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Filter out exact matches (user might be editing)
    const filtered = similarItems.filter(
      (item) => item.title.toLowerCase() !== title.toLowerCase()
    );

    return NextResponse.json({
      similar: filtered.map((item) => ({
        id: item.id,
        title: item.title,
        classification: item.classification,
      })),
    });
  } catch (error) {
    logger.error("Error checking duplicates", error);
    return NextResponse.json({ similar: [] });
  }
}

