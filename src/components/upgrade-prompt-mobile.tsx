"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UpgradePromptMobileProps = {
  trigger: "project_limit" | "ai_credits" | "export" | "template" | "feature";
  current?: number;
  limit?: number;
  feature?: string;
  className?: string;
  onDismiss?: () => void;
};

export function UpgradePromptMobile({
  trigger,
  current,
  limit,
  feature,
  className = "",
  onDismiss,
}: UpgradePromptMobileProps) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage for 24 hours
    const dismissedUntil = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(`upgrade-prompt-dismissed-${trigger}`, String(dismissedUntil));
    onDismiss?.();
  };

  useEffect(() => {
    // Check if dismissed recently
    const dismissedUntil = localStorage.getItem(`upgrade-prompt-dismissed-${trigger}`);
    if (dismissedUntil && parseInt(dismissedUntil, 10) > Date.now()) {
      setTimeout(() => setIsVisible(false), 0);
    }
  }, [trigger]);

  if (!isVisible) return null;

  const messages: Record<typeof trigger, { title: string; description: string; cta: string }> = {
    project_limit: {
      title: "Project limit reached",
      description: `You have ${current} active projects (free tier limit: ${limit}). Upgrade to Focus to unlock 7 active projects.`,
      cta: "Upgrade to Focus",
    },
    ai_credits: {
      title: "AI credits running low",
      description: `You've used ${current} of ${limit} AI credits this month. Upgrade for unlimited AI classification.`,
      cta: "Unlock Unlimited AI",
    },
    export: {
      title: "Export requires Focus",
      description: "Advanced exports (PDF, CSV, JSON) are available on Focus. Export your data with beautiful formatting.",
      cta: "Upgrade to Export",
    },
    template: {
      title: "Templates require Focus",
      description: "Access project and area templates to get started faster. Save time with pre-built structures.",
      cta: "Unlock Templates",
    },
    feature: {
      title: `${feature || "This feature"} requires Focus`,
      description: "Upgrade to Focus to unlock all premium features including unlimited projects, AI credits, and advanced tools.",
      cta: "Upgrade Now",
    },
  };

  const message = messages[trigger];

  return (
    <div className={`rounded-xl border-2 border-[var(--primary-strong)] bg-gradient-to-br from-[var(--primary-weak)] to-[color-mix(in_srgb,var(--primary-strong)_15%,var(--surface))] p-4 shadow-[var(--elev-2)] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚀</span>
            <h3 className="font-semibold text-[var(--text-primary)] text-base">{message.title}</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{message.description}</p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <Link
              href="/settings/billing"
              className="flex-1 rounded-lg border-2 border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all active:scale-95 active:shadow-none touch-manipulation"
              onClick={() => router.push("/settings/billing")}
            >
              {message.cta}
            </Link>
            <button
              onClick={handleDismiss}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-all active:scale-95 active:shadow-none touch-manipulation sm:flex-none"
            >
              Later
            </button>
          </div>
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
