import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeString } from "@/lib/validation";
import { isAllowed } from "@/lib/rate-limiter";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(20).optional(),
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

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 12, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      // Allow on limiter failure but log
      // eslint-disable-next-line no-console
      console.warn("Rate limiter check failed, allowing tag create request:", e?.message || e);
    }

    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

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

    // Sanitize inputs
    const name = sanitizeString(parsed.data.name, 50);
    const color = parsed.data.color ? sanitizeString(parsed.data.color, 20) : null;

    // Check if tag already exists (case-insensitive)
    const existing = await prisma.tag.findFirst({
      where: {
        userId: session.user.id,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const tag = await prisma.tag.create({
      data: {
        userId: session.user.id,
        name,
        color,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    logger.error("Error creating tag", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

