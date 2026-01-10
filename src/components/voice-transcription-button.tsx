"use client";

import { useState, useRef, memo } from "react";
import { useToast } from "./ui/toast";
import { logger } from "@/lib/logger";

type VoiceTranscriptionButtonProps = {
  onTranscript: (text: string) => void;
  className?: string;
  provider?: "whisper" | "deepgram" | "auto";
};

export const VoiceTranscriptionButton = memo(function VoiceTranscriptionButton({
  onTranscript,
  className = "",
  provider = "auto",
}: VoiceTranscriptionButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        
        if (audioChunksRef.current.length === 0) {
          toast({
            title: "No audio recorded",
            description: "Please try again",
            variant: "error",
          });
          return;
        }

        await transcribeAudio();
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      logger.error("Error starting recording", error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice transcription",
        variant: "error",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    setIsTranscribing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      
      // Determine provider
      let finalProvider = provider;
      if (provider === "auto") {
        // Prefer Deepgram if available, otherwise Whisper
        finalProvider = "deepgram";
      }
      
      formData.append("provider", finalProvider);

      const response = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.text && data.text.trim()) {
        onTranscript(data.text.trim());
        toast({
          title: "Transcription complete",
          description: `Using ${data.provider || finalProvider}`,
          variant: "success",
        });
      } else {
        throw new Error("Empty transcription result");
      }
    } catch (error) {
      logger.error("Error transcribing audio", error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "error",
      });
    } finally {
      setIsTranscribing(false);
      audioChunksRef.current = [];
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isTranscribing) {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isTranscribing}
      className={`rounded-md border px-3 py-2 text-sm font-semibold flex items-center gap-2 transition-all ${
        isRecording
          ? "border-[var(--danger)] bg-[var(--danger)] text-[var(--text-inverse)] animate-pulse"
          : isTranscribing
            ? "border-[var(--border-subtle)] bg-[var(--card)] text-[var(--text-secondary)] opacity-60 cursor-not-allowed"
            : "border-[var(--primary-strong)] bg-[var(--primary-strong)] text-[var(--text-inverse)] hover:shadow-[var(--elev-1)]"
      } ${className}`}
      aria-label={
        isTranscribing
          ? "Transcribing..."
          : isRecording
            ? "Stop recording (click to stop)"
            : "Start voice transcription (click to record)"
      }
    >
      {isTranscribing ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>Transcribing...</span>
        </>
      ) : isRecording ? (
        <>
          <span>⏹</span>
          <span>Stop Recording</span>
        </>
      ) : (
        <>
          <span>🎤</span>
          <span>Record Audio</span>
        </>
      )}
    </button>
  );
});
