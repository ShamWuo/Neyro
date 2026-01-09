"use client";

import { useRouter } from "next/navigation";
import { showToast } from "./ui/toast";
import { useState } from "react";

export function useInboxActions() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function deleteItem(itemId: string) {
    setLoading(itemId);
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Item deleted", "success");
      router.refresh();
    } catch {
      showToast("Failed to delete item", "error");
    } finally {
      setLoading(null);
    }
  }

  async function archiveItem(itemId: string) {
    setLoading(itemId);
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classification: "ARCHIVE", archivedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Failed to archive");
      showToast("Item archived", "success");
      router.refresh();
    } catch {
      showToast("Failed to archive item", "error");
    } finally {
      setLoading(null);
    }
  }

  return { deleteItem, archiveItem, loading };
}

