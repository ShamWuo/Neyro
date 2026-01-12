"use client";

import { useState } from "react";
import { VoiceCaptureInput } from "./voice-capture-input";
import { PhotoCaptureInput } from "./photo-capture-input";
import { MoreCaptureInput } from "./more-capture-input";
import { ClassificationPreview } from "./classification-preview";

type CaptureMode = "idle" | "text" | "voice" | "photo" | "more";
type PARACategory = "project" | "area" | "resource" | "archive";

interface ClassificationResult {
  category: PARACategory;
  title: string;
  explanation: string;
}

export function CenteredCapture() {
  const [mode, setMode] = useState<CaptureMode>("idle");
  const [text, setText] = useState("");
  const [capturedText, setCapturedText] = useState("");
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCapture = (text: string, _classification: ClassificationResult | null) => {
    console.log("[CENTERED_CAPTURE] Text captured:", text);
    setCapturedText(text);
    // Classification will be handled by ClassificationPreview
  };

  const handleTextCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    console.log("[CENTERED_CAPTURE] Text captured:", text);
    setCapturedText(text);
  };

  const resetCapture = () => {
    setMode("idle");
    setText("");
    setCapturedText("");
    setClassification(null);
    setIsExpanded(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      {mode === "idle" && !isExpanded && (
        <div className="relative">
          {/* Center Plus Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="w-20 h-20 rounded-full bg-[var(--primary-strong)] text-white text-4xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
            aria-label="Open capture menu"
          >
            +
          </button>
        </div>
      )}

      {mode === "idle" && isExpanded && (
        <div className="relative">
          {/* Center Plus Button (now smaller when expanded) */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-20 h-20 rounded-full bg-[var(--primary-strong)] text-white text-4xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
            aria-label="Close capture menu"
          >
            +
          </button>

          {/* Expanded Dots */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Text - Top */}
            <button
              onClick={() => {
                setMode("text");
                setIsExpanded(false);
              }}
              className="absolute -top-24 w-14 h-14 rounded-full bg-[var(--card)] border-2 border-[var(--primary-strong)] flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200 pointer-events-auto opacity-0 animate-[fadeIn_0.3s_ease-in_0.1s_forwards]"
              aria-label="Text capture"
              title="Text"
            >
              <span className="text-2xl">✍️</span>
            </button>

            {/* Voice - Right */}
            <button
              onClick={() => {
                setMode("voice");
                setIsExpanded(false);
              }}
              className="absolute -right-24 w-14 h-14 rounded-full bg-[var(--card)] border-2 border-[var(--primary-strong)] flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200 pointer-events-auto opacity-0 animate-[fadeIn_0.3s_ease-in_0.2s_forwards]"
              aria-label="Voice capture"
              title="Voice"
            >
              <span className="text-2xl">🎙️</span>
            </button>

            {/* Photo - Bottom */}
            <button
              onClick={() => {
                setMode("photo");
                setIsExpanded(false);
              }}
              className="absolute -bottom-24 w-14 h-14 rounded-full bg-[var(--card)] border-2 border-[var(--primary-strong)] flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200 pointer-events-auto opacity-0 animate-[fadeIn_0.3s_ease-in_0.3s_forwards]"
              aria-label="Photo capture"
              title="Photo"
            >
              <span className="text-2xl">📷</span>
            </button>

            {/* More - Left */}
            <button
              onClick={() => {
                setMode("more");
                setIsExpanded(false);
              }}
              className="absolute -left-24 w-14 h-14 rounded-full bg-[var(--card)] border-2 border-[var(--primary-strong)] flex items-center justify-center shadow-md hover:scale-110 transition-all duration-200 pointer-events-auto opacity-0 animate-[fadeIn_0.3s_ease-in_0.4s_forwards]"
              aria-label="More capture options"
              title="More"
            >
              <span className="text-2xl">🔗</span>
            </button>
          </div>
        </div>
      )}

      {/* Text Capture */}
      {mode === "text" && !capturedText && (
        <div className="w-full max-w-2xl space-y-4 animate-[fadeIn_0.2s_ease-in]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">✍️ Text Capture</h2>
            <button
              onClick={resetCapture}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕ Close
            </button>
          </div>
          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6">
            <form onSubmit={handleTextCapture} className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste anything... (meeting notes, ideas, tasks, links)"
                className="w-full min-h-[200px] border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] rounded-md resize-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="w-full rounded-md bg-[var(--primary-strong)] px-4 py-3 text-sm font-semibold text-[var(--text-inverse)] hover:shadow-[var(--elev-1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Capture & Classify
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Show Classification Preview for Text */}
      {mode === "text" && capturedText && !classification && (
        <div className="w-full max-w-2xl animate-[fadeIn_0.2s_ease-in]">
          <ClassificationPreview
            text={capturedText}
            onConfirm={(result) => {
              setClassification(result);
            }}
          />
        </div>
      )}

      {/* Show Save Preview for Text */}
      {mode === "text" && capturedText && classification && (
        <div className="w-full max-w-2xl animate-[fadeIn_0.2s_ease-in]">
          <PreviewAndSave
            text={capturedText}
            classification={classification}
            sourceMode="text"
            onComplete={resetCapture}
          />
        </div>
      )}

      {/* Voice Capture */}
      {mode === "voice" && (
        <div className="w-full max-w-2xl animate-[fadeIn_0.2s_ease-in]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">🎙️ Voice Capture</h2>
            <button
              onClick={resetCapture}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕ Close
            </button>
          </div>
          <VoiceCaptureInput onCapture={handleCapture} />
        </div>
      )}

      {/* Photo Capture */}
      {mode === "photo" && (
        <div className="w-full max-w-2xl animate-[fadeIn_0.2s_ease-in]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">📷 Photo Capture</h2>
            <button
              onClick={resetCapture}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕ Close
            </button>
          </div>
          <PhotoCaptureInput onCapture={handleCapture} />
        </div>
      )}

      {/* More Capture */}
      {mode === "more" && (
        <div className="w-full max-w-2xl animate-[fadeIn_0.2s_ease-in]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">🔗 Link Capture</h2>
            <button
              onClick={resetCapture}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕ Close
            </button>
          </div>
          <MoreCaptureInput onCapture={handleCapture} />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function PreviewAndSave({
  text,
  classification,
  sourceMode,
  onComplete,
}: {
  text: string;
  classification: ClassificationResult;
  sourceMode: string;
  onComplete: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const categoryLabel: Record<PARACategory, string> = {
    project: "📌 Project",
    area: "🎯 Area",
    resource: "📚 Resource",
    archive: "📦 Archive",
  };

  const handleSave = async () => {
    console.log(`[${sourceMode.toUpperCase()}] Saving: "${classification.title}" → ${classification.category}`);
    setSaving(true);

    const formData = new FormData();
    formData.set("title", classification.title);
    formData.set("details", text);
    formData.set("category", classification.category);
    formData.set("sourceMode", sourceMode);

    try {
      const { saveClassifiedItem } = await import("@/components/home-actions");
      await saveClassifiedItem(formData);
      console.log(`[${sourceMode.toUpperCase()}] Save complete!`);

      // Reload the page to show the new item
      window.location.reload();
    } catch (error) {
      console.error(`[${sourceMode.toUpperCase()}] Save error:`, error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border-2 border-[var(--primary-strong)] bg-[var(--card)] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{categoryLabel[classification.category]}</div>
        <span className="text-xs text-[var(--text-tertiary)]">{classification.explanation}</span>
      </div>

      <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1">Title</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{classification.title}</p>
      </div>

      <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1">Content</p>
        <p className="text-sm text-[var(--text-primary)] line-clamp-3">{text}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-3 text-sm font-semibold text-[var(--text-inverse)] hover:shadow-[var(--elev-1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? "Saving..." : `✓ Save to ${categoryLabel[classification.category]}`}
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={saving}
          className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
