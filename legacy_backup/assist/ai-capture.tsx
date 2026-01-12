"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/components/ui/toast";
import { AIStatusIndicator } from "@/components/ai-status-indicator";
import { AICreditsWarning } from "@/components/ai-credits-warning";

export function AICaptureCard() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{ classification: string; title: string; id: string } | null>(null);
  const [creditsInfo, setCreditsInfo] = useState<{ remaining: number; limit: number } | null>(null);

  useEffect(() => {
    // Fetch credit info on mount
    fetch("/api/ai-credits")
      .then((res) => res.json())
      .then((data) => {
        if (data.remaining !== undefined && data.limit !== undefined) {
          setCreditsInfo({ remaining: data.remaining, limit: data.limit });
        }
      })
      .catch(() => {
        // Silently fail
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    setResult(null);
    const form = new FormData();
    form.append("text", text);
    if (file) form.append("image", file);

    try {
      const res = await fetch("/api/assist/ingest", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to ingest");
      }
      setResult({ classification: json.decision.classification, title: json.item.title, id: json.item.id });
      setStatus("done");
      
      // Update credits info if provided
      if (json.creditsRemaining !== undefined && json.creditsLimit !== undefined) {
        setCreditsInfo({ remaining: json.creditsRemaining, limit: json.creditsLimit });
      }
      
      // Show success message with AI status
      if (json.aiEnabled === false) {
        if (json.creditsRemaining === 0) {
          showToast("AI credits exhausted. Upgrade for unlimited AI.", "warning");
        } else {
          showToast("Item captured (AI not configured - using default classification)", "info");
        }
      } else {
        showToast(`Item captured and classified as ${json.decision.classification}`, "success");
      }
      
      setText("");
      setFile(null);
    } catch (err) {
      setStatus("error");
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  }

  return (
    <div className="panel space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">AI capture</p>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Send text or a photo; auto-classify to PARA</h2>
          <p className="text-xs text-[var(--text-secondary)]">We extract tasks/notes, pick a PARA bucket, and create the item for you.</p>
        </div>
        <AIStatusIndicator className="ml-4" />
      </div>
      {creditsInfo && creditsInfo.limit > 0 && creditsInfo.remaining <= 10 && creditsInfo.remaining >= 0 && (
        <AICreditsWarning
          current={creditsInfo.limit - creditsInfo.remaining}
          limit={creditsInfo.limit}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="ai-capture-text" className="sr-only">
            Describe what you captured
          </label>
          <textarea
            id="ai-capture-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe what you captured..."
            aria-label="Describe what you captured for AI classification"
            className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm rounded-lg resize-none touch-manipulation"
            rows={4}
            disabled={status === "loading"}
          />
        </div>
        <label htmlFor="ai-capture-file" className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <input
            id="ai-capture-file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            aria-label="Attach a photo (optional)"
            className="text-xs"
          />
          <span>{file ? file.name : "Optional: attach a photo"}</span>
        </label>
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={status === "loading" || (!text.trim() && !file)}
            className="w-full rounded-lg border-2 border-[var(--primary-strong)] bg-[var(--primary-strong)] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all active:scale-95 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {status === "loading" ? "Classifying..." : "Send to AI"}
          </button>
          {status === "done" && result && (
            <div className="rounded-lg border border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] p-3 text-sm">
              <p className="font-semibold text-[var(--success)] mb-1">✓ Item created</p>
              <p className="text-[var(--text-secondary)]">Classification: {result.classification}</p>
              <p className="text-[var(--text-secondary)]">Title: {result.title}</p>
            </div>
          )}
          {status === "error" && message && (
            <div className="rounded-lg border border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] p-3 text-sm text-[var(--danger)]">
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
