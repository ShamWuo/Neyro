"use client";

import { useRef, useState } from "react";

export function VoiceCaptureInput({ onCapture }: { onCapture: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Microphone access is required for voice capture.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // In a real app, this would send to OpenAI Whisper or similar
      // For now, we'll simulate with a placeholder
      const formData = new FormData();
      formData.append("audio", audioBlob);

      // Simulate transcription (replace with real API call)
      const mockTranscription = "[Voice transcription would go here - currently simulated]";
      setTranscript(mockTranscription);
      onCapture(mockTranscription);
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe audio.");
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-primary)]">Voice capture</div>
        {recording && <span className="text-xs text-[var(--danger)] font-semibold animate-pulse">Recording...</span>}
      </div>
      <p className="text-xs text-[var(--text-secondary)]">
        Speak your thought. We'll transcribe and classify it into Projects, Areas, Resources, or Archives.
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
  );
}
