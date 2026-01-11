# PARA Improvements Summary

This document summarizes recent improvements made to align Neyro with the PARA method and improve safety, quality-of-life, and developer tooling.

Changes:
- Quick-capture endpoint and UI: `src/app/api/quick-capture/route.ts` and `src/components/quick-capture-button.tsx` for frictionless Inbox captures.
- AI hardening: `analyzeParaCaptureSafe`, `sanitizePrompt`, and `safeFetch` centralize prompt sanitization, prompt logging, and safer external calls.
- API hardening: `src/app/api/resource-preview/route.ts` uses `safeFetch` and blocks localhost/private IP ranges to reduce SSRF risk.
- Project limits: `createProjectWithLimit` enforces the 7 active projects constraint and is exposed via `GET /api/para/active-status`.
- Audit & CI: `scripts/audit-ai-calls.js` and workflow added to detect raw AI/fetch callsites and fail CI when unwrapped calls are found.

Next steps:
- Triage client-side audit entries and move any direct LLM usage server-side.
- Add UI polish for quick-capture and optional keyboard shortcuts.
- Continue adding tests around AI wrappers and safeFetch behavior.
