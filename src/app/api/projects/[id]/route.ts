import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureProjectLimit } from "@/lib/para";
import { ProjectStatus } from "@prisma/client";
import { z } from "zod";
import { isAllowed } from "@/lib/rate-limiter";
import { verifyOwnership } from "@/lib/security";
import { validateId } from "@/lib/validation";
import { sanitizeString } from "@/lib/validation";
import { logger } from "@/lib/logger";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const updateSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  outcome: z.string().min(1).max(2000).optional(),
  deadline: z.string().datetime().nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  archive: z.boolean().optional(),
});

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limiting
    try {
      const allowed = await isAllowed(`user:${session.user.id}`, 12, 60_000);
      if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    } catch (e) {
       
      console.warn("Rate limiter check failed, allowing project detail request:", (e as Error)?.message || String(e));
    }

    // Check request size
    const contentLength = _req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await _req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { id } = await params;

    try {
      validateId(id);
    } catch {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Verify ownership
    const ownsProject = await verifyOwnership("project", id, session.user.id);
    if (!ownsProject) {
      logger.warn(`User ${session.user.id} attempted to update project ${id} without ownership`);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (parsed.data.status === ProjectStatus.ACTIVE && project.status !== ProjectStatus.ACTIVE) {
      await ensureProjectLimit(session.user.id);
    }

    // Sanitize inputs
    const name = parsed.data.name ? sanitizeString(parsed.data.name, 500) : project.name;
    const outcome = parsed.data.outcome ? sanitizeString(parsed.data.outcome, 2000) : project.outcome;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name,
        outcome,
        deadline: parsed.data.deadline === undefined ? project.deadline : parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        status: parsed.data.status ?? project.status,
        archivedAt: parsed.data.archive ? new Date() : project.archivedAt,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Error updating project", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
