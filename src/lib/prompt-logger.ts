import fs from "fs";
import path from "path";
import { logger } from "./logger";
import sanitizePrompt from "./ai";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "prompts.log");
const SUMMARY_FILE = path.join(LOG_DIR, "prompts-summary.json");
const MAX_LOG_BYTES = 5 * 1024 * 1024; // 5 MB

export type LogOptions = {
  redact?: boolean; // default true
};

export function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch {
    // ignore; best-effort logging
  }
}

function rotateIfNeeded() {
  try {
    if (!fs.existsSync(LOG_FILE)) return;
    const st = fs.statSync(LOG_FILE);
    if (st.size < MAX_LOG_BYTES) return;
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const rotated = path.join(LOG_DIR, `prompts-${ts}.log`);
    fs.renameSync(LOG_FILE, rotated);
  } catch {
    // non-fatal
    logger.warn("Prompt logger rotation failed");
  }
}

function bumpDailySummary() {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let data: Record<string, { count: number }> = {};
    if (fs.existsSync(SUMMARY_FILE)) {
      try {
        const raw = fs.readFileSync(SUMMARY_FILE, "utf8");
        data = JSON.parse(raw || "{}");
      } catch {
        data = {};
      }
    }
    data[today] = { count: (data[today]?.count || 0) + 1 };
    fs.writeFileSync(SUMMARY_FILE, JSON.stringify(data, null, 2), { encoding: "utf8" });
  } catch (e) {
    logger.warn("Prompt summary update failed:", (e as Error)?.message || e);
  }
}

export function logPrompt(raw: string, opts: LogOptions = { redact: true }): string {
  const out = opts.redact === false ? raw : sanitizePrompt(raw || "");
  const entry = `${new Date().toISOString()}\t${out}\n`;
  try {
    ensureLogDir();
    rotateIfNeeded();
    fs.appendFileSync(LOG_FILE, entry, { encoding: "utf8" });
    try {
      bumpDailySummary();
    } catch {
      // ignore summary failures
    }
  } catch (e) {
    // If we can't write to disk, fallback to console but still return sanitized content
    logger.warn("Prompt logger failed to write to disk:", (e as Error)?.message || e);
  }
  return out;
}

export default logPrompt;
