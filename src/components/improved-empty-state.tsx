"use client";

import Link from "next/link";

type ImprovedEmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  tips?: string[];
};

export function ImprovedEmptyState({
  icon = "📭",
  title,
  description,
  action,
  secondaryAction,
  tips,
}: ImprovedEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-6 animate-bounce" style={{ animationDuration: "2s" }}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {action && (
            <Link
              href={action.href}
              onClick={action.onClick}
              className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-[var(--elev-2)] hover:scale-105"
            >
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              onClick={secondaryAction.onClick}
              className="rounded-md border-2 border-[var(--border-subtle)] bg-[var(--card)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-default)]"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="mt-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--card-muted)] p-4 max-w-md text-left">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
            Quick Tips
          </h4>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[var(--primary-strong)] mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
