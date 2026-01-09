"use client";

import { format } from "date-fns";
import { WeeklyReview } from "@prisma/client";

type Metrics = {
  totalItems: number;
  inboxItems: number;
  completedItems: number;
  activeProjects: number;
  completedProjects: number;
  projectsThisMonth: number;
  projectsThisWeek: number;
  avgProjectDuration: number;
  reviewStreak: number;
  areaHealthTrends: Array<{ name: string; score: number; date: Date }>;
  areaHealthAverage: number | null;
};

type AnalyticsDashboardProps = {
  metrics: Metrics;
  reviews: WeeklyReview[];
};

export function AnalyticsDashboard({ metrics, reviews }: AnalyticsDashboardProps) {
  const completionRate = metrics.totalItems > 0 
    ? ((metrics.completedItems / metrics.totalItems) * 100).toFixed(1) 
    : "0";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <div className="text-sm text-[var(--text-secondary)]">Total Projects</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{metrics.completedProjects + metrics.activeProjects}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            {metrics.completedProjects} completed, {metrics.activeProjects} active
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <div className="text-sm text-[var(--text-secondary)]">Items Processed</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{metrics.totalItems}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            {metrics.completedItems} done, {metrics.inboxItems} in inbox
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <div className="text-sm text-[var(--text-secondary)]">Completion Rate</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{completionRate}%</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            {metrics.totalItems - metrics.completedItems} remaining
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
          <div className="text-sm text-[var(--text-secondary)]">Review Streak</div>
          <div className="text-3xl font-bold text-[var(--text-primary)]">{metrics.reviewStreak}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">
            {reviews.length} total reviews
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Project Velocity</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-secondary)]">This Week</span>
              <span className="text-lg font-semibold text-[var(--text-primary)]">{metrics.projectsThisWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-secondary)]">This Month</span>
              <span className="text-lg font-semibold text-[var(--text-primary)]">{metrics.projectsThisMonth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Avg Duration</span>
              <span className="text-lg font-semibold text-[var(--text-primary)]">
                {metrics.avgProjectDuration > 0 ? `${metrics.avgProjectDuration} days` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Area Health</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Average Score</span>
              <span className="text-lg font-semibold text-[var(--text-primary)]">
                {metrics.areaHealthAverage !== null ? metrics.areaHealthAverage.toFixed(1) : "N/A"} / 5.0
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {metrics.areaHealthTrends.map((area) => (
                <div key={area.name} className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{area.name}</span>
                  <span className="text-[var(--text-primary)]">{area.score}/5</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Reviews</h2>
        <div className="space-y-2">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-secondary)]">
                {format(new Date(review.completedAt), "MMM d, yyyy")}
              </span>
              <div className="flex gap-4 text-xs">
                <span>Inbox: {review.inboxCount}</span>
                <span>Projects: {review.activeProjectsCount}/7</span>
                {review.areaHealthAverage !== null && (
                  <span>Health: {review.areaHealthAverage.toFixed(1)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
