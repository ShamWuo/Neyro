import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { z } from "zod";

const reviewSchema = z.object({
  areaScores: z.array(z.object({ areaId: z.string(), score: z.number().min(1).max(5) })).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [inboxCount, activeProjects] = await Promise.all([
    prisma.item.count({ where: { userId: session.user.id, classification: ItemClassification.INBOX } }),
    prisma.project.count({ where: { userId: session.user.id, status: ProjectStatus.ACTIVE, archivedAt: null } }),
  ]);

  let areaHealthAverage: number | null = null;
  if (parsed.data.areaScores && parsed.data.areaScores.length > 0) {
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
      inboxCount,
      activeProjectsCount: activeProjects,
      areaHealthAverage,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
