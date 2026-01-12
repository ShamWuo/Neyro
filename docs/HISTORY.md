# Project History

Chronological log of major changes, fixes, security hardening, and audits.

## 2025

### January
- **Consolidated Documentation**: Merged 50+ fragmented docs into 5 core files.
- **AI Audit**: Conducted automated scan for raw AI/LLM callsites.
  - **Findings**: Client-side calls to internal APIs are safe. No direct external AI calls from client.
  - **Actions**: Centralized external fetch in `safe-fetch.ts`, enforced API key handling in headers.
- **Security Hardening**:
  - **Middleware**: Fixed Edge Function size limit by replacing heavy auth imports with lightweight session cookie check.
  - **Input Validation**: Implemented Zod schemas for all user inputs.
  - **XSS Protection**: Added sanitization for all user-generated content (markdown, HTML).
  - **Rate Limiting**: Protected all API routes with token bucket rate limiting.
- **Critical Fixes**:
  - **Auth**: Fixed `NEXTAUTH_URL` mismatch, added database connection error handling.
  - **Database**: Resolved connection pool exhaustion in serverless environment (Vercel).
  - **Theme**: Fixed inconsistent colors and hardcoded hex values across 20+ files.
  - **Stripe**: Updated API version, fixed subscription status mapping.
- **Google OAuth**: Fixed callback errors by correcting redirect URI configuration and `NEXTAUTH_URL`.

### Pre-2025 (Development Phase)
- **Initial Development**: Built core PARA functionality (Projects, Areas, Resources, Archive).
- **Mobile App**: Integrated Capacitor for iOS/Android native features (Camera, Push Notifications).
- **Voice Input**: Implemented Web Speech API for hands-free capture.
- **AI Integration**: Added Google Gemini for auto-classification of inbox items.
- **SEO & Social**: Added dynamic Open Graph images, sitemaps, and social share buttons.

## Audit Logs

### UI Consistency Audit (Jan 2025)
- **Status**: ✅ Fixed
- **Issues Found**: Hardcoded colors, inconsistent border radius, missing accessibility attributes.
- **Resolution**: Replaced all hardcoded colors with CSS variables, standardized border radius.

### AI Safety Audit (Jan 2025)
- **Status**: ✅ Passed
- **Scope**: Scanned for direct calls to OpenAI/Anthropic from client.
- **Result**: No direct calls found. Server endpoints properly hardened.

### Browser Testing (Jan 2025)
- **Status**: ✅ Passed
- **Scope**: Tested public pages, auth flows, and dashboard on Mobile, Tablet, Desktop.
- **Result**: All critical flows functional. Visual regressions fixed.

---

For detailed implementation plans and future work, see `ROADMAP.md`.
