# Security Documentation

Overview of security measures, authentication flows, and hardening practices.

## Authentication & Authorization

### Architecture
- **Provider**: NextAuth.js (v5) with Google OAuth.
- **Session Management**: Secure, HTTP-only cookies.
- **Edge Compatible**: Lightweight session checks in middleware (no DB calls).

### Hardening
- **Authorization**: All data access requires ownership verification (`verifyOwnership`).
- **Middleware**: Validates session presence for all protected routes.
- **Role-Based Access**: Granular feature gates for subscription tiers.

---

## Protection Layers

### 1. Input Validation
- **Schema Validation**: All inputs validated with Zod schemas.
- **Sanitization**: XSS protection on all user-generated content (HTML/Markdown).
- **Type Safety**: Strict TypeScript compliance (no `any`).

### 2. API Security
- **Rate Limiting**: Token bucket algorithm per user IP.
- **Request Size**: Limits enforced on all POST/PUT endpoints.
- **Method Limits**: Strict HTTP method enforcement.

### 3. Database Security
- **Parameterized Queries**: All DB access via Prisma ORM (prevents SQLi).
- **Connection**: Encrypted SSL connections to database.
- **Pool Management**: Connection pooling for serverless reliability.

---

## AI Safety

### Analysis Pipeline
1. **Input**: User prompt → `sanitizePrompt` (strip PII/injection).
2. **Processing**: `analyzeParaCaptureSafe` wrapper handles complexity.
3. **Output**: Result validation before DB write.

### Audit
- **Status**: Passed (Jan 2025).
- **Policy**: No direct client-side calls to external LLMs. All AI traffic routed through server-side proxies.

---

## Troubleshooting

### Common Auth Issues
- **Redirect Mismatch**: Ensure `NEXTAUTH_URL` matches domain exactly.
- **Cookie Errors**: Check browser third-party cookie settings.
- **OAuth Failure**: Verify Google Cloud Console redirect URIs (`/api/auth/callback/google`).

For deep-dive troubleshooting, refer to `HISTORY.md` for past incident logs.
