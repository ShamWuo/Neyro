import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// Transcribe audio using external services (Whisper API, Deepgram, etc.)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const audioFile = formData.get("audio") as File | null;
  const provider = (formData.get("provider") as string) || "whisper";

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  try {
    let transcription = "";

    if (provider === "whisper") {
      // OpenAI Whisper API
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
      }

      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
        },
        body: (() => {
          const fd = new FormData();
          fd.append("file", new Blob([audioBuffer]), audioFile.name);
          fd.append("model", "whisper-1");
          fd.append("language", "en");
          return fd;
        })(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Whisper API error: ${error}`);
      }

      const data = await response.json();
      transcription = data.text || "";
    } else if (provider === "deepgram") {
      // Deepgram API
      const deepgramKey = process.env.DEEPGRAM_API_KEY;
      if (!deepgramKey) {
        return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 500 });
      }

      const audioBuffer = await audioFile.arrayBuffer();

      const response = await fetch("https://api.deepgram.com/v1/listen", {
        method: "POST",
        headers: {
          Authorization: `Token ${deepgramKey}`,
          "Content-Type": audioFile.type || "audio/webm",
        },
        body: audioBuffer,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Deepgram API error: ${error}`);
      }

      const data = await response.json();
      transcription = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    } else {
      return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    return NextResponse.json({ text: transcription });
  } catch (error) {
    logger.error("Error transcribing audio", error);
    const message = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

