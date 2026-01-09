import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { subDays } from "date-fns";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const suggestions: Array<{ id: string; type: string; message: string; href?: string; action?: string }> = [];

    // Check inbox count
    const inboxCount = await prisma.item.count({
      where: { userId, classification: ItemClassification.INBOX, archivedAt: null },
    });

    if (inboxCount > 20) {
      suggestions.push({
        id: "inbox-overflow",
        type: "inbox",
        message: `Your inbox has ${inboxCount} items - time to classify?`,
        href: "/inbox",
        action: "Go to Inbox",
      });
    }

    // Check for projects without activity
    const weekAgo = subDays(new Date(), 7);
    const inactiveProjects = await prisma.project.findMany({
      where: {
        userId,
        status: ProjectStatus.ACTIVE,
        archivedAt: null,
        lastActivityAt: { lt: weekAgo },
      },
      take: 3,
    });

    inactiveProjects.forEach((project) => {
      const daysSince = Math.floor(
        (new Date().getTime() - new Date(project.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      suggestions.push({
        id: `project-inactive-${project.id}`,
        type: "project",
        message: `You haven't updated "${project.name}" in ${daysSince} days`,
        href: `/projects/${project.id}`,
        action: "View Project",
      });
    });

    // Check for upcoming deadlines
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const upcomingDeadlines = await prisma.project.findMany({
      where: {
        userId,
        status: ProjectStatus.ACTIVE,
        archivedAt: null,
        deadline: { not: null, lte: threeDaysFromNow, gte: new Date() },
      },
      take: 3,
    });

    upcomingDeadlines.forEach((project) => {
      suggestions.push({
        id: `deadline-${project.id}`,
        type: "deadline",
        message: `"${project.name}" deadline is approaching`,
        href: `/projects/${project.id}`,
        action: "View Project",
      });
    });

    // Check area health
    const lowHealthAreas = await prisma.area.findMany({
      where: {
        userId,
        archivedAt: null,
        lastHealthScore: { lte: 2 },
      },
      take: 3,
    });

    lowHealthAreas.forEach((area) => {
      suggestions.push({
        id: `area-health-${area.id}`,
        type: "area",
        message: `"${area.name}" health score is ${area.lastHealthScore || "low"} - check in?`,
        href: `/areas/${area.id}`,
        action: "View Area",
      });
    });

    // Check for missed reviews
    const lastReview = await prisma.weeklyReview.findFirst({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });

    if (lastReview) {
      const daysSinceReview = Math.floor(
        (new Date().getTime() - new Date(lastReview.completedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceReview > 7) {
        suggestions.push({
          id: "review-due",
          type: "review",
          message: `It's been ${daysSinceReview} days since your last weekly review`,
          href: "/review",
          action: "Start Review",
        });
      }
    } else {
      suggestions.push({
        id: "review-first",
        type: "review",
        message: "Start your first weekly review to track progress",
        href: "/review",
        action: "Start Review",
      });
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    logger.error("Error generating suggestions", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

