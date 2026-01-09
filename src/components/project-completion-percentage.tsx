"use client";

import { useMemo } from "react";

type ProjectCompletionPercentageProps = {
  totalItems: number;
  completedItems: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
};

export function ProjectCompletionPercentage({
  totalItems,
  completedItems,
  showLabel = true,
  size = "md",
}: ProjectCompletionPercentageProps) {
  const percentage = useMemo(() => {
    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
  }, [totalItems, completedItems]);

  const sizeClasses = {
    sm: "h-1.5 text-xs",
    md: "h-2 text-sm",
    lg: "h-3 text-base",
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Progress</span>
          <span className="font-semibold text-[var(--text-primary)]">{percentage}%</span>
        </div>
      )}
      <div className={`overflow-hidden rounded-full bg-[var(--surface-muted)] ${sizeClasses[size].split(" ")[0]}`}>
        <div
          className={`h-full bg-[var(--primary-strong)] transition-all duration-500 ease-out ${sizeClasses[size].split(" ")[0]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && totalItems > 0 && (
        <div className="text-xs text-[var(--text-tertiary)]">
          {completedItems} of {totalItems} items completed
        </div>
      )}
    </div>
  );
}

