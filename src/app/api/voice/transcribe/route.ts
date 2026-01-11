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
  // Default to Deepgram if available, otherwise Whisper
  const preferredProvider = process.env.DEEPGRAM_API_KEY ? "deepgram" : "whisper";
  const provider = (formData.get("provider") as string) || preferredProvider;

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
        return NextResponse.json({
          error: "Deepgram API key not configured. Set DEEPGRAM_API_KEY environment variable or use Whisper provider.",
          provider: "deepgram",
        }, { status: 500 });
      }

      const audioBuffer = await audioFile.arrayBuffer();

      // Deepgram v1 API with better model and language settings
      const model = "nova-2"; // Best accuracy model
      const language = "en";
      const punctuate = "true";
      const utterances = "true";
      const diarize = "false";
      const smart_format = "true";

      const url = `https://api.deepgram.com/v1/listen?model=${model}&language=${language}&punctuate=${punctuate}&utterances=${utterances}&diarize=${diarize}&smart_format=${smart_format}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${deepgramKey}`,
          "Content-Type": audioFile.type || "audio/webm",
        },
        body: audioBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        let errorMessage = `Deepgram API error: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // Deepgram returns results in this structure
      transcription = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    } else {
      return NextResponse.json({
        error: `Unsupported provider: ${provider}. Use "whisper" or "deepgram"`,
        supported: ["whisper", "deepgram"],
      }, { status: 400 });
    }

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json({
        error: "Transcription returned empty result",
        text: "",
      }, { status: 200 }); // Still return success but with empty text
    }

    logger.info("Audio transcribed successfully", {
      provider,
      length: transcription.length,
      userId: session.user.id,
    });

    return NextResponse.json({ text: transcription.trim(), provider });
  } catch (error) {
    logger.error("Error transcribing audio", error instanceof Error ? error : new Error(String(error)));
    const message = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({
      error: message,
      provider,
      hint: "Check that your API key is valid and has sufficient credits/quota",
    }, { status: 500 });
  }
}

