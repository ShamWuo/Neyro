"use client";

import { useRef, useState } from "react";
import { ClassificationPreview } from "./classification-preview";

type PARACategory = "project" | "area" | "resource" | "archive";

interface ClassificationResult {
  category: PARACategory;
  title: string;
  explanation: string;
}

export function PhotoCaptureInput({ onCapture }: { onCapture: (text: string, classification: ClassificationResult | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("[PHOTO] File selected:", file.name, file.size);

    // Show preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreview(evt.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate OCR/vision extraction
    setIsProcessing(true);
    setTimeout(() => {
      // In a real app, this would send to Claude Vision or similar
      const mockExtraction = "Meeting notes: Review Q1 KPIs, Discuss team expansion, Plan H2 budget allocations";
      console.log("[PHOTO] OCR extraction complete:", mockExtraction);
      setExtractedText(mockExtraction);
      onCapture(mockExtraction, null as any);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
        <div className="text-sm font-semibold text-[var(--text-primary)]">Photo/Document capture</div>
        <p className="text-xs text-[var(--text-secondary)]">Upload a photo or document. AI will extract text and classify it.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]"
          >
            📷 Upload photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        {preview && (
          <div className="space-y-2">
            <img src={preview} alt="preview" className="max-h-48 rounded-md border border-[var(--border-subtle)]" />
            {isProcessing && <p className="text-xs text-[var(--text-secondary)]">Extracting text...</p>}
            {extractedText && (
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
                <p className="text-xs font-semibold text-[var(--text-tertiary)]">Extracted text</p>
                <p className="text-sm text-[var(--text-primary)]">{extractedText}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {extractedText && !classification && (
        <ClassificationPreview text={extractedText} onConfirm={(c) => setClassification(c)} />
      )}
      {extractedText && classification && (
        <PreviewAndSave text={extractedText} classification={classification} sourceMode="photo" />
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
