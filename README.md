# Neyro – PARA Productivity App

Opinionated, constrained PARA system (Projects, Areas, Resources, Archive) with inbox-first capture and weekly review.

## Stack
- Next.js 16 (App Router) + TypeScript
- NextAuth (Google)
- Prisma + PostgreSQL
- Tailwind CSS

## Setup
1. Copy `.env.example` to `.env`, set `DATABASE_URL`, and generate a stable `AUTH_SECRET` (keep this identical in every environment). Update `AUTH_URL` per environment (`http://localhost:3000` in dev, your Vercel domain in prod).
2. Install deps: `npm install --legacy-peer-deps`
3. Run migrations & generate client: `npx prisma generate && npx prisma migrate dev --name init`
4. Start dev server: `npm run dev`

## PARA rules enforced
- Inbox-first capture; classify to Project/Area/Resource/Archive with per-item and bulk actions.
- Item types (note/task/link) and done flag tracked on items.
- Max 7 active projects enforced on create/activate.
- Weekly review wizard (/review) logs inbox count, active projects, average area health, and updates areas.
- Dashboard shows inbox count, active project count, areas, latest review snapshot, and upcoming project deadlines.

## Routes
- `/auth/login` + `/auth/register` – Google auth
- `/` – dashboard snapshot
- `/inbox` – capture and classify
- `/projects` – CRUD with status + limit, `/projects/[id]` detail workspace
- `/areas` – CRUD + health scores, `/areas/[id]` detail workspace
- `/resources` – collections + reference items, `/resources/[id]` detail workspace
- `/archive` – restore archived items/projects/areas/resources
- `/review` – weekly review wizard

## Scripts
- `npm run dev` – start dev server
- `npm run build` – build
- `npm run start` – prod start
- `npm run lint` – ESLint
- `npm run prisma:generate` – Prisma client
- `npm run prisma:migrate` – create migration
- `npm run prisma:studio` – Prisma Studio

## Notes
- Signed-in pages live under the `(dashboard)` route group and redirect to `/auth/login` when `auth()` has no user.
- Tailwind v4 inline usage in globals.

## Quick Production Checklist

- Ensure `.env` is not committed and rotate any exposed secrets (DB, OAuth, OpenAI keys).
- Run `npm run lint` and fix any warnings flagged as errors by your CI.
- Run `npm run build` locally and test the main flows: capture, classify, review, projects.
- Optionally run `npm audit` and address vulnerabilities before public release.
