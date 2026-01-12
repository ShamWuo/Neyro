import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { isAllowed } from "@/lib/rate-limiter";
import { verifyBulkOwnership, validateIdArray } from "@/lib/security";
import { ItemClassification } from "@prisma/client";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 12, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
       
      console.warn("Rate limiter check failed, allowing bulk-restore request:", (e as Error)?.message || String(e));
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

    if (!body || typeof body !== "object" || !("ids" in body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Validate and sanitize IDs
    let ids: string[];
    try {
      ids = validateIdArray(body.ids as unknown, 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid IDs";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: "At least one ID is required" }, { status: 400 });
    }

    // Verify ownership of all items
    const ownsAllItems = await verifyBulkOwnership("item", ids, session.user.id);
    if (!ownsAllItems) {
      logger.warn(`User ${session.user.id} attempted bulk restore with items without full ownership`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify all items are archived
    const archivedItems = await prisma.item.count({
      where: {
        id: { in: ids },
        userId: session.user.id,
        classification: ItemClassification.ARCHIVE,
      },
    });

    if (archivedItems !== ids.length) {
      return NextResponse.json({ error: "Some items are not archived" }, { status: 400 });
    }

    // Restore items from archive
    const result = await prisma.item.updateMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
        classification: ItemClassification.ARCHIVE,
      },
      data: {
        classification: ItemClassification.INBOX,
        archivedAt: null,
      },
    });

    logger.info("Bulk restore completed", { count: result.count, userId: session.user.id });

    return NextResponse.json({
      message: `Successfully restored ${result.count} item(s)`,
      count: result.count,
    });
  } catch (error) {
    logger.error("Error restoring items", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to restore items" },
      { status: 500 }
    );
  }
}
