import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { validateId } from "@/lib/validation";
import { ItemClassification } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }
    
    let body: Record<string, unknown>;
    try {
      body = await request.json() as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    
    const updateData: Record<string, unknown> = {};
    if (body.classification) {
      // Validate classification is a valid enum value
      if (Object.values(ItemClassification).includes(body.classification as ItemClassification)) {
        updateData.classification = body.classification;
      } else {
        return NextResponse.json({ error: "Invalid classification" }, { status: 400 });
      }
    }
    if (body.archivedAt) {
      try {
        updateData.archivedAt = new Date(body.archivedAt as string);
      } catch {
        return NextResponse.json({ error: "Invalid archivedAt date" }, { status: 400 });
      }
    }
    if (body.projectId !== undefined) updateData.projectId = body.projectId || null;
    if (body.areaId !== undefined) updateData.areaId = body.areaId || null;
    if (body.resourceCollectionId !== undefined) updateData.resourceCollectionId = body.resourceCollectionId || null;
    if (body.isDone !== undefined) updateData.isDone = Boolean(body.isDone);
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? (() => {
        try {
          return new Date(body.dueDate as string);
        } catch {
          return null;
        }
      })() : null;
    }
    
    const item = await prisma.item.update({
      where: { id, userId: session.user.id },
      data: updateData,
    });
    
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    logger.error("Error updating item", error);
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
    
    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }
    
    await prisma.item.delete({ where: { id, userId: session.user.id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    logger.error("Error deleting item", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

