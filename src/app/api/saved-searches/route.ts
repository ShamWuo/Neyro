import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { isAllowed } from "@/lib/rate-limiter";
import { sanitizeString } from "@/lib/validation";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const createSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  query: z.string().max(500).optional().nullable(),
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

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 10, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      // Allow on limiter failure but log
      console.warn("Rate limiter check failed, allowing saved-searches request:", (e as Error)?.message || String(e));
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

    const parsed = createSavedSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Sanitize inputs
    const name = sanitizeString(parsed.data.name, 100);
    const query = parsed.data.query ? sanitizeString(parsed.data.query, 500) : null;

    // Limit filters size (prevent JSON DoS)
    let filters = parsed.data.filters || {};
    if (typeof filters === "object" && filters !== null) {
      const filterKeys = Object.keys(filters);
      if (filterKeys.length > 50) {
        // Limit to first 50 keys
        filters = Object.fromEntries(Object.entries(filters).slice(0, 50));
      }
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name,
        query,
        filters: filters as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(savedSearch, { status: 201 });
  } catch (error) {
    logger.error("Error creating saved search", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

