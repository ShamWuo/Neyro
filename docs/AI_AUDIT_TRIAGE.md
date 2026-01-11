# AI Audit Triage

Summary of automated audit (`tmp/ai-audit.json`) with prioritized recommendations.

Findings
- Many client-side files call local API routes via `fetch("/api/...")`. These are client → server calls and are acceptable provided the server endpoints do not call external LLMs directly from the browser.
- Server-side routes of concern were inspected and are already using hardened helpers: `safeFetch`, `analyzeParaCaptureSafe`, and prompt sanitization.
- No client-side direct calls to external LLM endpoints (e.g., `api.openai.com`, `anthropic`, `claude`) were found in the audit results — most mentions were comments only.

Action Items & Recommendations
1. Accept (no change required)
  - Client fetches to internal APIs (e.g., `src/components/*` entries referencing `/api/*`) — keep as-is. Ensures credentials and API keys remain server-side.

2. Monitor / Manual follow-up
  - `src/components/photo-capture-input.tsx` contains a comment referencing Claude Vision. If future implementations call an external vision/LLM directly from the client, move to server-side upload/processing.
  - Any new client-side code that includes SDKs or direct network calls to AI providers should be flagged and redirected to server endpoints using `analyzeParaCaptureSafe` or `safeFetch`.

3. Completed server-side hardening
  - `src/app/api/assist/ingest/route.ts` — uses `analyzeParaCaptureSafe` and records AI credit usage.
  - `src/app/api/voice/transcribe/route.ts` — uses `safeFetch` for Whisper/Deepgram.
  - `src/app/api/resource-preview/route.ts` — uses `safeFetch` and blocks private hosts.

Next Steps
- Add a lightweight CI check that ensures no `https://api.openai.com` or other provider domains appear in `src/components` (optional automated guard).
- Continue to run `npm run audit:ai` periodically and triage new findings.

If you'd like, I can implement the optional CI check to fail PRs when forbidden external AI domains appear in client-side code.
