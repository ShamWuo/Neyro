"use client";

import { useEffect, useState, memo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

type Suggestion = {
  id: string;
  type: "inbox" | "project" | "area" | "review" | "deadline";
  message: string;
  action?: string;
  href?: string;
};

export const SmartSuggestions = memo(function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await fetch("/api/suggestions");
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        // Silently fail - suggestions are non-critical
        logger.error("Error fetching suggestions", error instanceof Error ? error : new Error(String(error)));
      }
    }
    fetchSuggestions();
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
        Smart Suggestions
      </h3>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-3 text-sm"
          >
            <p className="text-[var(--text-secondary)]">{suggestion.message}</p>
            {suggestion.href && (
              <Link
                href={suggestion.href}
                className="mt-2 inline-block text-xs font-semibold text-[var(--primary-strong)] hover:underline"
              >
                {suggestion.action || "View"} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

