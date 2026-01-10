// Voice processing utilities
// Supports both browser Web Speech API and external services (Whisper, Deepgram)

import type { SpeechRecognition } from "@/types/voice-recognition";

export type VoiceConfig = {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
};

export class VoiceRecorder {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;

  constructor(config: VoiceConfig = {}) {
    this.isSupported = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
    
    if (this.isSupported && typeof window !== "undefined") {
      const SpeechRecognitionConstructor = (window as Window & { SpeechRecognition?: { new (): SpeechRecognition }; webkitSpeechRecognition?: { new (): SpeechRecognition } }).SpeechRecognition || (window as Window & { webkitSpeechRecognition?: { new (): SpeechRecognition } }).webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        this.recognition = new SpeechRecognitionConstructor();
        this.recognition.lang = config.language || "en-US";
        this.recognition.continuous = config.continuous ?? false;
        this.recognition.interimResults = config.interimResults ?? true;
      }
    }
  }

  start(onResult: (text: string, isFinal: boolean) => void, onError?: (error: string) => void) {
    if (!this.recognition) {
      onError?.("Speech recognition not supported in this browser");
      return;
    }

    this.recognition.onresult = (event) => {
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

      if (finalTranscript) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event) => {
      onError?.(event.error || "Speech recognition error");
    };

    this.recognition.onend = () => {
      // Auto-restart if continuous mode
    };

    this.recognition.start();
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  static isSupported(): boolean {
    return typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  }
}

// External API integration (Whisper, Deepgram)
export async function transcribeAudio(audioBlob: Blob, provider: "whisper" | "deepgram" = "whisper"): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.webm");
  formData.append("provider", provider);

  const response = await fetch("/api/voice/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Transcription failed");
  }

  const data = await response.json();
  return data.text;
}

