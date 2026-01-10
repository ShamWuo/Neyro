"use client";

import { useMemo } from "react";
import Link from "next/link";

type ProjectDeadline = {
  id: string;
  name: string;
  deadline: Date;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  isOverdue: boolean;
};

type ProjectDeadlineCalendarProps = {
  deadlines: ProjectDeadline[];
  currentDate?: Date;
};

export function ProjectDeadlineCalendar({
  deadlines,
  currentDate = new Date(),
}: ProjectDeadlineCalendarProps) {
  const groupedDeadlines = useMemo(() => {
    const groups: Record<string, ProjectDeadline[]> = {};

    deadlines.forEach((deadline) => {
      const dateStr = deadline.deadline.toISOString().split("T")[0];
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(deadline);
    });

    return groups;
  }, [deadlines]);

  const upcomingDeadlines = useMemo(() => {
    const sorted = [...deadlines]
      .filter((d) => d.status === "ACTIVE")
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .slice(0, 7); // Next 7 days

    return sorted;
  }, [deadlines]);

  if (upcomingDeadlines.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">No upcoming deadlines</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Upcoming Deadlines</h3>
        <Link
          href="/projects"
          className="text-xs font-semibold text-[var(--primary-strong)] hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="space-y-2">
        {upcomingDeadlines.map((deadline) => {
          const daysUntil = Math.ceil(
            (deadline.deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Link
              key={deadline.id}
              href={`/projects/${deadline.id}`}
              className={`flex items-center justify-between rounded-md border p-3 transition hover:shadow-[var(--elev-1)] ${
                deadline.isOverdue
                  ? "border-[var(--danger)] bg-[var(--danger-weak)]"
                  : daysUntil <= 3
                  ? "border-[var(--warning)] bg-[var(--warning-weak)]"
                  : "border-[var(--border-subtle)] bg-[var(--card)]"
              }`}
            >
              <div className="flex-1">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {deadline.name}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">
                  {deadline.deadline.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div
                className={`text-xs font-semibold ${
                  deadline.isOverdue
                    ? "text-[var(--danger)]"
                    : daysUntil <= 3
                    ? "text-[var(--warning)]"
                    : "text-[var(--text-tertiary)]"
                }`}
              >
                {deadline.isOverdue
                  ? `${Math.abs(daysUntil)} days overdue`
                  : daysUntil === 0
                  ? "Today"
                  : daysUntil === 1
                  ? "Tomorrow"
                  : `${daysUntil} days`}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
