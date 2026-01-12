/**
 * Simple AI hardening utilities.
 * - sanitizePrompt: removes emails and likely secrets before sending to AI.
 */

export function sanitizePrompt(input: string): string {
  if (!input) return input;

  // Remove emails
  let out = input.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");

  // Remove common API key patterns (stripe, sk_live, sk_test, sk-... etc)
  out = out.replace(/sk_live_[A-Za-z0-9]+/g, "[REDACTED_API_KEY]");
  out = out.replace(/sk_test_[A-Za-z0-9]+/g, "[REDACTED_API_KEY]");
  out = out.replace(/(api_key|apikey|token)[:=]\s*[A-Za-z0-9\-_.]+/gi, "$1: [REDACTED]");

  // Remove long sequences of hex/base64-like characters
  out = out.replace(/\b[a-f0-9]{32,}\b/gi, "[REDACTED]");
  out = out.replace(/\b[A-Za-z0-9\-_]{64,}\b/g, "[REDACTED]");

  // Trim excessive whitespace
  out = out.replace(/\s{2,}/g, " ").trim();

  return out;
}

export default sanitizePrompt;
// Use exported sanitizer within this module to harden AI requests

import { ItemClassification, ItemType } from "@prisma/client";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-1.5-flash";

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { mimeType: string; fileUri: string } };

export type ParaDecision = {
  classification: ItemClassification;
  title: string;
  details?: string | null;
  type?: ItemType;
  dueDate?: string | null;
};

function coerceClassification(value: string | undefined): ItemClassification {
  const upper = (value || "").toUpperCase();
  if (upper === "PROJECT") return ItemClassification.PROJECT;
  if (upper === "AREA") return ItemClassification.AREA;
  if (upper === "RESOURCE") return ItemClassification.RESOURCE;
  if (upper === "ARCHIVE") return ItemClassification.ARCHIVE;
  return ItemClassification.INBOX;
}

export async function analyzeParaCapture(params: { text?: string; imageDataUrl?: string; imageUrl?: string }) {
  // Prefer a single configured key name but accept legacy/alternate env names
  const apiKey = process.env.GEMINI_API_KEY || process.env.GAI_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    // Return a basic fallback classification instead of throwing
    // This allows the app to work without AI configured
    return {
      classification: ItemClassification.INBOX,
      title: params.text?.slice(0, 80) || "Captured note",
      details: params.text || null,
      type: ItemType.NOTE,
    };
  }

  // Build Gemini API request parts
  const parts: GeminiPart[] = [];

  // User input text (sanitize before sending)
  if (params.text) {
    parts.push({ text: `User input: ${sanitizePrompt(params.text)}` });
  }

  // Handle image data URL (base64)
  if (params.imageDataUrl) {
    // Guard: prevent extremely large data URLs from being sent to the API
    if (params.imageDataUrl.length > 2_000_000) {
      throw new Error("Image payload too large for AI processing");
    }

    // Extract base64 data and mime type from data URL
    const match = params.imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const [, mimeType, base64Data] = match;
      parts.push({
        text: "Analyze this image. Extract tasks or notes and map to PARA.",
      });
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64Data,
        },
      });
    }
  }

  // Handle external image URL
  if (params.imageUrl) {
    parts.push({
      text: "Analyze this externally-hosted image. Extract tasks or notes and map to PARA.",
    });
    // For external URLs, we need to use fileData format, but Gemini requires the file to be uploaded first
    // For simplicity, we'll just include the URL in text and let Gemini fetch it
    parts.push({
      text: `Image URL: ${sanitizePrompt(params.imageUrl)}`,
    });
  }

  // Helper: fetch with retries for transient errors
  // Use safeFetch helper for retries and timeouts
  const { default: safeFetch } = await import("./safe-fetch");
  const geminiUrl = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`;

  const resp = await safeFetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      contents: [
        {
          parts,
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: "You classify inputs into the PARA method. Output strict JSON with keys: classification (INBOX|PROJECT|AREA|RESOURCE|ARCHIVE), title, details, type (NOTE|TASK|LINK), and dueDate (ISO string or null). Extract deadlines from text if present.",
          },
        ],
      },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 300,
        responseMimeType: "application/json",
      },
    }),
    timeoutMs: 30000,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`AI request failed: ${resp.status} ${text}`);
  }

  type GeminiResp = {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };
  const json: GeminiResp = await resp.json().catch(() => ({} as GeminiResp));
  const content: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed: ParaDecision = { classification: ItemClassification.INBOX, title: params.text?.slice(0, 80) || "Captured note" };
  try {
    // Since we set responseMimeType to JSON, content should be valid JSON
    // Try parsing directly first, then fall back to regex extraction
    let obj: unknown;
    try {
      obj = JSON.parse(content);
    } catch {
      // If direct parse fails, try to extract JSON from text
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        obj = JSON.parse(match[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    }

    // Type guard for obj
    if (!obj || typeof obj !== "object") {
      throw new Error("Invalid response format");
    }

    const objTyped = obj as Record<string, unknown>;
    const maybeType = "type" in objTyped && typeof objTyped.type === "string" && Object.values(ItemType).includes(objTyped.type as ItemType) ? objTyped.type as ItemType : ItemType.NOTE;
    parsed = {
      classification: coerceClassification(String(objTyped.classification || objTyped.bucket || "")),
      title: String(objTyped.title || params.text || "Captured note"),
      details: objTyped.details ? String(objTyped.details) : params.text || null,
      type: maybeType,
      dueDate: typeof objTyped.dueDate === "string" ? objTyped.dueDate : null,
    };
  } catch {
    // Fallback: use the raw response text as details if parsing fails
    if (content.trim()) {
      parsed = {
        classification: ItemClassification.INBOX,
        title: params.text?.slice(0, 80) || "Captured note",
        details: String(content).slice(0, 200) || params.text || null,
        type: ItemType.NOTE
      };
    } else {
      parsed = {
        classification: ItemClassification.INBOX,
        title: params.text?.slice(0, 80) || "Captured note",
        details: params.text || null,
        type: ItemType.NOTE
      };
    }
  }

  return parsed;
}
