"use client";

import { useState } from "react";
import { showToast } from "./ui/toast";

type SampleDataType = "project" | "area" | "item" | "all";

export function SampleDataGenerator({ onComplete }: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<SampleDataType>("all");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sample-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to generate sample data" }));
        throw new Error(error.error || "Failed to generate sample data");
      }

      const result = await res.json();
      showToast(`Sample data generated successfully: ${result.message}`, "success");
      onComplete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate sample data";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Generate Sample Data</h3>
        <p className="text-xs text-[var(--text-secondary)]">Populate your workspace with example projects, areas, and items to get started.</p>
      </div>
      <div className="flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as SampleDataType)}
          className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm"
          disabled={loading}
        >
          <option value="all">All (Projects, Areas, Items)</option>
          <option value="project">Projects Only</option>
          <option value="area">Areas Only</option>
          <option value="item">Items Only</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[var(--elev-2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}
