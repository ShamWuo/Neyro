"use client";

import { WeeklyReview } from "@prisma/client";
import { format } from "date-fns";

type AreaHealthChartProps = {
  areaName: string;
  reviews: WeeklyReview[];
  currentScore: number | null;
};

export function AreaHealthChart({ areaName, reviews, currentScore }: AreaHealthChartProps) {
  // Extract area scores from reviews (would need to be stored in review data)
  // For now, show current score and trend
  const scores = reviews
    .filter((r) => r.areaHealthAverage !== null)
    .map((r) => ({
      date: r.completedAt,
      score: r.areaHealthAverage!,
    }))
    .slice(-12); // Last 12 reviews

  const maxScore = 5;
  const minScore = 1;

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{areaName}</h3>
        <div className="text-lg font-bold text-[var(--text-primary)]">
          {currentScore !== null ? `${currentScore}/5` : "Not scored"}
        </div>
      </div>
      {scores.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-end gap-1 h-20">
            {scores.map((s, i) => {
              const height = ((s.score - minScore) / (maxScore - minScore)) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-[var(--primary-strong)] rounded-t transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                  title={`${format(new Date(s.date), "MMM d")}: ${s.score}/5`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
            <span>{scores.length > 0 ? format(new Date(scores[scores.length - 1].date), "MMM d") : ""}</span>
            <span>{scores.length > 0 ? format(new Date(scores[0].date), "MMM d") : ""}</span>
          </div>
        </div>
      )}
      {scores.length === 0 && (
        <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
          Complete weekly reviews to see health trends
        </p>
      )}
    </div>
  );
}

