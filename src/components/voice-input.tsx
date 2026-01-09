"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useToast } from "./ui/toast";
import { logger } from "@/lib/logger";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type VoiceInputProps = {
  onTranscript: (text: string) => void;
  onClose?: () => void;
  className?: string;
};

export const VoiceInput = memo(function VoiceInput({ onTranscript, onClose, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      logger.error("Speech recognition error", new Error(event.error));
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech recognition not available",
        description: "Your browser doesn't support speech recognition",
        variant: "danger",
      });
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      logger.error("Error starting voice recognition", err instanceof Error ? err : new Error(String(err)));
      setError("Failed to start voice input");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setTranscript("");
      if (onClose) onClose();
    }
  };

  const handleCancel = () => {
    stopListening();
    setTranscript("");
    if (onClose) onClose();
  };

  // If className is provided, render as inline button instead of modal
  if (className) {
    return (
      <button
        type="button"
        onClick={() => {
          if (!recognitionRef.current) {
            toast({
              title: "Speech recognition not available",
              description: "Your browser doesn't support speech recognition",
              variant: "danger",
            });
            return;
          }
          if (isListening) {
            stopListening();
          } else {
            startListening();
          }
        }}
        className={className}
      >
        {isListening ? "⏹ Stop" : "🎤 Voice"}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[var(--elev-3)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Voice Input</h2>
          <button
            onClick={handleCancel}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] p-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-center">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`h-20 w-20 rounded-full border-4 transition-all ${
                isListening
                  ? "border-[var(--danger)] bg-[var(--danger)] animate-pulse"
                  : "border-[var(--primary-strong)] bg-[var(--primary-strong)] hover:scale-110"
              }`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              <span className="text-2xl text-[var(--text-inverse)]">{isListening ? "⏹" : "🎤"}</span>
            </button>
          </div>

          <div className="min-h-[100px] rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-4">
            {transcript ? (
              <p className="text-sm text-[var(--text-primary)]">{transcript}</p>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">
                {isListening ? "Listening..." : "Click the microphone to start"}
              </p>
            )}
          </div>

          {isListening && (
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
              <div className="h-2 w-2 rounded-full bg-[var(--danger)] animate-pulse" />
              Recording...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!transcript.trim() || isListening}
            className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] disabled:opacity-50"
          >
            Use Transcript
          </button>
        </div>
      </div>
    </div>
  );
});
