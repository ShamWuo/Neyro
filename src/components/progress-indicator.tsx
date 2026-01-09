"use client";

type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
};

export function ProgressIndicator({ currentStep, totalSteps, labels, className }: ProgressIndicatorProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {labels && labels.length > 0 && (
        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
          {labels.map((label, index) => (
            <span
              key={index}
              className={index + 1 <= currentStep ? "font-semibold text-[var(--text-primary)]" : ""}
            >
              {label}
            </span>
          ))}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full bg-[var(--primary-strong)] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-[var(--text-tertiary)] text-center">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}

