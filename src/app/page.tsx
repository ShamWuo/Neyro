import Link from "next/link";
import dynamic from "next/dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SocialShare } from "@/components/social-share";
import { SocialProof } from "@/components/social-proof";
import { StructuredData } from "@/components/structured-data";
import { NewsletterSignupWrapper } from "@/components/newsletter-signup-wrapper";
import { SkipToMainContent } from "@/components/accessibility-skip-link";
import type { Metadata } from "next";
import { LoadingState } from "@/components/loading-state";

const RadialOrbitalTimelineDemo = dynamic(
  () => import("@/components/ui/radial-orbital-timeline-demo"),
  {
    loading: () => <LoadingState type="card" />,
  }
);

export const metadata: Metadata = {
  title: "Neyro – Instant Clarity for All Your Goals | PARA Productivity App",
  description: "Neyro is the productivity app that enforces what actually works. Built on PARA—a verified and efficient framework—Neyro helps you capture everything once, classify it instantly, and cut through the noise. Stop managing your system and start finishing your projects.",
  openGraph: {
    title: "Neyro – Instant Clarity for All Your Goals | PARA Productivity App",
    description: "Neyro is the productivity app that enforces what actually works. Built on PARA—a verified and efficient framework—Neyro helps you capture everything once, classify it instantly, and cut through the noise.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Neyro – PARA Productivity App" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neyro – Instant Clarity for All Your Goals | PARA Productivity App",
    description: "Neyro is the productivity app that enforces what actually works. Built on PARA—a verified and efficient framework—Neyro helps you capture everything once, classify it instantly, and cut through the noise.",
    images: ["/og-image.png"],
  },
};

const features = [
  {
    icon: "⚡",
    title: "Instant Capture",
    description: "Every idea, task, and link captured in seconds. No friction, no second-guessing. Your inbox is your command center.",
  },
  {
    icon: "🎯",
    title: "Organize by Outcome",
    description: "Move items to projects, areas, or resources with one click. Smart classification helps you decide what matters.",
  },
  {
    icon: "✅",
    title: "Finish What Matters",
    description: "Seven projects max keeps you focused. See next actions and deadlines clearly—no endless lists, just results.",
  },
  {
    icon: "🚀",
    title: "Ship Weekly Goals",
    description: "Weekly review that takes 15 minutes, not an hour. Export, share, and keep your system current—every week.",
  },
];

const workflow = [
  { 
    step: "01",
    title: "Capture",
    description: "Every idea, task, and link goes straight to your inbox. Quick capture means nothing gets lost in the chaos.",
  },
  { 
    step: "02",
    title: "Organize",
    description: "Move items to Projects, Areas, Resources, or Archive instantly. Smart classification helps you decide what matters most.",
  },
  { 
    step: "03",
    title: "Finish",
    description: "Seven projects max keeps you focused. See next actions and deadlines clearly—no endless lists, just results.",
  },
  { 
    step: "04",
    title: "Ship",
    description: "Weekly review closes the loop. Export your summary, share progress, and keep your system current—every single week.",
  },
];

const testimonials = [
  {
    quote: "I stopped managing my to-do list and started shipping weekly goals. Neyro transformed chaos into finished products.",
    author: "Danica L.",
    role: "Creative Director",
    avatar: "DL",
  },
  {
    quote: "The workflow is direct and bold. Capture, organize, finish, ship—that's it. No features, just results.",
    author: "Jordan M.",
    role: "Product Lead",
    avatar: "JM",
  },
];

const pricing = [
  {
    name: "Capture",
    price: "$0",
    period: "forever",
    description: "Start shipping today",
    cta: { label: "Start free", href: "/auth/register" },
    features: [
      "Unlimited instant capture",
      "Organize by outcome",
      "7 project focus limit",
      "Weekly review preview",
    ],
  },
  {
    name: "Focus",
    price: "$18",
    period: "per month",
    description: "Full high-output workflow",
    highlighted: true,
    badge: "Most popular",
    cta: { label: "Upgrade to Focus", href: "/auth/register" },
    features: [
      "Everything in Capture",
      "Smart Assist & Integrity views",
      "Timeline + Activity trail",
      "Templates & sharing",
    ],
  },
  {
    name: "Brain Trust",
    price: "$29",
    period: "per month",
    description: "For teams shipping weekly",
    cta: { label: "Book a walkthrough", href: "/auth/login" },
    features: [
      "Everything in Focus",
      "Shared workspaces",
      "Team accountability",
      "Priority support",
    ],
  },
];

export default async function LandingPage() {
  // If user is authenticated, redirect to dashboard
  const session = await auth();
  if (session?.user?.id) {
    redirect("/home");
  }

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg)]" data-theme="light">
      <SkipToMainContent />
      <StructuredData />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary-strong)] to-[#1e40af] text-sm font-bold text-white shadow-[var(--elev-1)] transition-transform group-hover:scale-105">
              NE
            </div>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              Neyro
            </span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <Link 
              href="/pricing" 
              className="rounded-md px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--card-muted)] hover:text-[var(--text-primary)]"
            >
              Pricing
            </Link>
            <Link 
              href="/auth/login" 
              className="rounded-md px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--card-muted)] hover:text-[var(--text-primary)]"
            >
              Sign in
            </Link>
            <Link 
              href="/auth/register" 
              className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-5 py-2 text-sm font-semibold text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[var(--primary-weak)] blur-3xl opacity-20 md:opacity-30" />
          <div className="absolute bottom-1/4 right-1/4 h-[32rem] w-[32rem] rounded-full bg-[var(--accent-weak)] blur-3xl opacity-20 md:opacity-30" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--card)] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)] shadow-[var(--elev-1)] backdrop-blur-sm transition hover:shadow-[var(--elev-2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-strong)] animate-pulse" aria-hidden="true" />
              Built on PARA
            </div>
            <h1 className="mb-6 text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl xl:text-7xl">
              Instant clarity for all your goals.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] md:mb-12 md:text-xl">
              Neyro is the productivity app that enforces what actually works. Built on PARA—a verified and efficient framework—Neyro helps you capture everything once, classify it instantly, and cut through the noise. Stop managing your system and start finishing your projects.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 mb-10">
              <Link 
                href="/auth/register" 
                className="group relative w-full overflow-hidden rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-[var(--elev-2)] hover:scale-[1.02] active:scale-[0.98] sm:w-auto focus-visible:outline-2 focus-visible:outline-[var(--primary-strong)] focus-visible:outline-offset-2"
              >
                <span className="relative z-10">Start free — no credit card</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e40af] to-[var(--primary-strong)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </Link>
              <Link 
                href="/auth/login" 
                className="w-full rounded-md border-2 border-[var(--border-subtle)] bg-[var(--card)] px-8 py-3.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--primary-strong)] hover:bg-[var(--card-muted)] hover:shadow-sm active:scale-[0.98] sm:w-auto focus-visible:outline-2 focus-visible:outline-[var(--primary-strong)] focus-visible:outline-offset-2"
              >
                View demo
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-[var(--text-tertiary)]">
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">✨</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">🚀</span>
                <span>Set up in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">📱</span>
                <span>Works everywhere</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
              How Neyro works
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-secondary)]">
              Four core features that enforce the PARA method and keep your system current.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)] transition hover:shadow-[var(--elev-2)]"
              >
                <div className="mb-4 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-12 md:py-20 bg-[var(--card-muted)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
              The PARA workflow
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-secondary)]">
              A continuous loop that keeps your system current and actionable.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map((step, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]"
              >
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-strong)]">
                  {step.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA Visualization */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[radial-gradient(circle_at_10%_10%,rgba(87,114,255,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(255,155,108,0.15),transparent_35%),linear-gradient(135deg,var(--card),var(--card-muted))] p-8 shadow-[var(--elev-2)] md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                  PARA method
                </div>
                <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  See how everything connects
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Capture flows to projects, projects reference areas, areas link to resources. The weekly review closes the loop and keeps the system current.
                </p>
                <Link 
                  href="/auth/register"
                  className="inline-flex items-center rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-6 py-3 text-sm font-semibold text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]"
                >
                  Try it free
                </Link>
              </div>
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[var(--elev-1)]">
                <RadialOrbitalTimelineDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-[var(--card-muted)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
              Join productivity-focused teams
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-secondary)]">
              See how Neyro helps teams and individuals stay focused and finish projects.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary-strong)] to-[#1e40af] text-xs font-bold text-white shadow-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{testimonial.author}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <SocialProof />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
              Start free, upgrade when ready
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-[var(--text-secondary)]">
              Every plan includes the core workflow. Cancel anytime.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border px-5 py-6 shadow-[var(--elev-1)] ${
                  tier.highlighted
                    ? "border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_10%,var(--surface))]"
                    : "border-[var(--border-subtle)] bg-[var(--surface)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{tier.name}</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{tier.description}</p>
                  </div>
                  {tier.badge && (
                    <span className="rounded-full border border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_12%,transparent)] px-2 py-1 text-[11px] font-semibold text-[var(--primary-strong)]">Best for most</span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-[var(--text-primary)]">{tier.price}</span>
                  <span className="text-sm text-[var(--text-secondary)]">{tier.period}</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-[6px] h-2 w-2 rounded-full bg-[var(--primary-strong)]" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.cta.href}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition ${
                    tier.highlighted
                      ? "border-[var(--primary-strong)] bg-[var(--primary-strong)] text-[var(--text-inverse)] shadow-sm hover:shadow-[var(--elev-2)]"
                      : "border-[var(--border-subtle)] bg-[var(--card)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  {tier.cta.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-r from-[color-mix(in_srgb,var(--primary-strong)_15%,var(--surface))] via-[var(--surface)] to-[var(--surface-muted)] px-6 py-8 shadow-[var(--elev-1)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Next step</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">Ship your first weekly review and cap projects at seven.</p>
                <p className="text-sm text-[var(--text-secondary)]">Start free, upgrade when you need more AI credits, exports, or team accountability.</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <Link href="/auth/register" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">Start free</Link>
                <Link href="/auth/login" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Book a walkthrough</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter & Social */}
      <section className="py-12 md:py-20 bg-[var(--card-muted)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]">
              <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                Stay updated
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">Get productivity tips</h3>
              <p className="mb-6 text-sm text-[var(--text-secondary)]">
                Weekly insights on shipping more and staying focused.
              </p>
              <NewsletterSignupWrapper />
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] p-6 shadow-[var(--elev-1)]">
              <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                Share Neyro
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">Help others discover PARA</h3>
              <p className="mb-6 text-sm text-[var(--text-secondary)]">
                Share Neyro with your network and help them get more done with less.
              </p>
              <SocialShare
                title="Neyro – PARA Productivity App"
                description="Instant clarity for all your goals. Neyro is the productivity app that enforces what actually works. Built on PARA—a verified and efficient framework."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--card)] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary-strong)] to-[#1e40af] text-sm font-bold text-white shadow-sm">
                NE
              </div>
              <span className="text-lg font-semibold text-[var(--text-primary)]">Neyro</span>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-secondary)]">
              <Link href="/pricing" className="transition-colors hover:text-[var(--text-primary)]">Pricing</Link>
              <Link href="/auth/login" className="transition-colors hover:text-[var(--text-primary)]">Sign in</Link>
              <Link href="/auth/register" className="transition-colors hover:text-[var(--text-primary)]">Get started</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} Neyro. PARA productivity, enforced.
          </div>
        </div>
      </footer>
    </main>
  );
}
