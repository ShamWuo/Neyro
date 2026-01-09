# Devlog: Building Neyro – A PARA Productivity System

*A journey from concept to production-ready app*

---

## 🚀 The Beginning: Why Build Another Productivity App?

Every productivity app I've used feels like it's trying to do everything. I wanted something **opinionated**. Something that enforces the PARA methodology—not just suggests it, but actually **forces** you to follow the rules that make PARA work.

So I started building **Neyro**—a PARA (Projects, Areas, Resources, Archive) system that's ruthless about inbox-first capture and weekly reviews. No exceptions, no "maybe later." Just clean, focused productivity.

---

## 🏗️ Building the Foundation

### Stack Decisions

I went with **Next.js 15** (App Router) + **TypeScript** because I wanted:
- Server components for performance
- Type safety throughout
- Easy deployment to Vercel
- Built-in API routes

**Prisma + PostgreSQL** because:
- Type-safe database queries
- Easy migrations
- Great DX with Prisma Studio

**NextAuth (Google OAuth)** because:
- Quick auth setup
- Users don't need yet another password to remember

The foundation was solid, but the real challenge was enforcing the PARA constraints.

---

## 📥 The Inbox: Where Everything Starts

The inbox is the heart of PARA. Everything flows through it. I spent way too much time getting this right.

### Quick Capture Everywhere

I wanted capture to be **instant**. So I built:

- **Global keyboard shortcut (Ctrl+K / Cmd+K)** to open quick capture from anywhere
- **Floating action button** that follows you as you scroll
- **Voice input** using Web Speech API for hands-free capture
- **Bulk classification** so you can process multiple items at once

The voice input was particularly tricky. Getting it to work consistently across browsers while handling the async nature of speech recognition... let's just say there were a lot of `useEffect` hooks and `useState` calls involved.

### AI-Powered Classification

This was the fun part. I integrated **Google Gemini** to automatically classify inbox items.

```typescript
// The AI looks at your item and suggests:
// - Classification (Project/Area/Resource/Archive/Inbox)
// - Title extraction
// - Details parsing
// - Type detection (note/task/link)
```

When you don't have a Gemini API key, it falls back to a deterministic mock so development stays smooth. The AI analyzes the text, looks at your existing projects/areas, and makes intelligent suggestions. It's not always right, but it's right enough to save tons of time.

### Batch Operations & Duplicate Detection

I added duplicate detection that warns you before creating similar items. It uses fuzzy string matching to catch things like "Buy milk" and "buy milk" or "Meeting with John" and "Meeting: John."

Batch classification lets you select multiple items and move them all at once. Perfect for processing a backlog quickly.

---

## 🎯 Projects: The 7-Project Rule

Here's where PARA gets ruthless. **Maximum 7 active projects.** That's it. No negotiation.

### Enforcing the Cap

I built guards into the project creation flow:

```typescript
async function ensureProjectLimit(userId: string) {
  const activeCount = await prisma.project.count({
    where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null }
  });
  
  if (activeCount >= 7) {
    throw new Error("Maximum 7 active projects. Archive or complete one first.");
  }
}
```

Every time someone tries to create or activate a project, the system checks. No exceptions. This forces focus in a way that "unlimited projects" never could.

### Project Detail Pages

Each project has its own workspace with:
- **Completion percentage** calculated from done items
- **Nearest deadline** prominently displayed
- **Kanban board view** for visual task management
- **All items** linked to the project

The Kanban board was a nice touch—it shows items in columns (To Do, Due Soon, In Progress, Done) and makes it easy to see what needs attention.

---

## 🏘️ Areas: Health Scores & Standards

Areas are different from projects. They're ongoing responsibilities that need maintenance, not completion. So I built a **health score system**.

### Health Score Calculation

Every area gets a health score based on:
- **Time since last touch** (more recent = healthier)
- **Number of recent actions** (more activity = healthier)
- **Standards adherence** (user-defined standards)

The formula tweaks the score dynamically. Touch an area today? Score goes up. Haven't touched it in 30 days? Score drops.

```typescript
// Simplified health calculation
const daysSinceTouch = Math.floor((now - lastTouch) / (1000 * 60 * 60 * 24));
const healthScore = Math.max(0, 100 - (daysSinceTouch * 2));
```

### Area Trends

I added charts showing health score over time. Seeing an area's health trend downward is a powerful visual motivator to take action. The charts use a simple line graph that updates after each weekly review.

---

## 📚 Resources: Reference Libraries

Resources are knowledge bases. Articles, books, tools—anything you want to reference later but doesn't belong in Projects or Areas.

I kept this simple:
- **Collections** to group related resources
- **Full-text search** across all resources
- **Link enrichment** that extracts metadata from URLs

The search is fast thanks to Prisma's full-text search capabilities. Type a few keywords and instantly find that article you saved months ago.

---

## 📊 Weekly Review: The PARA Ritual

The weekly review is where PARA comes together. I built a **4-step wizard** that guides you through it.

### Step 1: Current State
- Inbox count
- Active project count
- Area health scores
- Recent activity

### Step 2: Process Inbox
- See all unclassified items
- Quick classification actions
- Bulk operations

### Step 3: Review & Reflect
- Project status updates
- Area health review
- Standards check
- Action prompts

### Step 4: Summary & Share
- Review completion stats
- Health score trends
- Shareable summary (with optional token-based sharing)

The wizard uses a progress indicator so you always know where you are. Each step validates before moving forward. You can't skip the hard parts.

---

## 🎨 Dark Mode & UI Polish

Dark mode was a must-have. I implemented system preference detection plus a manual toggle that cycles through light → dark → system.

### CSS Custom Properties

I used CSS custom properties for theming:

```css
:root {
  --bg: #f6f7fb;
  --text-primary: #0c1222;
  --primary: hsl(228 80% 50%);
}

[data-theme="dark"] {
  --bg: #0a0c12;
  --text-primary: #f7f8fd;
  --primary: hsl(228 80% 68%);
}
```

Everything just works. Toggle the theme, and all components instantly update. No prop drilling, no context chaos.

### Empty States & Loading Skeletons

I hate generic spinners. So I built:
- **Content-aware loading skeletons** that match the layout
- **Empty states** with helpful guidance
- **Inbox zero celebration** with confetti when you clear everything

The confetti animation was fun to build. It generates random particle positions, colors, and animation delays—but I had to fix the React purity warnings by pre-generating all random values in `useEffect` instead of during render.

---

## 🎤 Voice Input: The Hands-Free Experience

Voice capture was harder than I expected. The Web Speech API is... quirky.

### Challenges

1. **Browser compatibility** (WebKit prefix on Safari)
2. **Async state management** (recognition results come in chunks)
3. **Error handling** (microphone permissions, network issues)

I ended up with a robust component that:
- Detects browser support
- Falls back gracefully
- Shows visual feedback while listening
- Handles interruptions and errors

The transcription appears in real-time as you speak, which feels magical when it works.

---

## 🔍 Search: Find Anything, Fast

Full-text search across items, projects, areas, and resources. I added filters for:
- Classification (Inbox, Project, Area, Resource, Archive)
- Type (Note, Task, Link)
- Date ranges
- Sort options (newest, oldest, recently updated)

The search page uses URL params so you can bookmark specific searches. Clever, if I do say so myself.

---

## 📱 Mobile: PWA & Native Apps

I made Neyro a **Progressive Web App** (PWA) so it works offline and can be installed on phones.

### Capacitor Integration

I integrated **Capacitor** for native mobile apps. This gives:
- Camera access for photo capture
- Native sharing
- Push notifications
- Status bar control
- Keyboard integration

The tricky part was making Capacitor imports **optional** so the web build doesn't fail when the native packages aren't installed. Dynamic imports to the rescue!

### App Store Ready

I've now fully configured Neyro for iOS App Store and Google Play Store deployment:

- **Capacitor configuration** with iOS and Android project setup
- **Native camera integration** - Users can capture photos directly from the camera or gallery
- **Native sharing** - Share items, projects, and reviews using platform-native share sheets
- **Push notifications** - Configured for reminders, deadlines, and weekly review prompts
- **Status bar & keyboard** - Optimized native UI controls
- **Build scripts** - One-command builds for both platforms

The app can now be built as:
- **PWA** (Progressive Web App) - Installable from any browser
- **iOS App** - Native iOS app via Capacitor
- **Android App** - Native Android app via Capacitor

All native features gracefully fall back to web functionality when running in a browser, so the same codebase works everywhere.

### Pull-to-Refresh

I added native-style pull-to-refresh to the inbox page. It uses touch events to detect when users pull down at the top of the list, shows a progress indicator, and triggers a refresh when released. The component handles edge cases like touch cancellation and prevents conflicts with scrolling.

```typescript
// Pull-to-refresh with visual feedback
- Detects touch gestures at scroll top
- Shows progress indicator (0-100%)
- Triggers router.refresh() on release
- Handles touch cancellation gracefully
```

This makes the mobile experience feel native, even when running as a PWA.

---

## 🔐 Production Hardening

This was a grind, but necessary.

### Security

- Input validation and sanitization on all API routes
- XSS protection via string sanitization
- SQL injection protection (Prisma handles this, but I added extra validation)
- Authentication checks on every route
- Security headers (X-Frame-Options, CSP, etc.)

### Error Handling

- Error boundaries for graceful failures
- Global error handler for unhandled errors
- User-friendly error messages (no stack traces in production)
- Centralized logging system

### Type Safety

I eliminated **every single `any` type**. 100% type-safe codebase. This caught so many bugs before they made it to production.

### Testing

I wrote 24 tests covering:
- Component rendering
- API route validation
- Error handling
- User interactions

All passing. The test suite gives me confidence to ship.

---

## 🚀 SEO & Social Sharing

Because what's the point of building something if no one can find it?

### SEO Optimization

- Comprehensive metadata (title, description, keywords)
- Open Graph tags for rich social previews
- Twitter Cards
- JSON-LD structured data (Organization, SoftwareApplication, WebSite schemas)
- Dynamic sitemap generation
- Robots.txt configuration

### Dynamic OG Images

I built a dynamic Open Graph image generator using Next.js 15's `opengraph-image.tsx` API. Each page can have a custom OG image generated at build time. The landing page shows the app name and tagline in a beautiful gradient.

### Social Sharing

Added share buttons for:
- Twitter/X
- LinkedIn
- Reddit
- Hacker News
- Native share API (with fallback)

The native share integration was fun—it uses the Web Share API when available and falls back to manual copy/paste on older browsers.

---

## 📈 Analytics & Insights

I built a dashboard showing:
- Inbox count and trends
- Active project count
- Area health overview
- Weekly review completion streak
- Project completion percentages
- Recent activity feed

The streak counter is particularly motivating. Miss a weekly review? Streak resets. It's gamification that actually helps.

---

## 🎉 Launch Readiness

The final sprint involved:
- Comprehensive code cleanup
- Removing all `any` types
- Fixing React purity violations (Math.random in render)
- Making optional dependencies truly optional
- Writing documentation
- Creating deployment checklists

Everything is tested, secured, and documented. The codebase is production-ready.

---

## 💡 What I Learned

1. **Constraints create clarity.** The 7-project limit forces better decisions.

2. **Voice input is harder than it looks.** Browser APIs are inconsistent.

3. **Dark mode is essential.** Don't ship without it.

4. **Type safety catches bugs.** Eliminate `any` types early.

5. **SEO matters.** Even for productivity apps.

6. **Error handling is boring but critical.** Users remember crashes.

7. **Testing isn't optional.** 24 tests caught dozens of edge cases.

---

## 🎯 What's Next?

The foundation is solid. The app is now:
- ✅ **Production-ready** - Fully hardened and tested
- ✅ **Mobile-ready** - PWA + native app support
- ✅ **App Store ready** - Configured for iOS and Android deployment

Next steps (post-launch):
- Newsletter integration (Mailchimp/ConvertKit)
- Error tracking (Sentry)
- Rate limiting (Redis)
- More AI features
- App Store submission and launch

But for now, Neyro is ready to ship. It's opinionated, constrained, and ruthlessly focused on making PARA methodology actually work in practice. The mobile experience is polished, and users can install it as a native app or use it as a PWA—their choice.

---

*Built with Next.js 15, TypeScript, Prisma, and a lot of coffee.*

**Tech Stack:**
- Next.js 15 (App Router)
- TypeScript
- Prisma + PostgreSQL
- NextAuth (Google OAuth)
- Tailwind CSS v4
- Google Gemini AI
- Capacitor (Native apps)
- Web Speech API

**Status:** ✅ Production Ready | ✅ App Store Ready

---

*This devlog covers roughly half of Neyro's features. The other half includes advanced search, template system, keyboard shortcuts, command palette, reminders, tags, batch operations, duplicate detection, and more. Maybe I'll write about those in Part 2...*

