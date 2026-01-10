"use client";

type Goal = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
};

type GoalProgressTrackerProps = {
  goals: Goal[];
  title?: string;
};

export function GoalProgressTracker({ goals, title = "Goals" }: GoalProgressTrackerProps) {
  if (goals.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 text-center" role="status" aria-live="polite">
        <p className="text-sm text-[var(--text-secondary)]">No goals set yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-4">
      {title && (
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      )}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isComplete = goal.current >= goal.target;

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--text-primary)]">{goal.label}</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {goal.current} / {goal.target} {goal.unit || ""}
                </span>
              </div>
              <div 
                className="relative h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden"
                role="progressbar"
                aria-valuenow={goal.current}
                aria-valuemin={0}
                aria-valuemax={goal.target}
                aria-label={`${goal.label}: ${goal.current} of ${goal.target} ${goal.unit || ""}`}
              >
                <div
                  className={`h-full transition-all duration-500 ${
                    isComplete
                      ? "bg-[var(--success)]"
                      : progress >= 75
                      ? "bg-[var(--primary-strong)]"
                      : progress >= 50
                      ? "bg-[var(--primary)]"
                      : "bg-[var(--warning)]"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isComplete && (
                <p className="text-xs font-semibold text-[var(--success)]" role="status" aria-live="polite">
                  ✓ Goal achieved!
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
