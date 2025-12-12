"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeParaCapture = analyzeParaCapture;
const client_1 = require("@prisma/client");
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
function coerceClassification(value) {
    const upper = (value || "").toUpperCase();
    if (upper === "PROJECT")
        return client_1.ItemClassification.PROJECT;
    if (upper === "AREA")
        return client_1.ItemClassification.AREA;
    if (upper === "RESOURCE")
        return client_1.ItemClassification.RESOURCE;
    if (upper === "ARCHIVE")
        return client_1.ItemClassification.ARCHIVE;
    return client_1.ItemClassification.INBOX;
}
async function analyzeParaCapture(params) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey)
        throw new Error("OPENAI_API_KEY is not set");
    const messages = [
        {
            role: "system",
            content: [
                {
                    type: "text",
                    text: "You classify inputs into the PARA method. Output strict JSON with keys classification (INBOX|PROJECT|AREA|RESOURCE|ARCHIVE), title, details, and optional type (NOTE|TASK|LINK). Keep it concise.",
                },
            ],
        },
    ];
    const userContent = [];
    if (params.text) {
        userContent.push({ type: "text", text: `User input: ${params.text}` });
    }
    if (params.imageDataUrl) {
        userContent.push({ type: "text", text: "Analyze this image. Extract tasks or notes and map to PARA." });
        userContent.push({ type: "image_url", image_url: { url: params.imageDataUrl } });
    }
    if (params.imageUrl) {
        userContent.push({ type: "text", text: "Analyze this externally-hosted image. Extract tasks or notes and map to PARA." });
        userContent.push({ type: "image_url", image_url: { url: params.imageUrl } });
    }
    messages.push({ role: "user", content: userContent });
    // Guard: prevent extremely large data URLs from being sent to the API
    if (params.imageDataUrl && params.imageDataUrl.length > 2000000) {
        throw new Error("Image payload too large for AI processing");
    }
    // Helper: fetch with retries for transient errors
    async function fetchWithRetry(input, init, attempts = 3) {
        const delays = [500, 1000, 2000];
        for (let i = 0; i < attempts; i++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            try {
                const res = await fetch(input, { ...init, signal: controller.signal });
                clearTimeout(timeout);
                if (res.ok)
                    return res;
                // Retry on 5xx
                if (res.status >= 500 && i < attempts - 1) {
                    await new Promise((r) => setTimeout(r, delays[i]));
                    continue;
                }
                return res;
            }
            catch (e) {
                clearTimeout(timeout);
                if (i === attempts - 1)
                    throw e;
                await new Promise((r) => setTimeout(r, delays[i]));
            }
        }
        throw new Error("Failed to fetch after retries");
    }
    const resp = await fetchWithRetry(OPENAI_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.2, max_tokens: 300 }),
    });
    if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`AI request failed: ${resp.status} ${text}`);
    }
    const json = await resp.json().catch(() => ({}));
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed = { classification: client_1.ItemClassification.INBOX, title: params.text?.slice(0, 80) || "Captured note" };
    try {
        // Try to locate first JSON object in the content
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            const obj = JSON.parse(match[0]);
            const maybeType = obj.type && Object.values(client_1.ItemType).includes(obj.type) ? obj.type : client_1.ItemType.NOTE;
            parsed = {
                classification: coerceClassification(String(obj.classification || obj.bucket)),
                title: String(obj.title || params.text || "Captured note"),
                details: obj.details ? String(obj.details) : params.text || null,
                type: maybeType,
            };
        }
        else if (content.trim()) {
            // fallback: use the raw response text as details
            parsed = { classification: client_1.ItemClassification.INBOX, title: params.text?.slice(0, 80) || "Captured note", details: String(content).slice(0, 200) || params.text || null, type: client_1.ItemType.NOTE };
        }
    }
    catch {
        parsed = { classification: client_1.ItemClassification.INBOX, title: params.text?.slice(0, 80) || "Captured note", details: params.text || null, type: client_1.ItemType.NOTE };
    }
    return parsed;
}
