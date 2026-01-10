"use client";

import { useMemo } from "react";
import { ProgressRing } from "./progress-ring";

type ProjectHealthData = {
  id: string;
  name: string;
  completionRate: number;
  daysSinceLastActivity: number;
  itemsCount: number;
  doneItemsCount: number;
  daysUntilDeadline: number | null;
};

type ProjectHealthScoreProps = {
  project: ProjectHealthData;
};

export function ProjectHealthScore({ project }: ProjectHealthScoreProps) {
  const healthScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;

    // Completion rate (0-40 points)
    score += (project.completionRate / 100) * 40;

    // Recent activity (0-30 points)
    if (project.daysSinceLastActivity <= 1) score += 30;
    else if (project.daysSinceLastActivity <= 3) score += 20;
    else if (project.daysSinceLastActivity <= 7) score += 10;
    else if (project.daysSinceLastActivity <= 14) score += 5;

    // Progress momentum (0-20 points)
    if (project.itemsCount > 0) {
      const activeItems = project.itemsCount - project.doneItemsCount;
      if (activeItems > 0) {
        score += Math.min(20, (project.doneItemsCount / project.itemsCount) * 20);
      } else if (project.itemsCount === project.doneItemsCount) {
        score += 20; // All items done
      }
    }

    // Deadline proximity (0-10 points, penalty if overdue)
    if (project.daysUntilDeadline !== null) {
      if (project.daysUntilDeadline < 0) {
        score -= 10; // Overdue penalty
      } else if (project.daysUntilDeadline <= 3) {
        score += 5; // Urgent but not overdue
      } else if (project.daysUntilDeadline <= 7) {
        score += 8;
      } else {
        score += 10;
      }
    } else {
      score += 5; // No deadline, neutral
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [project]);

  const getHealthLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-[var(--success)]" };
    if (score >= 60) return { label: "Good", color: "text-[var(--primary-strong)]" };
    if (score >= 40) return { label: "Fair", color: "text-[var(--warning)]" };
    return { label: "Needs Attention", color: "text-[var(--danger)]" };
  };

  const health = getHealthLabel(healthScore);

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Health Score</h3>
        <span className={`text-xs font-semibold ${health.color}`}>{health.label}</span>
      </div>
      <div className="flex items-center gap-4">
        <ProgressRing progress={healthScore} size={80} />
        <div className="space-y-1 text-xs text-[var(--text-secondary)]">
          <div>Completion: {project.completionRate}%</div>
          <div>Activity: {project.daysSinceLastActivity} days ago</div>
          {project.daysUntilDeadline !== null && (
            <div>
              Deadline: {project.daysUntilDeadline < 0 ? `${Math.abs(project.daysUntilDeadline)} days overdue` : `${project.daysUntilDeadline} days left`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
