import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Protected cron endpoint to compute and store weekly reviews.
// Requires ADMIN_TOKEN in `x-admin-token` header or CRON_TOKEN env var.
export async function POST(request: Request) {
  try {
    const adminToken = process.env.ADMIN_TOKEN || process.env.CRON_TOKEN;
    const provided = request.headers.get("x-admin-token");
    if (!adminToken || provided !== adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({} as any));
    const targetUserId = typeof body.userId === 'string' && body.userId.trim() ? body.userId.trim() : null;

    const users = targetUserId ? [{ id: targetUserId }] : await prisma.user.findMany({ select: { id: true } });

    const results: Array<{ userId: string; created: boolean; error?: string }> = [];

    for (const u of users) {
      try {
        const userId = u.id;
        const inboxCount = await prisma.item.count({ where: { userId, classification: 'INBOX' } });
        const activeProjectsCount = await prisma.project.count({ where: { userId, status: 'ACTIVE', archivedAt: null } });

        // Compute area health average using latest area.lastHealthScore (nullable)
        const areas = await prisma.area.findMany({ where: { userId }, select: { lastHealthScore: true } });
        const scores = areas.map((a) => a.lastHealthScore).filter((s) => typeof s === 'number') as number[];
        const areaHealthAverage = scores.length ? scores.reduce((a,b) => a+b, 0) / scores.length : null;

        await prisma.weeklyReview.create({ data: { userId, inboxCount, activeProjectsCount, areaHealthAverage: areaHealthAverage ?? undefined } });
        results.push({ userId, created: true });
      } catch (e) {
        logger.error("weekly-review: failed for user", e);
        results.push({ userId: (u as any).id, created: false, error: (e as Error).message || String(e) });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    logger.error("weekly-review cron error", e);
    return NextResponse.json({ error: "Failed to run weekly review" }, { status: 500 });
  }
}

export const runtime = "nodejs";
