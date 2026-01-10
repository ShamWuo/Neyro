import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/loading-state";

// Code splitting: Load analytics dashboard dynamically
const AnalyticsDashboard = dynamic(
  () => import("@/components/analytics-dashboard").then((mod) => ({ default: mod.AnalyticsDashboard })),
  {
    loading: () => <LoadingState type="card" />,
    ssr: true,
  }
);

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [items, projects, areas, reviews] = await Promise.all([
    prisma.item.findMany({ 
      where: { userId }, 
      select: { 
        id: true, 
        classification: true, 
        archivedAt: true, 
        isDone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" } 
    }),
    prisma.project.findMany({ 
      where: { userId }, 
      select: {
        id: true,
        status: true,
        archivedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" } 
    }),
    prisma.area.findMany({ 
      where: { userId }, 
      select: {
        id: true,
        name: true,
        lastHealthScore: true,
        lastReviewDate: true,
        updatedAt: true,
        archivedAt: true,
      },
      orderBy: { createdAt: "desc" } 
    }),
    prisma.weeklyReview.findMany({ 
      where: { userId }, 
      select: {
        id: true,
        userId: true,
        inboxCount: true,
        activeProjectsCount: true,
        areaHealthAverage: true,
        shareToken: true,
        sharedAt: true,
        completedAt: true,
      },
      orderBy: { completedAt: "desc" }, 
      take: 52 
    }),
  ]);

  // Calculate metrics
  const completedProjects = projects.filter((p) => p.status === ProjectStatus.COMPLETED);
  const activeProjects = projects.filter((p) => p.status === ProjectStatus.ACTIVE && !p.archivedAt);
  const inboxItems = items.filter((i) => i.classification === ItemClassification.INBOX && !i.archivedAt);
  const completedItems = items.filter((i) => i.isDone);
  
  // Area health trends
  const areaHealthTrends = areas
    .filter((a) => a.lastHealthScore !== null)
    .map((a) => ({
      name: a.name,
      score: a.lastHealthScore!,
      date: a.lastReviewDate || a.updatedAt,
    }));

  // Project completion velocity
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const projectsThisMonth = completedProjects.filter((p) => p.updatedAt >= lastMonth).length;
  const projectsThisWeek = completedProjects.filter((p) => p.updatedAt >= lastWeek).length;

  // Review streak
  const sortedReviews = reviews.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  let reviewStreak = 0;
  if (sortedReviews.length > 0) {
    const lastReview = sortedReviews[0].completedAt;
    const daysSince = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 7) {
      reviewStreak = 1;
      for (let i = 1; i < sortedReviews.length; i++) {
        const daysBetween = Math.floor((sortedReviews[i - 1].completedAt.getTime() - sortedReviews[i].completedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysBetween <= 7) {
          reviewStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Average project duration
  const projectDurations = completedProjects
    .filter((p) => p.createdAt && p.updatedAt)
    .map((p) => {
      const duration = p.updatedAt.getTime() - p.createdAt.getTime();
      return Math.floor(duration / (1000 * 60 * 60 * 24)); // days
    });
  const avgProjectDuration = projectDurations.length > 0
    ? Math.round(projectDurations.reduce((a, b) => a + b, 0) / projectDurations.length)
    : 0;

  const metrics = {
    totalItems: items.length,
    inboxItems: inboxItems.length,
    completedItems: completedItems.length,
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    projectsThisMonth,
    projectsThisWeek,
    avgProjectDuration,
    reviewStreak,
    areaHealthTrends,
    areaHealthAverage: areaHealthTrends.length > 0
      ? areaHealthTrends.reduce((sum, a) => sum + a.score, 0) / areaHealthTrends.length
      : null,
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics & Insights</h1>
        <p className="text-sm text-[var(--text-secondary)]">Track your productivity patterns and progress.</p>
      </div>

      <AnalyticsDashboard metrics={metrics} reviews={reviews} />
    </div>
  );
}
