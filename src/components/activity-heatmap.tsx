"use client";

import { useMemo } from "react";

type ActivityData = {
  date: string;
  count: number;
};

type ActivityHeatmapProps = {
  data: ActivityData[];
  year?: number;
};

export function ActivityHeatmap({ data, year = new Date().getFullYear() }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    const daysInYear = (year: number) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
    };

    const startDate = new Date(year, 0, 1);
    const totalDays = daysInYear(year);
    const heatmap: { date: Date; count: number }[] = [];

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const activity = data.find((d) => d.date === dateStr);
      heatmap.push({
        date,
        count: activity?.count || 0,
      });
    }

    return heatmap;
  }, [data, year]);

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-[var(--surface-muted)]";
    if (count <= 2) return "bg-[var(--primary-weak)]";
    if (count <= 5) return "bg-[var(--primary)]";
    return "bg-[var(--primary-strong)]";
  };

  const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>Activity in {year}</span>
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded bg-[var(--surface-muted)]" />
            <div className="h-3 w-3 rounded bg-[var(--primary-weak)]" />
            <div className="h-3 w-3 rounded bg-[var(--primary)]" />
            <div className="h-3 w-3 rounded bg-[var(--primary-strong)]" />
          </div>
          <span>More</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {heatmapData.map((day, idx) => (
          <div
            key={idx}
            className={`h-3 w-3 rounded ${getIntensity(day.count)} transition hover:scale-125`}
            title={`${day.date.toLocaleDateString()}: ${day.count} activities`}
            style={{
              opacity: day.count > 0 ? 0.5 + (day.count / maxCount) * 0.5 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
