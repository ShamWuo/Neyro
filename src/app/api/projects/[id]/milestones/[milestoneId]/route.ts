import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { isAllowed } from "@/lib/rate-limiter";
import { verifyOwnership } from "@/lib/security";
import { validateId } from "@/lib/validation";
import { sanitizeString } from "@/lib/validation";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const updateMilestoneSchema = z.object({
  completed: z.boolean().optional(),
  name: z.string().min(1).max(500).optional(),
  targetDate: z.string().datetime().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 12, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Rate limiter check failed, allowing milestone request:", e?.message || e);
    }

    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const { id, milestoneId } = await params;
    
    try {
      validateId(id);
      validateId(milestoneId);
    } catch {
      return NextResponse.json({ error: "Invalid project or milestone ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsProject = await verifyOwnership("project", id, session.user.id);
    if (!ownsProject) {
      logger.warn(`User ${session.user.id} attempted to update milestone ${milestoneId} for project ${id} without ownership`);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = updateMilestoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Sanitize milestone name if provided
    const name = parsed.data.name ? sanitizeString(parsed.data.name, 500) : undefined;

    // TODO: Update milestone when Milestone model is added
    // For now, return a mock updated milestone
    const updatedMilestone = {
      id: milestoneId,
      name: name || "Milestone",
      targetDate: parsed.data.targetDate !== undefined 
        ? (parsed.data.targetDate ? new Date(parsed.data.targetDate) : null)
        : null,
      completed: parsed.data.completed ?? false,
      completedAt: parsed.data.completed ? new Date() : null,
    };

    logger.info("Milestone updated", { milestoneId, projectId: id, userId: session.user.id });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    logger.error("Error updating milestone", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
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

    const { id, milestoneId } = await params;

    try {
      validateId(id);
      validateId(milestoneId);
    } catch {
      return NextResponse.json({ error: "Invalid project or milestone ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsProject = await verifyOwnership("project", id, session.user.id);
    if (!ownsProject) {
      logger.warn(`User ${session.user.id} attempted to delete milestone ${milestoneId} for project ${id} without ownership`);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // TODO: Delete milestone when Milestone model is added

    logger.info("Milestone deleted", { milestoneId, projectId: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting milestone", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
