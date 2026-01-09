import Link from "next/link";
import dynamic from "next/dynamic";
import { SocialShare } from "@/components/social-share";
import { SocialProof } from "@/components/social-proof";
import { StructuredData } from "@/components/structured-data";
import { NewsletterSignup } from "@/components/newsletter-signup";
import type { Metadata } from "next";
import { LoadingState } from "@/components/loading-state"; // Used in dynamic import loading prop

// Code splitting: Load heavy components dynamically
const RadialOrbitalTimelineDemo = dynamic(
  () => import("@/components/ui/radial-orbital-timeline-demo"),
  {
    loading: () => <LoadingState type="card" />,
  }
);

export const metadata: Metadata = {
  title: "Neyro – PARA Productivity App | One Inbox, Seven Projects Max",
  description: "Neyro enforces the PARA workflow: capture everything once, classify to Projects/Areas/Resources, cap projects at seven, and ship weekly reviews. Opinionated productivity for people who want focus, not features.",
  openGraph: {
    title: "Neyro – PARA Productivity App | One Inbox, Seven Projects Max",
    description: "Neyro enforces the PARA workflow: capture everything once, classify to Projects/Areas/Resources, cap projects at seven, and ship weekly reviews.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Neyro – PARA Productivity App" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neyro – PARA Productivity App | One Inbox, Seven Projects Max",
    description: "Neyro enforces the PARA workflow: capture everything once, classify to Projects/Areas/Resources, cap projects at seven, and ship weekly reviews.",
    images: ["/og-image.png"],
  },
};

const pillars = [
  {
    title: "Capture to Clarify",
    description: "One inbox for every task, note, or resource. Batch classify to Projects, Areas, Resources, or Archive in seconds.",
    actions: ["Quick capture", "Bulk classify", "Link enrichment"],
  },
  {
    title: "Projects to Finish",
    description: "Seven active projects max. Neyro enforces the cap, surfaces dormant work, and keeps the next actions visible.",
    actions: ["Redline guardrail", "Nearest deadline row", "Templates"],
  },
  {
    title: "Areas to Healthy",
    description: "Areas carry standards and health scores. Touch an area and the score updates automatically so nothing decays unseen.",
    actions: ["Time-since-touch", "Standards checklist", "Add one action prompts"],
  },
  {
    title: "Weekly Review to Ship",
    description: "A four-step wizard pulls stats, highlights, and exports a recap so PARA stays trusted and shareable.",
    actions: ["Auto metrics", "Shareable summary", "Timeline streaks"],
  },
];

const workflow = [
  { title: "Inbox", copy: "Capture without friction and enforce classification." },
  { title: "Projects", copy: "Stay under seven, see deadlines, never guess what&apos;s active." },
  { title: "Areas", copy: "Standards, health scores, and prompts keep responsibilities alive." },
  { title: "Resources", copy: "Reference libraries attached to the work so projects stay light." },
];

const testimonials = [
  {
    quote: "I stopped juggling five tools. Neyro keeps me honest about PARA and finally gives me a weekly review I ship.",
    author: "Danica L., Creative Director",
  },
  {
    quote: "The guardrails force focus. Project caps, streaks, and area health make PARA more than a theory.",
    author: "Jordan M., Product Lead",
  },
];

const roi = [
  { title: "Save 2 hours weekly", copy: "Weekly review exports cut prep time and keep leaders aligned." },
  { title: "Stay under 7 projects", copy: "Guardrails prevent overcommitment and improve completion rates." },
  { title: "Inbox to action", copy: "Smart classification moves captures into PARA in seconds." },
  { title: "Team accountability", copy: "Shared timelines and streaks keep everyone honest." },
];

const primaryCta =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-inverse)] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md";
const secondaryCta =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]";

const pricing = [
  {
    name: "Capture",
    price: "$0",
    blurb: "Personal PARA starter",
    cta: { label: "Start free", href: "/auth/register" },
    features: ["Unlimited inbox capture", "7 project cap dashboard", "Area health scores", "Weekly review wizard preview"],
  },
  {
    name: "Focus",
    price: "$18",
    cadence: "per month",
    blurb: "Full PARA enforcement",
    highlighted: true,
    cta: { label: "Upgrade to Focus", href: "/auth/register" },
    features: ["Everything in Capture", "Smart Assist & Integrity views", "Timeline + Activity trail", "Templates & sharing"],
  },
  {
    name: "Brain Trust",
    price: "$29",
    cadence: "per month",
    blurb: "For teams enforcing PARA",
    cta: { label: "Book a walkthrough", href: "/auth/login" },
    features: ["Everything in Focus", "Shared PARA workspaces", "Team streak & accountability", "Priority support"],
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]" data-theme="light">
      <StructuredData />
      <div className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--card)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 text-sm font-semibold">
          <span>Neyro :: PARA enforced</span>
          <div className="flex gap-2">
            <Link href="/pricing" className={`${secondaryCta} px-4 py-2`}>
              Pricing
            </Link>
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              Build workspace
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              View demo
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-14 md:gap-14 md:py-20">
        <header className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--primary-strong)]">
              PARA, no theatrics
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-[var(--text-primary)] md:text-[44px]">
                One inbox. Seven projects max. Ship the weekly review.
              </h1>
              <p className="text-lg text-[var(--text-secondary)]">
                Neyro strips the PARA workflow to the essentials so people know exactly what to do: capture, classify, focus, and close the loop.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className={`${primaryCta} shadow-[var(--elev-2)]`}>
                Start free
              </Link>
              <Link href="/auth/login" className={secondaryCta}>
                See product tour
              </Link>
            </div>
            <div className="grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">What are you?</p>
                <p className="font-semibold text-[var(--text-primary)]">PARA workspace with enforced guardrails</p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">What should I do?</p>
                <p className="font-semibold text-[var(--text-primary)]">Capture now, classify, and cap projects at seven</p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md justify-self-end rounded-2xl border border-[var(--border-subtle)] bg-[var(--primary-strong)] p-5 text-[var(--text-inverse)] shadow-[var(--elev-2)]">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Today&apos;s PARA loop</span>
              <span className="rounded-full border border-[var(--text-inverse)]/25 px-2 py-1 text-[11px] text-[var(--text-inverse)]/80">Action first</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-[var(--text-inverse)]/85">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--success)]" />
                <div>
                  <p className="font-semibold">Inbox → classify</p>
                  <p className="text-[var(--text-inverse)]/70">Add anything and move it to Projects, Areas, Resources, or Archive in under 10 seconds.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--primary)]" />
                <div>
                  <p className="font-semibold">Projects capped at 7</p>
                  <p className="text-[var(--text-inverse)]/70">See next actions and deadlines without the clutter of endless lists.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[var(--warning)]" />
                <div>
                  <p className="font-semibold">Weekly review wizard</p>
                  <p className="text-[var(--text-inverse)]/70">A four-step recap that keeps PARA trusted and ship-ready.</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">System pillars</p>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">The PARA loop, automated.</h2>
              <p className="text-sm text-[var(--text-secondary)]">Inbox &gt; Projects &gt; Areas &gt; Resources &gt; Weekly review in one uninterrupted loop.</p>
            </div>
            <Link href="/auth/register" className={secondaryCta}>
              View PARA tour
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{pillar.title}</div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{pillar.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-tertiary)]">
                  {pillar.actions.map((action) => (
                    <span key={action} className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] md:grid-cols-[0.55fr_0.45fr] md:items-center">
          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Para method</p>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Orbit through Capture → Projects → Areas → Resources → Review.</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              The radial PARA orbit shows how Neyro keeps the loop moving: capture everything once, promote to projects, sustain areas, attach resources, and close the loop with review.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Click any node to spotlight dependencies and see energy flowing through the PARA system.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-strong)] p-4 shadow-[var(--elev-2)]">
            <RadialOrbitalTimelineDemo />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {workflow.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-5 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Step {index + 1}</p>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{step.title}</h3>
                </div>
                <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]">PARA</span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{step.copy}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Social proof</p>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Join productivity-focused teams</h2>
            <p className="text-sm text-[var(--text-secondary)]">See how Neyro helps teams and individuals stay focused.</p>
          </div>
          <SocialProof />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.author} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-5 shadow-[var(--elev-1)]">
              <p className="text-lg font-semibold text-[var(--text-primary)]">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-sm text-[var(--text-tertiary)]">{t.author}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">ROI</p>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Time back, fewer projects, cleaner reviews.</h2>
              <p className="text-sm text-[var(--text-secondary)]">Focus plan pays for itself when you ship consistent weekly reviews and keep projects under control.</p>
            </div>
            <Link href="/pricing" className={secondaryCta}>
              See plans
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {roi.map((item) => (
              <div key={item.title} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Pricing</p>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Install PARA discipline at any stage.</h2>
              <p className="text-sm text-[var(--text-secondary)]">Every plan enforces Inbox → Projects → Areas → Resources and the weekly review loop.</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-strong)]">Cancel anytime</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border px-5 py-6 shadow-sm ${
                  tier.highlighted ? "border-[var(--primary-strong)] bg-[var(--primary-strong)] text-[var(--text-inverse)] shadow-[var(--elev-2)]" : "border-[var(--border-subtle)] bg-[var(--card)] text-[var(--text-primary)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em]">{tier.name}</div>
                  {tier.highlighted && <span className="rounded-full border border-[var(--text-inverse)]/50 px-2 py-1 text-[11px]">Most popular</span>}
                </div>
                <div className="mt-3 text-3xl font-semibold">{tier.price}</div>
                {tier.cadence && <div className="text-xs text-current/70">{tier.cadence}</div>}
                <p className={`mt-2 text-sm ${tier.highlighted ? "text-[var(--text-inverse)]/80" : "text-[var(--text-secondary)]"}`}>{tier.blurb}</p>
                <ul className={`mt-4 space-y-2 text-sm ${tier.highlighted ? "text-[var(--text-inverse)]/90" : "text-[var(--text-secondary)]"}`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.cta.href}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition hover:-translate-y-[1px] ${
                    tier.highlighted ? "border-[var(--text-inverse)] bg-[var(--text-inverse)] text-[var(--primary-strong)] hover:shadow-sm" : "border-[var(--primary-strong)] text-[var(--primary-strong)] hover:bg-[var(--primary-weak)]"
                  }`}
                >
                  {tier.cta.label}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--primary-strong)] p-6 text-[var(--text-inverse)] shadow-[var(--elev-2)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-inverse)]/70">Final CTA</p>
              <h2 className="text-3xl font-semibold tracking-tight">Ready to install PARA discipline</h2>
              <p className="text-sm text-[var(--text-inverse)]/80">Log in with Google, capture something into the inbox, and feel the guardrails immediately.</p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Link href="/auth/register" className="inline-flex items-center justify-center rounded-md border border-[var(--text-inverse)] bg-[var(--text-inverse)] px-5 py-3 text-sm font-semibold text-[var(--primary-strong)] shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
                Create my Neyro workspace
              </Link>
              <Link href="/auth/login" className="inline-flex items-center justify-center rounded-md border border-[var(--text-inverse)]/50 px-5 py-2 text-sm font-semibold text-[var(--text-inverse)]/90 hover:border-[var(--text-inverse)]/70">
                I already have access
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Stay updated</p>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Get PARA productivity tips</h2>
                <p className="text-sm text-[var(--text-secondary)]">Weekly insights on staying focused and shipping more.</p>
              </div>
              <NewsletterSignup />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]">
            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Share Neyro</p>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Help others discover PARA discipline</h2>
                <p className="text-sm text-[var(--text-secondary)]">Share Neyro with your network and help them get more done with less.</p>
              </div>
              <SocialShare
                title="Neyro – PARA Productivity App"
                description="One inbox. Seven projects max. Ship the weekly review. Neyro enforces the PARA workflow so you can focus, not juggle tools."
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
