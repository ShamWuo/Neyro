import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { z } from "zod";
import { takeToken } from "@/lib/rateLimiter";
import { verifyBulkOwnership } from "@/lib/security";
import { validateId } from "@/lib/validation";
import { logger } from "@/lib/logger";

// Request size limit: 1MB
const MAX_REQUEST_SIZE = 1024 * 1024;

const reviewSchema = z.object({
  areaScores: z.array(z.object({ areaId: z.string().min(1).max(100), score: z.number().min(1).max(5) })).max(100).optional(),
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

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const [inboxCount, activeProjects] = await Promise.all([
      prisma.item.count({ where: { userId: session.user.id, classification: ItemClassification.INBOX } }),
      prisma.project.count({ where: { userId: session.user.id, status: ProjectStatus.ACTIVE, archivedAt: null } }),
    ]);

    let areaHealthAverage: number | null = null;
    if (parsed.data.areaScores && parsed.data.areaScores.length > 0) {
      // Validate all area IDs
      const areaIds = parsed.data.areaScores.map((a) => a.areaId);
      
      // Validate ID formats
      try {
        areaIds.forEach((id) => validateId(id));
      } catch {
        return NextResponse.json({ error: "Invalid area ID format" }, { status: 400 });
      }
      
      // Verify ownership of all areas
      const ownsAllAreas = await verifyBulkOwnership("area", areaIds, session.user.id);
      if (!ownsAllAreas) {
        logger.warn(`User ${session.user.id} attempted to review areas without full ownership`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      
      // Validate all scores are in range
      const allScoresValid = parsed.data.areaScores.every((a) => Number.isFinite(a.score) && a.score >= 1 && a.score <= 5);
      if (!allScoresValid) {
        return NextResponse.json({ error: "Invalid score values" }, { status: 400 });
      }
      
      const scores = parsed.data.areaScores.map((a) => a.score);
      areaHealthAverage = scores.reduce((a, b) => a + b, 0) / scores.length;
      
      await Promise.all(
        parsed.data.areaScores.map(({ areaId, score }) =>
          prisma.area.update({ where: { id: areaId, userId: session.user.id }, data: { lastReviewDate: new Date(), lastHealthScore: score } })
        )
      );
    }

    const record = await prisma.weeklyReview.create({
      data: {
        userId: session.user.id,
        inboxCount: Math.max(0, Math.floor(inboxCount)),
        activeProjectsCount: Math.max(0, Math.floor(activeProjects)),
        areaHealthAverage: areaHealthAverage !== null ? Math.max(0, Math.min(5, areaHealthAverage)) : null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    logger.error("Error creating weekly review", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
