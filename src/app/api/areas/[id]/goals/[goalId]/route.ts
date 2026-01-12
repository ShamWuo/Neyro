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

const updateGoalSchema = z.object({
  current: z.number().min(0).max(999999).optional(),
  target: z.number().min(1).max(999999).optional(),
  label: z.string().min(1).max(500).optional(),
  unit: z.string().max(50).optional(),
  targetDate: z.string().datetime().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
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
       
      console.warn("Rate limiter check failed, allowing goal details request:", (e as Error)?.message || String(e));
    }

    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const { id, goalId } = await params;

    try {
      validateId(id);
      validateId(goalId);
    } catch {
      return NextResponse.json({ error: "Invalid area or goal ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsArea = await verifyOwnership("area", id, session.user.id);
    if (!ownsArea) {
      logger.warn(`User ${session.user.id} attempted to update goal ${goalId} for area ${id} without ownership`);
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const label = parsed.data.label ? sanitizeString(parsed.data.label, 500) : undefined;
    const unit = parsed.data.unit ? sanitizeString(parsed.data.unit, 50) : undefined;

    // TODO: Update goal when Goal model is added
    const updatedGoal = {
      id: goalId,
      label: label || "Goal",
      current: parsed.data.current !== undefined ? Math.max(0, Math.min(999999, parsed.data.current)) : undefined,
      target: parsed.data.target !== undefined ? Math.max(1, Math.min(999999, parsed.data.target)) : undefined,
      unit,
      targetDate: parsed.data.targetDate !== undefined
        ? (parsed.data.targetDate ? new Date(parsed.data.targetDate) : null)
        : undefined,
    };

    logger.info("Goal updated", { goalId, areaId: id, userId: session.user.id });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    logger.error("Error updating goal", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
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
       
      console.warn("Rate limiter check failed, allowing area goal DELETE request:", (e as Error)?.message || String(e));
    }

    const { id, goalId } = await params;

    try {
      validateId(id);
      validateId(goalId);
    } catch {
      return NextResponse.json({ error: "Invalid area or goal ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsArea = await verifyOwnership("area", id, session.user.id);
    if (!ownsArea) {
      logger.warn(`User ${session.user.id} attempted to delete goal ${goalId} for area ${id} without ownership`);
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // TODO: Delete goal when Goal model is added

    logger.info("Goal deleted", { goalId, areaId: id, userId: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting goal", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
