"use client";

import { useRouter } from "next/navigation";
import { showToast } from "./ui/toast";
import { useState, memo, useCallback } from "react";

type InboxItemActionsProps = {
  itemId: string;
};

export const InboxItemActions = memo(function InboxItemActions({ itemId }: InboxItemActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!itemId) return;
    if (!confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to delete" }));
        throw new Error(error.error || "Failed to delete");
      }
      showToast("Item deleted", "success");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete item";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [itemId, router]);

  const handleArchive = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classification: "ARCHIVE", archivedAt: new Date().toISOString() }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to archive" }));
        throw new Error(error.error || "Failed to archive");
      }
      showToast("Item archived", "success");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to archive item";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [itemId, router]);

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <button
        onClick={handleArchive}
        disabled={loading}
        className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-1 text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:opacity-50"
      >
        Archive
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-1 text-[var(--danger)] transition hover:border-[var(--danger)] hover:bg-[var(--danger-weak)] disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
});

