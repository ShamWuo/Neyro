import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { validateId } from "@/lib/validation";
import { sanitizeString } from "@/lib/validation";
import { isAllowed } from "@/lib/rate-limiter";
import { Prisma } from "@prisma/client";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const updateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  query: z.string().max(500).optional().nullable(),
  filters: z.record(z.unknown()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid saved search ID" }, { status: 400 });
    }

    // Verify ownership
    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!savedSearch) {
      logger.warn(`User ${session.user.id} attempted to access saved search ${id} without ownership`);
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
    }

    return NextResponse.json(savedSearch);
  } catch (error) {
    logger.error("Error fetching saved search", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 10, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      // Allow on limiter failure but log
       
      console.warn("Rate limiter check failed, allowing saved-searches PATCH/DELETE request:", (e as Error)?.message || String(e));
    }

    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid saved search ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = updateSavedSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Verify saved search belongs to user
    const existing = await prisma.savedSearch.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      logger.warn(`User ${session.user.id} attempted to update saved search ${id} without ownership`);
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
    }

    const updateData: {
      name?: string;
      query?: string | null;
      filters?: Prisma.InputJsonValue;
    } = {};

    if (parsed.data.name !== undefined) updateData.name = sanitizeString(parsed.data.name, 100);
    if (parsed.data.query !== undefined) updateData.query = parsed.data.query ? sanitizeString(parsed.data.query, 500) : null;
    if (parsed.data.filters !== undefined) {
      // Limit filters size (prevent JSON DoS)
      let filters = parsed.data.filters || {};
      if (typeof filters === "object" && filters !== null) {
        const filterKeys = Object.keys(filters);
        if (filterKeys.length > 50) {
          filters = Object.fromEntries(Object.entries(filters).slice(0, 50));
        }
      }
      updateData.filters = filters as Prisma.InputJsonValue;
    }

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Error updating saved search", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 10, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      // Allow on limiter failure but log
       
      console.warn("Rate limiter check failed, allowing saved-searches PATCH/DELETE request:", (e as Error)?.message || String(e));
    }

    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid saved search ID" }, { status: 400 });
    }

    // Verify saved search belongs to user
    const existing = await prisma.savedSearch.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      logger.warn(`User ${session.user.id} attempted to delete saved search ${id} without ownership`);
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting saved search", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

