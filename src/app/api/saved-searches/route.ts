import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const createSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  query: z.string().optional().nullable(),
  filters: z.record(z.unknown()).optional().default({}),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(savedSearches);
  } catch (error) {
    logger.error("Error fetching saved searches", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = createSavedSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        query: parsed.data.query || null,
        filters: parsed.data.filters || {},
      },
    });

    return NextResponse.json(savedSearch);
  } catch (error) {
    logger.error("Error creating saved search", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

