"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/toast";
import { logger } from "@/lib/logger";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type VoiceInputButtonProps = {
  onTranscript?: (text: string) => void;
};

export const VoiceInputButton = memo(function VoiceInputButton({ onTranscript }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript.trim() && onTranscript) {
        onTranscript(transcript.trim());
        setTranscript("");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech recognition not available",
        description: "Your browser doesn't support speech recognition",
        variant: "danger",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setTranscript("");
      } catch (err) {
        logger.error("Error starting voice recognition", err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Error",
          description: "Failed to start voice recognition",
          variant: "error",
        });
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`rounded-md border px-3 py-2 text-sm font-semibold flex items-center gap-2 ${
        isListening
          ? "border-[var(--danger)] bg-[var(--danger)] text-[var(--text-inverse)] animate-pulse"
          : "border-[var(--primary-strong)] bg-[var(--primary-strong)] text-[var(--text-inverse)]"
      }`}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
    >
      <span>{isListening ? "⏹" : "🎤"}</span>
      <span>{isListening ? "Stop" : "Voice"}</span>
    </button>
  );
});

