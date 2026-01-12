# Developer Guide

Central documentation for setup, architecture, deployment, and integrations for Neyro.

## Table of Contents
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Integrations](#integrations)
  - [Stripe & Payments](#stripe--payments)
  - [Prisma Data Platform](#prisma-data-platform)
  - [MCP Servers](#mcp-servers)

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Stripe Account (for payments)

### Installation
```bash
npm install
npx prisma generate
npm run dev
```

### Running Tests
```bash
npm test
```

---

## Architecture

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (100% strictness)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (Google OAuth)
- **Styling**: Tailwind CSS v4
- **Mobile**: Capacitor (iOS/Android)
- **AI**: Google Gemini

### Key Features
- **Type Safety**: No `any` types allowed.
- **Error Handling**: Centralized logging and try-catch blocks.
- **Security**: Input validation, XSS protection, and route authentication.

---

## Environment Variables

Copy `.env.example` to `.env`.

### Required
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
AUTH_SECRET=... # Generate with `openssl rand -base64 32`
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GEMINI_API_KEY=...
```

### Optional / Integration
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_FOCUS_MONTHLY=price_...
STRIPE_PRICE_FOCUS_YEARLY=price_...
STRIPE_PRICE_BRAIN_TRUST_MONTHLY=price_...
STRIPE_PRICE_BRAIN_TRUST_YEARLY=price_...

# Other
NEXT_PUBLIC_APP_URL=http://localhost:3000
S3_BUCKET=...
```

---

## Deployment

### Production (Vercel)
1. Configure Environment Variables in Vercel.
2. Ensure `DATABASE_URL` uses connection pooling (see Prisma section).
3. Deploy: `git push`

### Mobile (Capacitor)
```bash
# Build web assets
npm run build:native
npm run cap:sync

# Open IDEs
npm run cap:ios     # Requires Xcode
npm run cap:android # Requires Android Studio
```

---

## Integrations

### Stripe & Payments

**Setup:**
1. Get API Keys from Stripe Dashboard.
2. Create Products: "Focus" ($18/mo) and "Brain Trust" ($29/mo).
3. Add Price IDs to `.env`.
4. Setup Webhooks: Point to `/api/stripe/webhook` (Events: `checkout.session.completed`, `customer.subscription.*`).

**Local Testing:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Prisma Data Platform

**Connection Pooling:**
Required for serverless deployments (Vercel).
1. Connect DB to Prisma Data Platform.
2. Get Pooling URL (`pgbouncer=true`).
3. Set `DATABASE_URL` to pooling URL in Vercel.
4. Set `DIRECT_URL` for migrations.

### MCP Servers

**Status (tested Jan 2025):**
- ✅ **Figma**: Working (User info, resource fetch).
- ✅ **Browser**: Working (Navigation, snapshots).
- ❌ **GitHub**: Requires Authentication setup.

---

## Development Logs

### Common Commands
- `npx prisma migrate dev`: Apply DB changes.
- `npx prisma studio`: GUI for database.
- `npm run lint`: Check for errors.
