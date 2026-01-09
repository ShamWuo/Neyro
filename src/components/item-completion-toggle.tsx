"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "./ui/toast";

type ItemCompletionToggleProps = {
  itemId: string;
  isDone: boolean;
  className?: string;
};

export const ItemCompletionToggle = memo(function ItemCompletionToggle({ itemId, isDone, className = "" }: ItemCompletionToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isDone);

  const handleToggle = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone: !currentStatus }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update" }));
        throw new Error(error.error || "Failed to update");
      }

      setCurrentStatus(!currentStatus);
      showToast(currentStatus ? "Item marked as incomplete" : "Item marked as done", "success");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update item";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [itemId, currentStatus, router]);

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold transition ${
        currentStatus
          ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
          : "border-[var(--border-subtle)] bg-[var(--card)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
      } disabled:opacity-50 ${className}`}
      aria-label={currentStatus ? "Mark as incomplete" : "Mark as done"}
    >
      <span>{currentStatus ? "✓" : "○"}</span>
      <span>{currentStatus ? "Done" : "Mark done"}</span>
    </button>
  );
});

