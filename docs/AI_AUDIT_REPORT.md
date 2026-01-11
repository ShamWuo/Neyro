# AI Audit Report

Generated: automated scan on repository for raw AI/LLM callsites and external fetch usage.

Summary
- `tmp/ai-audit.json` lists all matches found by the audit script. Most entries are client-side components calling internal `/api/*` routes via `fetch()` — this is expected and acceptable.
- Server endpoints that make external requests were inspected and hardened: `assist/ingest` (uses `analyzeParaCaptureSafe`), `voice/transcribe` (uses `safeFetch`), `resource-preview` (uses `safeFetch` and blocks private hosts), and `classify` (uses `analyzeParaCaptureSafe`).
- No direct client-side calls to external AI provider domains were found.

What I changed
- Centralized external fetch behavior in `src/lib/safe-fetch.ts` (retries, timeouts, masked logging).
- Ensured AI integrations pass API keys via headers (not URL query params) in `src/lib/ai.ts`.
- Added `analyzeParaCaptureSafe` wrapper that sanitizes prompts and logs safe previews.
- Added audit tooling and CI enforcement: `scripts/audit-ai-calls.js`, `scripts/check-ai-audit.js`, and GitHub Action `.github/workflows/ai-audit.yml`.
- Added client-side guard `scripts/check-client-ai-domains.js` and CI step to run it.

Findings & Recommendations
1. Client-side `fetch` calls to internal APIs are OK — continue enforcing server-side checks and sanitization.
2. If new client code requires AI features, implement server-side endpoints that call AI providers and return sanitized results.
3. Periodically run `npm run audit:ai` and `npm run audit:client-ai` locally and in CI.

Commands
```bash
npm run audit:ai
npm run audit:client-ai
```

Next steps
- Triage `tmp/ai-audit.json` manually if new entries appear.
- Consider scanning `docs/` or other non-src folders for accidental secrets or keys.
AI Callsite Audit Report

Generated: 2026-01-11T21:17:34Z

Summary
- Found numerous fetch calls across client components that call local API routes (expected).
- Identified server-side direct AI/LLM usage locations that should be hardened or validated.

Top findings and recommended actions

- src/app/api/voice/transcribe/route.ts — direct calls to OpenAI / Deepgram. ACTION: already updated to use safeFetch (centralized timeout/retries). Verify credential handling and logs.
- src/app/api/classify/route.ts — previously used @google/generative-ai. ACTION: replaced to call analyzeParaCaptureSafe to sanitize prompts and centralize logging.
- src/lib/ai.ts — Gemini integration. ACTION: now uses safeFetch and sanitizePrompt.
- src/app/(dashboard)/assist/ai-capture.tsx & /api/assist/ingest — assist flow: server ingest endpoint uses analyzeParaCaptureSafe already; client-side calls to /api/assist/ingest are expected.

Other notable files (review and decide per-file)

The audit found many files calling fetch or referencing AI providers; recommended per-file actions are to either: wrap with analyzeParaCaptureSafe, centralize calls server-side, or confirm no LLM involvement.

Full machine-readable output was written to tmp/ai-audit.json — review that for the complete list.

Recommendations
1. Server-first approach: prioritize hardening server endpoints that make external AI requests by using analyzeParaCaptureSafe and safeFetch.
2. CI enforcement: the repository now includes .github/workflows/ai-audit.yml which will run npm run audit:ai:check and fail if new raw callsites appear.
3. Client-local API calls: these are normal; ensure server APIs they call are hardened (as above). Do not attempt to call external LLMs from the browser.
4. Manual triage: assign owners to the top files in tmp/ai-audit.json to decide whether to (a) wrap with safe wrapper, (b) move logic server-side, or (c) leave as-is.

Next steps (proposed)
- Create a PR that wraps remaining server-side external requests with safeFetch and uses analyzeParaCaptureSafe for any prompt/LLM content.
- Triage client calls in a small follow-up review and add code owners.

Run these locally

    npm run audit:ai
    node scripts/check-ai-audit.js
