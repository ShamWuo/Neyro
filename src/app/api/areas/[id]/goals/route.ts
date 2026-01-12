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

const goalSchema = z.object({
  label: z.string().min(1).max(500),
  target: z.number().min(1).max(999999), // Reasonable max for targets
  current: z.number().min(0).max(999999).default(0),
  unit: z.string().max(50).optional(),
  targetDate: z.string().datetime().nullable().optional(),
});

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
      const allowed = await isAllowed(`user:${session.user.id}`, 12, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
       
      console.warn("Rate limiter check failed, allowing goals list request:", (e as Error)?.message || String(e));
    }

    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid area ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsArea = await verifyOwnership("area", id, session.user.id);
    if (!ownsArea) {
      logger.warn(`User ${session.user.id} attempted to fetch goals for area ${id} without ownership`);
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // TODO: Fetch goals when Goal model is added
    const goals: Array<{
      id: string;
      label: string;
      current: number;
      target: number;
      unit?: string;
      targetDate: Date | null;
    }> = [];

    return NextResponse.json(goals);
  } catch (error) {
    logger.error("Error fetching goals", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(
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
      const allowed = await isAllowed(`user:${session.user.id}`, 12, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
       
      console.warn("Rate limiter check failed, allowing area goals POST request:", (e as Error)?.message || String(e));
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
      return NextResponse.json({ error: "Invalid area ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const ownsArea = await verifyOwnership("area", id, session.user.id);
    if (!ownsArea) {
      logger.warn(`User ${session.user.id} attempted to create goal for area ${id} without ownership`);
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // Sanitize inputs
    const label = sanitizeString(parsed.data.label, 500);
    const unit = parsed.data.unit ? sanitizeString(parsed.data.unit, 50) : undefined;

    // TODO: Create goal when Goal model is added
    const goal = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label,
      current: Math.max(0, Math.min(999999, parsed.data.current ?? 0)),
      target: Math.max(1, Math.min(999999, parsed.data.target)),
      unit,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
    };

    logger.info("Goal created", { goalId: goal.id, areaId: id, userId: session.user.id });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    logger.error("Error creating goal", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
