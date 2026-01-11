"use client";

import { useRef, useState } from "react";

export function PhotoCaptureInput({ onCapture }: { onCapture: (text: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const mockExtraction = "[Text from image would be extracted here - currently simulated]";
      setExtractedText(mockExtraction);
      onCapture(mockExtraction);
      setIsProcessing(false);
    }, 1500);
  };

  return (
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
  );
}
