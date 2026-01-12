import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeString } from "@/lib/validation";
import { isAllowed } from "@/lib/rate-limiter";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const collectionSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const collections = await prisma.resourceCollection.findMany({ where: { userId: session.user.id, archivedAt: null }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(collections);
  } catch (error) {
    logger.error("Error fetching resource collections", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 10, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      console.warn("Rate limiter check failed, allowing resources request:", (e as Error)?.message || String(e));
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

    const parsed = collectionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // Sanitize inputs
    const name = sanitizeString(parsed.data.name, 500);
    const description = parsed.data.description ? sanitizeString(parsed.data.description, 2000) : null;

    const collection = await prisma.resourceCollection.create({
      data: {
        userId: session.user.id,
        name,
        description,
      },
    });
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    logger.error("Error creating resource collection", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
