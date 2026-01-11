"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AICreditsWarningProps = {
  current: number;
  limit: number;
  className?: string;
};

export function AICreditsWarning({ current, limit, className = "" }: AICreditsWarningProps) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  // Show warning when credits are at 80% or below
  const warningThreshold = Math.floor(limit * 0.8);
  const percentage = (current / limit) * 100;
  const isLow = current >= warningThreshold;
  const isExceeded = current >= limit;

  // All hooks must be called before any early returns
  useEffect(() => {
    // Use setTimeout to defer state updates and avoid synchronous setState in effect
    const timer = setTimeout(() => {
      // Check if dismissed recently
      const dismissed = localStorage.getItem("ai-credits-warning-dismissed");
      if (dismissed && parseInt(dismissed, 10) > Date.now()) {
        setIsVisible(false);
        return;
      }

      // Only show if credits are low or exceeded
      if (!isLow && !isExceeded) {
        setIsVisible(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isLow, isExceeded]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("ai-credits-warning-dismissed", String(Date.now() + 6 * 60 * 60 * 1000)); // 6 hours
  };

  // Early return after all hooks
  if (!isVisible || (!isLow && !isExceeded)) return null;

  const remaining = Math.max(0, limit - current);

  return (
    <div
      className={`rounded-xl border-2 ${isExceeded
          ? "border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))]"
          : "border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,var(--surface))]"
        } p-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{isExceeded ? "⚠️" : "⚡"}</span>
            <h3 className="font-semibold text-[var(--text-primary)] text-base">
              {isExceeded ? "AI credits exhausted" : "AI credits running low"}
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-[var(--text-secondary)]">
              {isExceeded
                ? `You've used all ${limit} AI credits this month. Upgrade to Focus for unlimited AI classification.`
                : `You've used ${current} of ${limit} credits (${Math.round(percentage)}%). ${remaining} remaining this month.`}
            </p>
            <div className="w-full rounded-full bg-[var(--overlay)] h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${isExceeded
                    ? "bg-[var(--danger)]"
                    : percentage >= 90
                      ? "bg-[var(--warning)]"
                      : "bg-[var(--primary-strong)]"
                  }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>
          <Link
            href="/settings/billing"
            className="block w-full rounded-lg border-2 border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all active:scale-95 active:shadow-none touch-manipulation"
            onClick={() => router.push("/settings/billing")}
          >
            {isExceeded ? "Upgrade for Unlimited AI" : "Upgrade for Unlimited Credits"}
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-full p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--overlay)] active:bg-[var(--overlay-light)] touch-manipulation"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
