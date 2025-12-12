import { ItemClassification, ItemType } from "@prisma/client";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type ChatContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type ChatMessage = { role: "system" | "user"; content: ChatContent[] };

export type ParaDecision = {
  classification: ItemClassification;
  title: string;
  details?: string | null;
  type?: ItemType;
};

function coerceClassification(value: string | undefined): ItemClassification {
  const upper = (value || "").toUpperCase();
  if (upper === "PROJECT") return ItemClassification.PROJECT;
  if (upper === "AREA") return ItemClassification.AREA;
  if (upper === "RESOURCE") return ItemClassification.RESOURCE;
  if (upper === "ARCHIVE") return ItemClassification.ARCHIVE;
  return ItemClassification.INBOX;
}

export async function analyzeParaCapture(params: { text?: string; imageDataUrl?: string }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You classify inputs into the PARA method. Output strict JSON with keys classification (INBOX|PROJECT|AREA|RESOURCE|ARCHIVE), title, details, and optional type (NOTE|TASK|LINK). Keep it concise.",
    },
  ];

  const userContent: ChatContent[] = [];
  if (params.text) {
    userContent.push({ type: "text", text: `User input: ${params.text}` });
  }
  if (params.imageDataUrl) {
    userContent.push({ type: "text", text: "Analyze this image. Extract tasks or notes and map to PARA." });
    userContent.push({ type: "image_url", image_url: { url: params.imageDataUrl } });
  }
  messages.push({ role: "user", content: userContent });

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI request failed: ${response.status} ${text}`);
  }

  const json = await response.json();
  const content: string = json.choices?.[0]?.message?.content ?? "";

  let parsed: ParaDecision = { classification: ItemClassification.INBOX, title: params.text?.slice(0, 80) || "Captured note" };
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const obj = JSON.parse(match[0]);
      parsed = {
        classification: coerceClassification(String(obj.classification || obj.bucket)),
        title: String(obj.title || params.text || "Captured note"),
        details: obj.details ? String(obj.details) : params.text || null,
        type: obj.type && Object.values(ItemType).includes(obj.type) ? obj.type : ItemType.NOTE,
      };
    }
  } catch {
    parsed = { classification: ItemClassification.INBOX, title: params.text?.slice(0, 80) || "Captured note", details: params.text || null, type: ItemType.NOTE };
  }

  return parsed;
}
