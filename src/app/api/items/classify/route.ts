import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { classifyItem } from "@/lib/para";
import { ItemClassification } from "@prisma/client";
import { z } from "zod";
import { takeToken } from "@/lib/rateLimiter";
import { verifyOwnership } from "@/lib/security";
import { validateId } from "@/lib/validation";
import { logger } from "@/lib/logger";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const classifySchema = z.object({
  itemId: z.string().min(1).max(100),
  classification: z.nativeEnum(ItemClassification),
  projectId: z.string().max(100).optional(),
  areaId: z.string().max(100).optional(),
  resourceCollectionId: z.string().max(100).optional(),
});

export async function POST(request: Request) {
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = classifySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    // Validate IDs
    try {
      validateId(parsed.data.itemId);
    } catch {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    // Verify ownership of item
    const ownsItem = await verifyOwnership("item", parsed.data.itemId, session.user.id);
    if (!ownsItem) {
      logger.warn(`User ${session.user.id} attempted to classify item ${parsed.data.itemId} without ownership`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Verify ownership of target resources if provided
    if (parsed.data.projectId) {
      try {
        validateId(parsed.data.projectId);
        const ownsProject = await verifyOwnership("project", parsed.data.projectId, session.user.id);
        if (!ownsProject) {
          return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
      }
    }

    if (parsed.data.areaId) {
      try {
        validateId(parsed.data.areaId);
        const ownsArea = await verifyOwnership("area", parsed.data.areaId, session.user.id);
        if (!ownsArea) {
          return NextResponse.json({ error: "Area not found" }, { status: 404 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid area ID" }, { status: 400 });
      }
    }

    if (parsed.data.resourceCollectionId) {
      try {
        validateId(parsed.data.resourceCollectionId);
        const ownsCollection = await verifyOwnership("resourceCollection", parsed.data.resourceCollectionId, session.user.id);
        if (!ownsCollection) {
          return NextResponse.json({ error: "Resource collection not found" }, { status: 404 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid resource collection ID" }, { status: 400 });
      }
    }

    await classifyItem({
      itemId: parsed.data.itemId,
      userId: session.user.id,
      classification: parsed.data.classification,
      projectId: parsed.data.projectId,
      areaId: parsed.data.areaId,
      resourceCollectionId: parsed.data.resourceCollectionId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Error classifying item", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
