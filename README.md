# Neyro – PARA Productivity App

Opinionated, constrained PARA system (Projects, Areas, Resources, Archive) with inbox-first capture and weekly review.

## Stack
- Next.js 16 (App Router) + TypeScript
- NextAuth (Google)
- Prisma + PostgreSQL
- Tailwind CSS

## Setup
1. Create `.env`, set `DATABASE_URL`, and generate a stable `NEXTAUTH_SECRET` (or `AUTH_SECRET`). Set `NEXTAUTH_URL` per environment (`http://localhost:3001` in dev; your Vercel domain in prod). See Env Vars below.
2. Install deps: `npm install --legacy-peer-deps`
3. Run migrations & generate client: `npx prisma generate && npx prisma migrate dev --name init`
4. Start dev server: `npm run dev`

## Env Vars

Add a `.env` file at the project root with the following keys (fill in values):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neyro?schema=public

# NextAuth
NEXTAUTH_SECRET=replace-with-long-stable-secret
NEXTAUTH_URL=http://localhost:3001
# Alternatively:
# AUTH_SECRET=replace-with-long-stable-secret

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Google Gemini (optional – enables real AI capture)
GEMINI_API_KEY=

# AWS S3 (optional – direct uploads; if unset, local mock uploads are used)
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

Notes:
- If `GEMINI_API_KEY` is not set, AI capture routes return a deterministic mock decision for local dev.
- If S3 variables are not set, `/api/uploads/presign` falls back to a local mock PUT endpoint that saves under `public/uploads`.

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
- `npm run lint` – ESLint (warnings fail CI)
- `npm run typecheck` – TypeScript with no emit
- `npm run test` – Jest suite
- `npm run check` – lint + typecheck + test
- `npm run ci` – lint + typecheck + test + build (CI parity)
- `npm run build` – build
- `npm run build:native` – build for native apps (static export)
- `npm run start` – prod start
- `npm run prisma:generate` – Prisma client
- `npm run prisma:migrate` – create migration
- `npm run prisma:deploy` – apply pending migrations to the target DB (use in prod/staging)
- `npm run prisma:studio` – Prisma Studio
- `npm run setup:hooks` – point git to use `.githooks`

## Git hooks
- Run `npm run setup:hooks` once per clone to set `core.hooksPath` to `.githooks`.
- The pre-commit hook runs `npm run lint` and `npm run typecheck`; keep commits green by running `npm run check` before staging.

## CI
- Workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml) (Node 20, npm cache).
- Steps: install deps, lint, typecheck, test (`--passWithNoTests`), then build. Mirror locally with `npm run ci`.

### Native App Scripts (Capacitor)
- `npm run cap:sync` – sync web assets to native projects
- `npm run cap:ios` – open iOS project in Xcode
- `npm run cap:android` – open Android project in Android Studio
- `npm run cap:add:ios` – initialize iOS native project
- `npm run cap:add:android` – initialize Android native project
- `npm run ios:build` – build iOS archive for App Store
- `npm run android:build` – build Android release APK/AAB

## Notes
- Signed-in pages live under the `(dashboard)` route group and redirect to `/auth/login` when `auth()` has no user.
- Tailwind v4 inline usage in globals.

## App Store Deployment

Neyro can be deployed to the iOS App Store and Google Play Store using Capacitor. The app works as a PWA (Progressive Web App) and can also be packaged as native mobile apps.

### Setup for Native Apps
1. Install Capacitor dependencies (already included in `package.json`)
2. Initialize native projects: `npm run cap:add:ios` and `npm run cap:add:android`
3. Build for native: `npm run build:native`
4. Sync to native projects: `npm run cap:sync`

See [App Store Deployment Guide](docs/APP_STORE_DEPLOYMENT.md) for detailed instructions on:
- Configuring iOS and Android projects
- Building for App Store and Play Store
- Submitting to Apple App Store Connect and Google Play Console

The app includes native features such as:
- Camera capture for inbox items
- Native sharing
- Push notifications (when configured)
- Keyboard and status bar integration
- App lifecycle management

## Quickstart and E2E smoke (Windows PowerShell)

1) Start the dev server:
```
npm run dev
```

2) In another PowerShell, run the HTTP E2E smoke test (uses mock upload if S3 not set, and mock AI if no OpenAI key):
```
scripts/run_http_e2e.ps1 -HostUrl http://localhost:3000
```

## Quick Production Checklist

- Ensure `.env` is not committed and rotate any exposed secrets (DB, OAuth, Gemini keys).
- Run `npm run lint` and fix any warnings flagged as errors by your CI.
- Run `npm run build` locally and test the main flows: capture, classify, review, projects.
- Optionally run `npm audit` and address vulnerabilities before public release.

## Documentation

- [DEVELOPMENT.md](docs/DEVELOPMENT.md): Setup, architecture, deployment, and integration guides.
- [TESTING.md](docs/TESTING.md): Testing strategies, checklists, coverage, and reports.
- [HISTORY.md](docs/HISTORY.md): Changelog, fix logs, and audit reports.
- [ROADMAP.md](docs/ROADMAP.md): Future plans, features, and action items.
- [SECURITY.md](docs/SECURITY.md): Security hardening, auth details, and best practices.
