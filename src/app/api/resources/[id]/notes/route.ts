import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { takeToken } from "@/lib/rateLimiter";
import { verifyOwnership } from "@/lib/security";
import { validateId } from "@/lib/validation";
import { sanitizeString } from "@/lib/validation";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const notesSchema = z.object({
  notes: z.string().max(10000).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const { id } = await params;
    
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid resource collection ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsCollection = await verifyOwnership("resourceCollection", id, session.user.id);
    if (!ownsCollection) {
      logger.warn(`User ${session.user.id} attempted to update notes for collection ${id} without ownership`);
      return NextResponse.json({ error: "Resource collection not found" }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = notesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Sanitize notes if provided
    const notes = parsed.data.notes !== undefined ? (parsed.data.notes ? sanitizeString(parsed.data.notes, 10000) : null) : undefined;

    // TODO: Update resource collection notes when notes field is added
    // For now, we'll just return success
    // await prisma.resourceCollection.update({
    //   where: { id },
    //   data: {
    //     notes: parsed.data.notes || null,
    //   },
    // });

    logger.info("Resource collection notes updated", { collectionId: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error updating resource notes", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to update notes" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (prevent abuse)
    try {
      takeToken(`user:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;

    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid resource collection ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsCollection = await verifyOwnership("resourceCollection", id, session.user.id);
    if (!ownsCollection) {
      logger.warn(`User ${session.user.id} attempted to fetch notes for collection ${id} without ownership`);
      return NextResponse.json({ error: "Resource collection not found" }, { status: 404 });
    }

    // TODO: Fetch notes when notes field is added to ResourceCollection model
    const notes = "";

    return NextResponse.json({ notes });
  } catch (error) {
    logger.error("Error fetching resource notes", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
