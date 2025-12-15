import Link from "next/link";
import RadialOrbitalTimelineDemo from "@/components/ui/radial-orbital-timeline-demo";

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
  { title: "Projects", copy: "Stay under seven, see deadlines, never guess what's active." },
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

const primaryCta =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[#0f172a] bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md";
const secondaryCta =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[rgba(0,0,0,0.14)] bg-white px-5 py-3 text-sm font-semibold text-[#0b0d0f] hover:border-[#0b0d0f]";

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
    <main className="min-h-screen bg-white text-[#0b0d0f]">
      <div className="sticky top-0 z-20 border-b border-[#e8ebf3] bg-white/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 text-sm font-semibold">
          <span>Neyro :: PARA enforced</span>
          <div className="flex gap-2">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8ebf3] bg-[#f7f8fc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4f5bff]">
              PARA, no theatrics
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#0f172a] md:text-[44px]">
                One inbox. Seven projects max. Ship the weekly review.
              </h1>
              <p className="text-lg text-[#3b4255]">
                Neyro strips the PARA workflow to the essentials so people know exactly what to do: capture, classify, focus, and close the loop.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className={`${primaryCta} shadow-[0_10px_28px_rgba(15,23,42,0.16)]`}>
                Start free
              </Link>
              <Link href="/auth/login" className={secondaryCta}>
                See product tour
              </Link>
            </div>
            <div className="grid gap-2 text-sm text-[#4c5366] sm:grid-cols-2">
              <div className="rounded-lg border border-[#eef1f6] bg-[#fafbff] px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#778198]">What are you?</p>
                <p className="font-semibold text-[#0f172a]">PARA workspace with enforced guardrails</p>
              </div>
              <div className="rounded-lg border border-[#eef1f6] bg-[#fafbff] px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#778198]">What should I do?</p>
                <p className="font-semibold text-[#0f172a]">Capture now, classify, and cap projects at seven</p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md justify-self-end rounded-2xl border border-[#e8ebf3] bg-[#0f172a] p-5 text-white shadow-[0_18px_55px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Today&apos;s PARA loop</span>
              <span className="rounded-full border border-white/25 px-2 py-1 text-[11px] text-white/80">Action first</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/85">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#5bffb1]" />
                <div>
                  <p className="font-semibold">Inbox → classify</p>
                  <p className="text-white/70">Add anything and move it to Projects, Areas, Resources, or Archive in under 10 seconds.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#8fb2ff]" />
                <div>
                  <p className="font-semibold">Projects capped at 7</p>
                  <p className="text-white/70">See next actions and deadlines without the clutter of endless lists.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#ffd480]" />
                <div>
                  <p className="font-semibold">Weekly review wizard</p>
                  <p className="text-white/70">A four-step recap that keeps PARA trusted and ship-ready.</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-8 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#768198]">System pillars</p>
              <h2 className="text-2xl font-semibold text-[#0f172a]">The PARA loop, automated.</h2>
              <p className="text-sm text-[#536072]">Inbox &gt; Projects &gt; Areas &gt; Resources &gt; Weekly review in one uninterrupted loop.</p>
            </div>
            <Link href="/auth/register" className={secondaryCta}>
              View PARA tour
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-xl border border-[#eff1fb] bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-[#0f172a]">{pillar.title}</div>
                <p className="mt-2 text-sm text-[#4a5364]">{pillar.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#59607a]">
                  {pillar.actions.map((action) => (
                    <span key={action} className="rounded-full border border-[#e0e5f4] bg-[#f6f8ff] px-3 py-1">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-white/40 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)] md:grid-cols-[0.55fr_0.45fr] md:items-center">
          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#768198]">Para method</p>
            <h2 className="text-2xl font-semibold text-[#0f172a]">Orbit through Capture → Projects → Areas → Resources → Review.</h2>
            <p className="text-sm text-[#536072]">
              The radial PARA orbit shows how Neyro keeps the loop moving: capture everything once, promote to projects, sustain areas, attach resources, and close the loop with review.
            </p>
            <p className="text-xs text-[#6c7280]">Click any node to spotlight dependencies and see energy flowing through the PARA system.</p>
          </div>
          <div className="rounded-2xl border border-white/40 bg-black/[0.92] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <RadialOrbitalTimelineDemo />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {workflow.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8790a0]">Step {index + 1}</p>
                  <h3 className="text-lg font-semibold text-[#0f172a]">{step.title}</h3>
                </div>
                <span className="rounded-full border border-[#dee1f1] px-3 py-1 text-xs text-[#656c83]">PARA</span>
              </div>
              <p className="mt-3 text-sm text-[#4d5468]">{step.copy}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.author} className="rounded-2xl border border-white/50 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <p className="text-lg font-semibold text-[#0f172a]">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-sm text-[#6c7280]">{t.author}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6 rounded-2xl border border-white/50 bg-white/70 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.1)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#768198]">Pricing</p>
              <h2 className="text-2xl font-semibold text-[#0f172a]">Install PARA discipline at any stage.</h2>
              <p className="text-sm text-[#536072]">Every plan enforces Inbox → Projects → Areas → Resources and the weekly review loop.</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b4bff]">Cancel anytime</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricing.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border px-5 py-6 shadow-sm ${
                  tier.highlighted ? "border-[#0f172a] bg-[#0f172a] text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)]" : "border-white/60 bg-white text-[#0f172a]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold uppercase tracking-[0.2em]">{tier.name}</div>
                  {tier.highlighted && <span className="rounded-full border border-white/50 px-2 py-1 text-[11px]">Most popular</span>}
                </div>
                <div className="mt-3 text-3xl font-semibold">{tier.price}</div>
                {tier.cadence && <div className="text-xs text-current/70">{tier.cadence}</div>}
                <p className={`mt-2 text-sm ${tier.highlighted ? "text-white/80" : "text-[#536072]"}`}>{tier.blurb}</p>
                <ul className={`mt-4 space-y-2 text-sm ${tier.highlighted ? "text-white/90" : "text-[#4a5364]"}`}>
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.cta.href}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold ${
                    tier.highlighted ? "border-white bg-white text-[#0f172a]" : "border-[#0f172a] text-[#0f172a]"
                  }`}
                >
                  {tier.cta.label}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#0f172a]/10 bg-[#0f172a] p-6 text-white shadow-[0_25px_60px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Final CTA</p>
              <h2 className="text-3xl font-semibold tracking-tight">Ready to install PARA discipline</h2>
              <p className="text-sm text-white/80">Log in with Google, capture something into the inbox, and feel the guardrails immediately.</p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Link href="/auth/register" className="inline-flex items-center justify-center rounded-md border border-white bg-white px-5 py-3 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:-translate-y-[1px]">
                Create my Neyro workspace
              </Link>
              <Link href="/auth/login" className="inline-flex items-center justify-center rounded-md border border-white/50 px-5 py-2 text-sm font-semibold text-white/90">
                I already have access
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
