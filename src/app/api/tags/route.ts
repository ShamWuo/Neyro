import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    logger.error("Error fetching tags", error);
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

    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Check if tag already exists (case-insensitive)
    const existing = await prisma.tag.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: parsed.data.name, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const tag = await prisma.tag.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name.trim(),
        color: parsed.data.color?.trim() || null,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    logger.error("Error creating tag", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

