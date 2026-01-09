import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

const updateTagsSchema = z.object({
  tagIds: z.array(z.string()),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

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

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

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
    const item = await prisma.item.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Verify all tags belong to user (if any tags provided)
    if (parsed.data.tagIds.length > 0) {
      const userTags = await prisma.tag.findMany({
        where: {
          id: { in: parsed.data.tagIds },
          userId: session.user.id,
        },
      });

      if (userTags.length !== parsed.data.tagIds.length) {
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

