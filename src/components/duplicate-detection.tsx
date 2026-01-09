"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

type DuplicateDetectionProps = {
  title: string;
  details?: string | null;
  onDuplicateFound?: (similarItems: Array<{ id: string; title: string; classification: string }>) => void;
};

export function useDuplicateDetection({ title, details, onDuplicateFound }: DuplicateDetectionProps) {
  const [similarItems, setSimilarItems] = useState<Array<{ id: string; title: string; classification: string }>>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!title || title.length < 3) {
      setSimilarItems([]);
      return;
    }

    const checkDuplicates = async () => {
      setChecking(true);
      try {
        const res = await fetch(`/api/items/duplicates?title=${encodeURIComponent(title)}${details ? `&details=${encodeURIComponent(details)}` : ""}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.similar && data.similar.length > 0) {
          setSimilarItems(data.similar);
          if (onDuplicateFound) {
            onDuplicateFound(data.similar);
          }
        } else {
          setSimilarItems([]);
        }
      } catch (error) {
        logger.error("Error checking duplicates", error instanceof Error ? error : new Error(String(error)));
      } finally {
        setChecking(false);
      }
    };

    const timeoutId = setTimeout(checkDuplicates, 500);
    return () => clearTimeout(timeoutId);
  }, [title, details, onDuplicateFound]);

  return { similarItems, checking };
}

export function DuplicateWarning({ similarItems, onDismiss, onViewItem }: {
  similarItems: Array<{ id: string; title: string; classification: string }>;
  onDismiss?: () => void;
  onViewItem?: (id: string) => void;
}) {
  if (similarItems.length === 0) return null;

  return (
    <div className="rounded-md border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-semibold text-[var(--warning)] mb-1">Similar items found</p>
          <p className="text-[var(--text-secondary)] mb-2">
            You may have already captured something similar:
          </p>
          <ul className="space-y-1">
            {similarItems.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <span className="text-[var(--text-primary)]">{item.title}</span>
                <span className="text-xs text-[var(--text-tertiary)]">({item.classification})</span>
                {onViewItem && (
                  <button
                    onClick={() => onViewItem(item.id)}
                    className="text-xs text-[var(--primary-strong)] underline"
                  >
                    View
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

