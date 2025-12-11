import Link from "next/link";

const stats = [
  { label: "Projects capped", value: "7", detail: "Hard guardrail" },
  { label: "Inbox to classify", value: "< 1s", detail: "Keyboard capture" },
  { label: "Weekly review", value: "4 steps", detail: "Guided wizard" },
  { label: "Area health", value: "Live", detail: "Auto prompts" },
];

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

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f5ff] text-[#0b0d0f]">
      <div className="absolute inset-0 -z-10 opacity-80">
        <div className="h-full w-full bg-[radial-gradient(circle_at_15%_20%,rgba(93,95,239,0.25),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(248,113,113,0.25),transparent_35%),linear-gradient(135deg,#f7f5ff,#fef9f4)]" />
      </div>
      <div className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm font-semibold">
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

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:gap-16 md:py-24">
        <header className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5b4bff] shadow-sm">
              PARA / Building a Second Brain
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#0f172a] md:text-5xl">
                PARA discipline, baked in. Capture fast, keep projects capped, keep areas healthy, and ship a weekly review.
              </h1>
              <p className="text-lg text-[#384152]">
                Neyro automates the rules from Tiago Forte&apos;s Building a Second Brain. One inbox, enforced PARA buckets, and a weekly cadence that actually happens.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className={`${primaryCta} shadow-[0_14px_35px_rgba(15,23,42,0.18)]`}>
                Start enforcing PARA
              </Link>
              <Link href="/auth/login" className={secondaryCta}>
                Watch product tour
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/60 bg-white/80 px-4 py-3 shadow-inner">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6c7280]">{stat.label}</div>
                  <div className="text-2xl font-semibold text-[#0f172a]">{stat.value}</div>
                  <p className="text-xs text-[#6c7280]">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-full w-full flex-col gap-4 rounded-2xl border border-white/50 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
            <div className="flex items-center justify-between text-sm font-semibold text-[#0f172a]">
              <span>Precision overview</span>
              <span className="rounded-full border border-[#dfe3f1] px-2 py-1 text-[11px] text-[#6c7280]">PARA enforced</span>
            </div>
            <div className="space-y-4 text-sm text-[#4a5364]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#848da7]">PARA guardrails</p>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#0f172a]" /> Single capture inbox</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#0f172a]" /> Seven active projects max</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#0f172a]" /> Area health scores</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#0f172a]" /> Weekly review wizard</li>
                </ul>
              </div>
              <div className="rounded-lg border border-[#e7e9f4] bg-gradient-to-br from-[#eef1ff] to-white px-4 py-3 text-xs text-[#0f172a]">
                &ldquo;Another notes app No. Neyro keeps PARA honest: caps projects, nudges reviews, and turns a second brain into output.&rdquo;
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
