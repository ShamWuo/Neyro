"use client";

import { useState } from "react";
import { showToast } from "./ui/toast";

type ArchiveCleanupProps = {
  oldItemsCount: number;
  onCleanup: (daysOld: number) => void;
};

export function ArchiveCleanup({ oldItemsCount, onCleanup }: ArchiveCleanupProps) {
  const [daysOld, setDaysOld] = useState(365);
  const [showDialog, setShowDialog] = useState(false);

  if (oldItemsCount === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">No old items to clean up</p>
      </div>
    );
  }

  const handleCleanup = async () => {
    if (
      !confirm(
        `This will permanently delete ${oldItemsCount} item(s) older than ${daysOld} days. This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      onCleanup(daysOld);
      showToast(`Cleaned up ${oldItemsCount} old item(s)`, "success");
      setShowDialog(false);
    } catch {
      showToast("Failed to clean up archive", "error");
    }
  };

  return (
    <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-weak)] p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Archive Cleanup Suggestion
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {oldItemsCount} archived item(s) are older than {daysOld} days and can be permanently deleted.
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="rounded-md border border-[var(--warning)] bg-[var(--warning)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--warning)]/90"
        >
          Review
        </button>
      </div>

      {showDialog && (
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Delete items older than (days)
            </label>
            <input
              type="number"
              min="30"
              max="3650"
              value={daysOld}
              onChange={(e) => setDaysOld(parseInt(e.target.value, 10) || 365)}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCleanup}
              className="flex-1 rounded-md border border-[var(--danger)] bg-[var(--danger)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--danger)]/90"
            >
              Delete {oldItemsCount} Item(s)
            </button>
            <button
              onClick={() => setShowDialog(false)}
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-default)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
