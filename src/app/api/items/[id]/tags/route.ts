import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { isAllowed } from "@/lib/rate-limiter";
import { verifyOwnership } from "@/lib/security";
import { validateId } from "@/lib/validation";
import { validateIdArray } from "@/lib/security";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const updateTagsSchema = z.object({
  tagIds: z.array(z.string().min(1).max(100)).max(50), // Max 50 tags per item
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting (prevent abuse)
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 20, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Rate limiter check failed, allowing item tags request:", e?.message || e);
    }

    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsItem = await verifyOwnership("item", id, session.user.id);
    if (!ownsItem) {
      logger.warn(`User ${session.user.id} attempted to fetch tags for item ${id} without ownership`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = await prisma.item.findUnique({
      where: { id, userId: session.user.id },
      include: {
        itemTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const tags = item.itemTags.map((it) => it.tag);
    return NextResponse.json(tags);
  } catch (error) {
    logger.error("Error fetching item tags", error);
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
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = updateTagsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Verify item belongs to user
    const ownsItem = await verifyOwnership("item", id, session.user.id);
    if (!ownsItem) {
      logger.warn(`User ${session.user.id} attempted to update tags for item ${id} without ownership`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Verify all tags belong to user (if any tags provided)
    if (parsed.data.tagIds.length > 0) {
      // Validate all tag IDs
      try {
        validateIdArray(parsed.data.tagIds, 50);
      } catch {
        return NextResponse.json({ error: "Invalid tag IDs" }, { status: 400 });
      }

      // Verify ownership of all tags
      const userTags = await prisma.tag.findMany({
        where: {
          id: { in: parsed.data.tagIds },
          userId: session.user.id,
        },
      });

      if (userTags.length !== parsed.data.tagIds.length) {
        logger.warn(`User ${session.user.id} attempted to use tags not owned by them`);
        return NextResponse.json({ error: "Invalid tags" }, { status: 400 });
      }
    }

    // Delete existing item tags
    await prisma.itemTag.deleteMany({
      where: { itemId: id },
    });

    // Create new item tags
    if (parsed.data.tagIds.length > 0) {
      await prisma.itemTag.createMany({
        data: parsed.data.tagIds.map((tagId) => ({
          itemId: id,
          tagId,
        })),
      });
    }

    const updatedItem = await prisma.item.findUnique({
      where: { id },
      include: {
        itemTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(updatedItem?.itemTags.map((it) => it.tag) || []);
  } catch (error) {
    logger.error("Error updating item tags", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

