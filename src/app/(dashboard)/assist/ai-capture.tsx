"use client";

import { useState } from "react";

export function AICaptureCard() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{ classification: string; title: string; id: string } | null>(null);

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
      setText("");
      setFile(null);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="panel space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">AI capture</p>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Send text or a photo; auto-classify to PARA</h2>
          <p className="text-xs text-[var(--text-secondary)]">We extract tasks/notes, pick a PARA bucket, and create the item for you.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe what you captured..."
          className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm"
          rows={3}
        />
        <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          <span>{file ? file.name : "Optional: attach a photo"}</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-[var(--elev-1)] disabled:opacity-60"
          >
            {status === "loading" ? "Classifying..." : "Send to AI"}
          </button>
          {status === "done" && result && (
            <span className="text-xs text-[var(--text-secondary)]">Created in {result.classification}. Title: {result.title}</span>
          )}
          {status === "error" && message && <span className="text-xs text-[var(--danger)]">{message}</span>}
        </div>
      </form>
    </div>
  );
}
