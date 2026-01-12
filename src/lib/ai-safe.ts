import { analyzeParaCapture, sanitizePrompt } from "./ai";
import { logPrompt } from "./prompt-logger";
import { isUrlSafeForExternalFetch } from "./url-safety";
import { validateAndFetchImage } from "./image-validator";
import { logger } from "./logger";

export async function analyzeParaCaptureSafe(params: { text?: string; imageDataUrl?: string; imageUrl?: string }) {
  // Build a short sanitized preview for logging (do not store raw prompts)
  const parts: string[] = [];
  if (params.text) parts.push(`text:${sanitizePrompt(params.text).slice(0, 1000)}`);
  if (params.imageUrl) parts.push(`imageUrl:${sanitizePrompt(params.imageUrl)}`);
  if (params.imageDataUrl) parts.push(`imageDataUrl:${params.imageDataUrl.slice(0, 200)}`);

  try {
    // If an external image URL is present, validate and fetch it
    if (params.imageUrl) {
      if (!isUrlSafeForExternalFetch(params.imageUrl)) {
        parts.push(`imageUrl: [REMOVED_UNSAFE]`);
        logPrompt(parts.join(" | "), { redact: true });
         
        params.imageUrl = undefined;
      } else {
        // Try to fetch and validate the image, then convert to base64 data URL
        const validated = await validateAndFetchImage(params.imageUrl);
        if (validated) {
           
          params.imageDataUrl = `data:${validated.mimeType};base64,${validated.base64}`;
           
          params.imageUrl = undefined; // Remove original URL, use inline data instead
          parts.push(`imageDataUrl: [FETCHED_AND_INLINED]`);
        } else {
          parts.push(`imageUrl: [VALIDATION_FAILED]`);
           
          params.imageUrl = undefined;
        }
        logPrompt(parts.join(" | "), { redact: true });
      }
    } else {
      logPrompt(parts.join(" | "), { redact: true });
    }
  } catch (e) {
    // best-effort logging
    logger.warn("ai-safe: prompt logging failed", (e instanceof Error) ? e.message : String(e));
  }

  return analyzeParaCapture(params);
}

export default analyzeParaCaptureSafe;
