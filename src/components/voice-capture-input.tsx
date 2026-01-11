"use client";

import { useRef, useState } from "react";
import { ClassificationPreview } from "./classification-preview";

type PARACategory = "project" | "area" | "resource" | "archive";

interface ClassificationResult {
  category: PARACategory;
  title: string;
  explanation: string;
}

export function VoiceCaptureInput({ onCapture }: { onCapture: (text: string, classification: ClassificationResult | null) => void }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      console.log("[VOICE] Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("[VOICE] Recording stopped, transcribing...");
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("[VOICE] Microphone access denied:", error);
      alert("Microphone access is required for voice capture.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      console.log("[VOICE] Stopping recording...");
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      console.log("[VOICE] Audio blob size:", audioBlob.size);
      // In a real app, this would send to OpenAI Whisper or similar
      // For now, we'll simulate with a placeholder
      const formData = new FormData();
      formData.append("audio", audioBlob);

      // Simulate transcription (replace with real API call)
      const mockTranscription = "Buy groceries, schedule dentist appointment, review Q1 budget";
      console.log("[VOICE] Transcription complete:", mockTranscription);
      setTranscript(mockTranscription);
      onCapture(mockTranscription, null);
    } catch (error) {
      console.error("[VOICE] Transcription error:", error);
      alert("Failed to transcribe audio.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-[var(--text-primary)]">Voice capture</div>
          {recording && <span className="text-xs text-[var(--danger)] font-semibold animate-pulse">Recording...</span>}
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Speak your thought. We&apos;ll transcribe and classify it into Projects, Areas, Resources, or Archives.
        </p>
        <div className="flex gap-2">
          {!recording ? (
            <button
              type="button"
              onClick={startRecording}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]"
            >
              🎤 Start recording
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="rounded-md border border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_15%,var(--surface))] px-3 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[color-mix(in_srgb,var(--danger)_25%,var(--surface))]"
            >
              Stop recording
            </button>
          )}
        </div>
        {transcript && (
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
            <p className="text-xs font-semibold text-[var(--text-tertiary)]">Transcription</p>
            <p className="text-sm text-[var(--text-primary)]">{transcript}</p>
          </div>
        )}
      </div>
      {transcript && !classification && (
        <ClassificationPreview text={transcript} onConfirm={(c) => setClassification(c)} />
      )}
      {transcript && classification && (
        <PreviewAndSave text={transcript} classification={classification} sourceMode="voice" />
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
