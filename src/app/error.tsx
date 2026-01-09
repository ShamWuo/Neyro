"use client";

import { useEffect } from "react";
import Link from "next/link";
import { logger } from "@/lib/logger";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log error to error reporting service
    logger.error("Application error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6">
      <div className="max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-[var(--text-primary)]">Something went wrong</h1>
          <p className="text-sm text-[var(--text-secondary)]">We encountered an unexpected error. Please try again.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-inverse)] shadow-[var(--elev-1)] transition hover:-translate-y-[1px] hover:shadow-[var(--elev-2)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

