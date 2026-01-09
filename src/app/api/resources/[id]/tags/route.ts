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
    if (!id) return NextResponse.json({ error: "Resource collection ID required" }, { status: 400 });

    const collection = await prisma.resourceCollection.findUnique({
      where: { id, userId: session.user.id },
      include: {
        resourceTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Resource collection not found" }, { status: 404 });
    }

    const tags = collection.resourceTags.map((rt) => rt.tag);
    return NextResponse.json(tags);
  } catch (error) {
    logger.error("Error fetching resource tags", error);
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
    if (!id) return NextResponse.json({ error: "Resource collection ID required" }, { status: 400 });

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

    // Verify resource collection belongs to user
    const collection = await prisma.resourceCollection.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!collection) {
      return NextResponse.json({ error: "Resource collection not found" }, { status: 404 });
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

    // Delete existing resource tags
    await prisma.resourceCollectionTag.deleteMany({
      where: { resourceCollectionId: id },
    });

    // Create new resource tags
    if (parsed.data.tagIds.length > 0) {
      await prisma.resourceCollectionTag.createMany({
        data: parsed.data.tagIds.map((tagId) => ({
          resourceCollectionId: id,
          tagId,
        })),
      });
    }

    const updatedCollection = await prisma.resourceCollection.findUnique({
      where: { id },
      include: {
        resourceTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const tags = updatedCollection?.resourceTags.map((rt) => rt.tag) || [];
    return NextResponse.json(tags);
  } catch (error) {
    logger.error("Error updating resource tags", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

