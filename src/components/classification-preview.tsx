"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PARACategory = "project" | "area" | "resource" | "archive";

interface ClassificationResult {
  category: PARACategory;
  title: string;
  explanation: string;
}

export function ClassificationPreview({
  text,
  onConfirm,
}: {
  text: string;
  onConfirm: (classification: ClassificationResult) => void;
}) {
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text) return;

    const classify = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error("Classification failed");
        }

        const result = await response.json();
        setClassification(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    classify();
  }, [text]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 text-sm text-[var(--text-secondary)]">
        Classifying with AI...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_15%,var(--surface))] p-4 text-sm text-[var(--danger)]">
        {error}
      </div>
    );
  }

  if (!classification) {
    return null;
  }

  const categoryLabel: Record<PARACategory, string> = {
    project: "📌 Project",
    area: "🎯 Area",
    resource: "📚 Resource",
    archive: "📦 Archive",
  };

  const categoryColor: Record<PARACategory, string> = {
    project: "border-[var(--primary-strong)]",
    area: "border-[var(--accent)]",
    resource: "border-[var(--success)]",
    archive: "border-[var(--text-tertiary)]",
  };

  return (
    <div className={`rounded-lg border-2 ${categoryColor[classification.category]} bg-[var(--card)] p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{categoryLabel[classification.category]}</div>
        <span className="text-xs text-[var(--text-tertiary)]">{classification.explanation}</span>
      </div>
      <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">Suggested title</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{classification.title}</p>
      </div>
      <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">Content preview</p>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{text}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onConfirm(classification)}
          className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-[var(--text-inverse)] hover:shadow-[var(--elev-1)]"
        >
          ✓ Save to {categoryLabel[classification.category]}
        </button>
        <Link
          href="/inbox"
          className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-center text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]"
        >
          ✕ Cancel
        </Link>
      </div>
    </div>
  );
}
