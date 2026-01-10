import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureProjectLimit } from "@/lib/para";
import { ProjectStatus } from "@prisma/client";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { sanitizeString } from "@/lib/validation";
import { takeToken } from "@/lib/rateLimiter";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const projectSchema = z.object({
  name: z.string().min(1).max(500),
  outcome: z.string().min(1).max(2000),
  deadline: z.string().datetime().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id, archivedAt: null },
      select: {
        id: true,
        name: true,
        outcome: true,
        status: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
        lastActivityAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    logger.error("Error fetching projects", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const desiredStatus = parsed.data.status ?? ProjectStatus.ACTIVE;
    if (desiredStatus === ProjectStatus.ACTIVE) {
      await ensureProjectLimit(session.user.id);
    }

    // Sanitize inputs
    const name = sanitizeString(parsed.data.name, 500);
    const outcome = sanitizeString(parsed.data.outcome, 2000);

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name,
        outcome,
        status: desiredStatus,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    logger.error("Error creating project", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
