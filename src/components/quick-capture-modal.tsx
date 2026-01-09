"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "./ui/toast";

export function QuickCaptureModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "i" && !e.shiftKey) {
        e.preventDefault();
        previousActiveElementRef.current = document.activeElement as HTMLElement;
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setTitle("");
        setUrl("");
      }
    }

    function handleOpen() {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      setOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("quick-capture:open", handleOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("quick-capture:open", handleOpen);
    };
  }, [open]);

  // Focus management: trap focus in modal and restore on close
  useEffect(() => {
    if (open) {
      // Focus the input when modal opens
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);

      // Trap focus within modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        
        const modal = document.querySelector('[role="dialog"][aria-label="Quick capture"]') as HTMLElement;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleTabKey);
      return () => {
        document.removeEventListener("keydown", handleTabKey);
        // Restore focus to previous element
        previousActiveElementRef.current?.focus();
      };
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      
      const trimmedUrl = url.trim();
      if (trimmedUrl) {
        // Basic URL validation
        try {
          new URL(trimmedUrl);
          formData.append("url", trimmedUrl);
        } catch {
          showToast("Invalid URL format", "error");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Failed to capture" }));
        throw new Error(json.error || "Failed to capture");
      }

      showToast("Item captured to inbox", "success");
      setTitle("");
      setUrl("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to capture item";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm"
      onClick={() => {
        setOpen(false);
        setTitle("");
        setUrl("");
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Quick capture"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[var(--elev-3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Quick Capture</h2>
          <button
            onClick={() => {
              setOpen(false);
              setTitle("");
              setUrl("");
            }}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="quick-title" className="sr-only">
              Title
            </label>
            <input
              ref={titleInputRef}
              id="quick-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task, note, or link"
              className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
              required
              disabled={loading}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="quick-url" className="sr-only">
              URL (optional)
            </label>
            <input
              id="quick-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL (optional)"
              className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[var(--elev-2)] disabled:opacity-50"
            >
              {loading ? "Capturing..." : "Capture to Inbox"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTitle("");
                setUrl("");
              }}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--border-strong)]"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">Press Ctrl/Cmd+I to open, Esc to close</p>
        </form>
      </div>
    </div>
  );
}

