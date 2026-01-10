"use client";

import { useState } from "react";
import { showToast } from "./ui/toast";

type BulkRestoreProps = {
  selectedIds: string[];
  onRestored: () => void;
  onCancel: () => void;
};

export function BulkRestore({ selectedIds, onRestored, onCancel }: BulkRestoreProps) {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/archive/bulk-restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to restore items" }));
        throw new Error(error.error || "Failed to restore items");
      }

      showToast(`Successfully restored ${selectedIds.length} item(s)`, "success");
      onRestored();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to restore items";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRestore}
        disabled={loading || selectedIds.length === 0}
        className="rounded-md border border-[var(--success)] bg-[var(--success)] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[var(--success)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? `Restoring ${selectedIds.length}...` : `Restore ${selectedIds.length}`}
      </button>
      <button
        onClick={onCancel}
        disabled={loading}
        className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--card-muted)] disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
