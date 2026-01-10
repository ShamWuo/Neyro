"use client";

import { useMemo } from "react";
import Link from "next/link";

type AreaHealthData = {
  id: string;
  name: string;
  healthScore: number;
  lastReviewDate: Date | null;
  itemsCount: number;
};

type AreaComparisonProps = {
  areas: AreaHealthData[];
};

export function AreaComparison({ areas }: AreaComparisonProps) {
  const sortedAreas = useMemo(() => {
    return [...areas].sort((a, b) => b.healthScore - a.healthScore);
  }, [areas]);

  const averageHealth = useMemo(() => {
    if (areas.length === 0) return 0;
    const sum = areas.reduce((acc, area) => acc + area.healthScore, 0);
    return Math.round(sum / areas.length);
  }, [areas]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-[var(--success)] bg-[var(--success-weak)] border-[var(--success)]";
    if (score >= 60) return "text-[var(--primary-strong)] bg-[var(--primary-weak)] border-[var(--primary-strong)]";
    if (score >= 40) return "text-[var(--warning)] bg-[var(--warning-weak)] border-[var(--warning)]";
    return "text-[var(--danger)] bg-[var(--danger-weak)] border-[var(--danger)]";
  };

  if (areas.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">No areas to compare</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Area Health Comparison</h3>
        <div className="text-xs text-[var(--text-secondary)]">
          Avg: <span className="font-semibold text-[var(--text-primary)]">{averageHealth}</span>
        </div>
      </div>

      <div className="space-y-3">
        {sortedAreas.map((area) => (
          <Link
            key={area.id}
            href={`/areas/${area.id}`}
            className="block rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-3 transition hover:border-[var(--border-default)] hover:shadow-[var(--elev-1)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">{area.name}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${getHealthColor(area.healthScore)}`}
              >
                {area.healthScore}
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  area.healthScore >= 80
                    ? "bg-[var(--success)]"
                    : area.healthScore >= 60
                    ? "bg-[var(--primary-strong)]"
                    : area.healthScore >= 40
                    ? "bg-[var(--warning)]"
                    : "bg-[var(--danger)]"
                }`}
                style={{ width: `${area.healthScore}%` }}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
              <span>{area.itemsCount} items</span>
              {area.lastReviewDate && (
                <span>Reviewed {new Date(area.lastReviewDate).toLocaleDateString()}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
