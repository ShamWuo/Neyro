"use client";

import { useState } from "react";
import { ClassificationPreview } from "./classification-preview";

type PARACategory = "project" | "area" | "resource" | "archive";

interface ClassificationResult {
  category: PARACategory;
  title: string;
  explanation: string;
}

export function MoreCaptureInput({ onCapture }: { onCapture: (text: string, classification: ClassificationResult | null) => void }) {
  const [url, setUrl] = useState("");
  const [extractedContent, setExtractedContent] = useState("");
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    console.log("[MORE] Fetching content from:", url);
    setIsProcessing(true);
    // Simulate fetching and parsing URL
    setTimeout(() => {
      const mockContent = `Page from ${url}: Key article on industry trends, market analysis, and competitive landscape insights. Great resource for Q2 planning and strategy review.`;
      console.log("[MORE] Content extraction complete, length:", mockContent.length);
      setExtractedContent(mockContent);
      onCapture(mockContent, null as any);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-3">
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
      </div>
      {extractedContent && !classification && (
        <ClassificationPreview text={extractedContent} onConfirm={(c) => setClassification(c)} />
      )}
      {extractedContent && classification && (
        <PreviewAndSave text={extractedContent} classification={classification} sourceMode="more" />
      )}
    </div>
  );
}

function PreviewAndSave({
  text,
  classification,
  sourceMode,
}: {
  text: string;
  classification: ClassificationResult;
  sourceMode: string;
}) {
  const categoryLabel: Record<PARACategory, string> = {
    project: "📌 Project",
    area: "🎯 Area",
    resource: "📚 Resource",
    archive: "📦 Archive",
  };

  const handleSave = async () => {
    console.log(`[${sourceMode.toUpperCase()}] Saving: "${classification.title}" → ${classification.category}`);
    const formData = new FormData();
    formData.set("title", classification.title);
    formData.set("details", text);
    formData.set("category", classification.category);
    formData.set("sourceMode", sourceMode);

    try {
      const { saveClassifiedItem } = await import("@/app/(dashboard)/inbox/actions");
      await saveClassifiedItem(formData);
    } catch (error) {
      console.error(`[${sourceMode.toUpperCase()}] Save error:`, error);
    }
  };

  return (
    <div className="rounded-lg border-2 border-[var(--primary-strong)] bg-[var(--card)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{categoryLabel[classification.category]}</div>
        <span className="text-xs text-[var(--text-tertiary)]">{classification.explanation}</span>
      </div>
      <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">Title</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{classification.title}</p>
      </div>
      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-[var(--text-inverse)] hover:shadow-[var(--elev-1)]"
      >
        ✓ Save to {categoryLabel[classification.category]}
      </button>
    </div>
  );
}
