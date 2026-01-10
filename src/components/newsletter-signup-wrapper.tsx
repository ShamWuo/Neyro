"use client";

import dynamic from "next/dynamic";

// Client wrapper to use ssr: false - prevents hydration mismatch
// Use default export pattern for better chunk loading
export const NewsletterSignupWrapper = dynamic(
  () => import("./newsletter-signup").then((mod) => mod.NewsletterSignup),
  {
    loading: () => (
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="h-10 flex-1 border border-[var(--border-default)] bg-[var(--surface)] rounded animate-pulse" />
          <div className="h-10 w-24 border border-[var(--border-default)] bg-[var(--surface)] rounded animate-pulse" />
        </div>
      </div>
    ),
    ssr: false, // Disable SSR to prevent hydration mismatch with interactive client component
  }
);


