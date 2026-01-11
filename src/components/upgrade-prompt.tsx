"use client";

import Link from "next/link";
import { useState } from "react";

interface UpgradePromptProps {
  reason: "projects" | "ai-credits" | "exports" | "templates";
  current?: number;
  limit?: number;
  onDismiss?: () => void;
}

export function UpgradePrompt({ reason, limit, onDismiss }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const messages = {
    projects: {
      title: "Unlock 7 Active Projects",
      description: `You've reached the free tier limit of ${limit || 3} active projects. Upgrade to Focus to unlock 7 active projects and unlimited AI credits.`,
      cta: "Upgrade to Focus",
    },
    "ai-credits": {
      title: "Unlimited AI Credits",
      description: `You've used all ${limit || 50} AI credits this month. Upgrade to Focus for unlimited AI assistance.`,
      cta: "Upgrade to Focus",
    },
    exports: {
      title: "Unlock Exports",
      description: "Export your data as JSON, CSV, or PDF. Available with Focus plan.",
      cta: "Upgrade to Focus",
    },
    templates: {
      title: "Unlock Templates",
      description: "Access project templates and create your own. Available with Focus plan.",
      cta: "Upgrade to Focus",
    },
  };

  const message = messages[reason];

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="rounded-md border border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_10%,var(--surface))] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--text-primary)]">{message.title}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{message.description}</p>
          <Link
            href="/pricing"
            className="mt-3 inline-block rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] transition hover:shadow-[var(--elev-2)]"
          >
            {message.cta}
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition"
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
