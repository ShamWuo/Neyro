"use client";

import { useState } from "react";

export function MoreCaptureInput({ onCapture }: { onCapture: (text: string) => void }) {
  const [url, setUrl] = useState("");
  const [extractedContent, setExtractedContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsProcessing(true);
    // Simulate fetching and parsing URL
    setTimeout(() => {
      const mockContent = `[Content from ${url} would be extracted and summarized here]`;
      setExtractedContent(mockContent);
      onCapture(mockContent);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
      <div className="text-sm font-semibold text-[var(--text-primary)]">Link / Email / File</div>
      <p className="text-xs text-[var(--text-secondary)]">Paste a link, email, or file path. AI will fetch, parse, and classify.</p>
      <form onSubmit={handleCapture} className="space-y-2">
        <input
          type="text"
          placeholder="https://example.com or email@domain.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing || !url.trim()}
          className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-50"
        >
          {isProcessing ? "Fetching..." : "🔗 Capture link"}
        </button>
      </form>
      {extractedContent && (
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
          <p className="text-xs font-semibold text-[var(--text-tertiary)]">Extracted content</p>
          <p className="text-sm text-[var(--text-primary)] line-clamp-3">{extractedContent}</p>
        </div>
      )}
    </div>
  );
}
