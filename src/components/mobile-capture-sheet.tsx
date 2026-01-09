"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "./ui/toast";
import { MobileBottomSheet } from "./mobile-bottom-sheet";
import { VoiceInputButton } from "./voice-input-button";

type MobileCaptureSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileCaptureSheet({ open, onClose }: MobileCaptureSheetProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [url, setUrl] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState<"NOTE" | "TASK" | "LINK">("NOTE");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVoiceTranscript = (text: string) => {
    if (!title) {
      setTitle(text);
    } else {
      setDetails((prev) => (prev ? `${prev}\n${text}` : text));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (details.trim()) formData.append("details", details.trim());
      if (url.trim()) {
        try {
          new URL(url.trim());
          formData.append("url", url.trim());
        } catch {
          showToast("Invalid URL format", "error");
          setLoading(false);
          return;
        }
      }
      if (dueDate) formData.append("dueDate", dueDate);
      formData.append("type", type);

      const res = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Failed to capture" }));
        throw new Error(json.error || "Failed to capture");
      }

      showToast("Item captured!", "success");
      setTitle("");
      setDetails("");
      setUrl("");
      setDueDate("");
      onClose();
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to capture", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileBottomSheet open={open} onClose={onClose} title="Quick Capture">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to capture?"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-base"
            autoFocus
            required
            disabled={loading}
          />
          <div className="mt-2">
            <VoiceInputButton onTranscript={handleVoiceTranscript} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional notes..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-base"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "NOTE" | "TASK" | "LINK")}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-base"
              disabled={loading}
            >
              <option value="NOTE">Note</option>
              <option value="TASK">Task</option>
              <option value="LINK">Link</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-base"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-base"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-base font-semibold text-[var(--text-primary)]"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex-1 rounded-lg border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-3 text-base font-semibold text-[var(--text-inverse)] disabled:opacity-50"
          >
            {loading ? "Capturing..." : "Capture"}
          </button>
        </div>
      </form>
    </MobileBottomSheet>
  );
}

