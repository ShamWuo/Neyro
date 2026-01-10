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

const milestoneSchema = z.object({
  name: z.string().min(1).max(500),
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
      takeToken(`user:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { id } = await params;
    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsProject = await verifyOwnership("project", id, session.user.id);
    if (!ownsProject) {
      logger.warn(`User ${session.user.id} attempted to fetch milestones for project ${id} without ownership`);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // For now, milestones are stored as metadata or in a separate table
    // Since we don't have a Milestone model, we'll use metadata
    // In production, you'd want to create a proper Milestone model
    const milestones: Array<{
      id: string;
      name: string;
      targetDate: Date | null;
      completed: boolean;
      completedAt: Date | null;
    }> = [];

    // TODO: Implement when Milestone model is added to schema
    // For now, return empty array

    return NextResponse.json(milestones);
  } catch (error) {
    logger.error("Error fetching milestones", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
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
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = milestoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify ownership
    const ownsProject = await verifyOwnership("project", id, session.user.id);
    if (!ownsProject) {
      logger.warn(`User ${session.user.id} attempted to create milestone for project ${id} without ownership`);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Sanitize milestone name
    const name = sanitizeString(parsed.data.name, 500);

    // TODO: Create milestone when Milestone model is added
    // For now, return a mock milestone
    const milestone = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      completed: false,
      completedAt: null,
    };

    logger.info("Milestone created", { milestoneId: milestone.id, projectId: id, userId: session.user.id });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    logger.error("Error creating milestone", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}
