import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start with Capture, scale to Focus, bring teams on Brain Trust.",
};

const tiers = [
  {
    name: "Capture",
    price: "$0",
    cadence: "forever",
    blurb: "Personal PARA starter",
    cta: { label: "Start free", href: "/auth/register" },
    features: [
      "Unlimited inbox capture",
      "7 active project cap",
      "Area health scores",
      "Weekly review wizard preview",
    ],
  },
  {
    name: "Focus",
    price: "$18",
    cadence: "per month",
    blurb: "Full PARA enforcement",
    highlighted: true,
    cta: { label: "Upgrade to Focus", href: "/auth/register" },
    features: [
      "Everything in Capture",
      "Smart Assist credits and integrity",
      "Timeline + activity trail",
      "Templates, exports, and calendar sync",
    ],
  },
  {
    name: "Brain Trust",
    price: "$29",
    cadence: "per user / mo",
    blurb: "For teams enforcing PARA",
    cta: { label: "Book a walkthrough", href: "/auth/login" },
    features: [
      "Everything in Focus",
      "Shared workspaces and roles",
      "Team streaks and accountability",
      "Priority support and onboarding",
    ],
  },
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes—Focus comes with a 14-day trial. No card required to start.",
  },
  {
    q: "Can I switch plans later?",
    a: "You can upgrade or downgrade any time. Changes prorate on the next cycle.",
  },
  {
    q: "How are AI credits handled?",
    a: "Capture includes a light allotment. Focus unlocks larger pools and fair-use overage options.",
  },
  {
    q: "Do you support teams?",
    a: "Brain Trust adds shared PARA spaces, roles, and onboarding help for rollouts.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-sm font-semibold">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Pricing</p>
            <p className="text-lg text-[var(--text-primary)]">Start with Capture, scale to Focus, bring teams on Brain Trust.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login" className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">Log in</Link>
            <Link href="/auth/register" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">Start free</Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-12">
        <section className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border px-5 py-6 shadow-[var(--elev-1)] ${
                tier.highlighted
                  ? "border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_10%,var(--surface))]"
                  : "border-[var(--border-subtle)] bg-[var(--surface)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{tier.name}</p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{tier.blurb}</p>
                </div>
                {tier.highlighted ? (
                  <span className="rounded-full border border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_12%,transparent)] px-2 py-1 text-[11px] font-semibold text-[var(--primary-strong)]">Best for most</span>
                ) : null}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[var(--text-primary)]">{tier.price}</span>
                <span className="text-sm text-[var(--text-secondary)]">{tier.cadence}</span>
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
        </section>

        <section className="grid gap-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[var(--elev-1)] md:grid-cols-[0.5fr_1fr]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">FAQ</p>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Money questions, answered.</h2>
            <p className="text-sm text-[var(--text-secondary)]">Transparent plans, clear AI credit handling, and simple team upgrades.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.q}</p>
                <p className="text-sm text-[var(--text-secondary)]">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-subtle)] bg-gradient-to-r from-[color-mix(in_srgb,var(--primary-strong)_15%,var(--surface))] via-[var(--surface)] to-[var(--surface-muted)] px-6 py-8 shadow-[var(--elev-1)]">
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
        </section>
      </main>
    </div>
  );
}
