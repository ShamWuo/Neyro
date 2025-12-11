import Link from "next/link";

const heroBullets = [
  "Inbox capture that classifies instantly - no extra decisions",
  "Hard cap on active projects with visible redlines",
  "Area health scores that surface neglected responsibilities",
  "Weekly review wizard that exports a clean summary",
];

const operationalProps = [
  {
    title: "Turn your inbox into one decisive flow",
    before: "Tasks and links live across apps and are never classified.",
    after: "Everything lands in a single inbox with rapid batch triage.",
    action: "Capture with the keyboard, sweep once, archive the rest.",
  },
  {
    title: "Limit active projects with enforced caps",
    before: "New work starts before the last project is finished.",
    after: "Neyro blocks you at seven and forces a pause before adding more.",
    action: "Pick the work that matters, pause the rest, finish faster.",
  },
  {
    title: "Generate weekly reviews automatically",
    before: "Reviews are skipped because compiling numbers takes an hour.",
    after: "Neyro pulls stats, drafts highlights, and shares a recap in minutes.",
    action: "Run the wizard, confirm wins, ship the summary.",
  },
  {
    title: "Surface neglected areas automatically",
    before: "Long-term responsibilities quietly decay.",
    after: "Area health scores show time-since-touch and prompt new actions.",
    action: "Glance at the coldest area, add one corrective task.",
  },
];

const differentiation = [
  "PARA enforced by default, not suggested",
  "Hard caps on active projects - no endless kanban boards",
  "Area health scores with objective touch timers",
  "Precision inbox with one-sweep classification",
  "Weekly review wizard with exportable summary",
];

const whyMetrics = [
  "Capture to classification in under one second",
  "Active projects hard capped at seven with alerts",
  "Weekly review draft generated in under two minutes",
  "Area health recalculated on every touch - no manual edits",
];

const flow = ["Inbox", "Projects", "Areas", "Resources"];

const primaryCta = "inline-flex items-center justify-center gap-2 rounded-md border border-[#0f172a] bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white visited:text-white hover:text-white focus:text-white focus-visible:text-white active:text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md";
const secondaryCta = "inline-flex items-center justify-center gap-2 rounded-md border border-[rgba(0,0,0,0.14)] bg-white px-5 py-3 text-sm font-semibold text-[#0b0d0f] visited:text-[#0b0d0f] hover:border-[#0b0d0f]";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] bg-[radial-gradient(circle_at_20%_20%,#e8edff_0,transparent_32%),radial-gradient(circle_at_80%_0,#ffe8d9_0,transparent_28%)] text-[#0b0d0f]">
      <div className="sticky top-0 z-20 border-b border-[rgba(0,0,0,0.08)] bg-[rgba(248,249,250,0.8)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm">
          <div className="font-semibold tracking-tight">Neyro - PARA enforced</div>
          <div className="flex gap-2">
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              Build my PARA workspace
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              View a live demo
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 md:gap-14 md:py-20">
        <div className="flex flex-wrap gap-2 rounded-md border border-[rgba(0,0,0,0.08)] bg-white/70 px-4 py-3 text-xs font-semibold text-[#0b0d0f] shadow-sm backdrop-blur">
          <span className="rounded-full bg-[#0f172a] px-3 py-1 text-white">Speed: capture → classify in under 1s</span>
          <span className="rounded-full border border-[rgba(0,0,0,0.08)] px-3 py-1">Guardrail: max 7 active projects</span>
          <span className="rounded-full border border-[rgba(0,0,0,0.08)] px-3 py-1">Proof: weekly review ships a summary</span>
        </div>

        <header className="grid gap-10 md:grid-cols-[1.25fr_1fr] md:items-center">
          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1e293b]">Problem to Solution to Proof</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">
              Neyro enforces PARA for you: one inbox, seven active projects max, weekly review done for you.
            </h1>
            <p className="max-w-2xl text-lg text-[#0b0d0f]">
              Work is scattered across notes, docs, email, and ticket queues. Neyro locks everything into PARA, caps projects, scores areas, and ships a weekly review so you stop drowning and start finishing.
            </p>
            <p className="text-sm text-[#555]">PARA in one line: Inbox to Projects to Areas to Resources. Neyro automates the discipline so you do not have to.</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/auth/register" className={primaryCta}>
                Build my PARA workspace
              </Link>
              <Link href="/auth/login" className={secondaryCta}>
                Watch a 90s demo
              </Link>
              <div className="flex items-center gap-2 text-sm text-[#555]">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                <span>Pain we fix: information chaos and endless projects.</span>
              </div>
            </div>
          </div>
          <div className="panel space-y-3 shadow-lg ring-1 ring-[rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Precision overview</span>
              <span className="badge">PARA enforced</span>
            </div>
            <ul className="space-y-2 text-sm text-[#555]">
              {heroBullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[6px] h-2 w-2 rounded-full bg-[#0b0d0f]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-md border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] px-4 py-3 text-xs text-[#0b0d0f]">
              &quot;Another generic notes tool?&quot; No. Neyro is PARA with teeth: caps, scores, and a weekly review you can ship.
            </div>
          </div>
        </header>
        <div className="flex flex-wrap gap-3">
          <Link href="/auth/register" className={`${primaryCta} px-4 py-2 shadow-md shadow-[rgba(15,23,42,0.2)]`}>
            Start your 7-day clarity trial
          </Link>
          <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>View a live demo</Link>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">Problem to Solution</p>
              <h2 className="text-2xl font-semibold tracking-tight">People drown in notes and tasks. PARA fixes it, but discipline is hard. Neyro enforces it automatically.</h2>
            </div>
            <div className="pill">Why now: regain clarity</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel space-y-2">
              <div className="text-sm font-semibold text-[#0b0d0f]">Without Neyro</div>
              <ul className="space-y-1 text-sm text-[#555]">
                <li>- Infinite projects; nothing finishes.</li>
                <li>- PARA is optional and ignored.</li>
                <li>- Weekly reviews skipped because they take an hour.</li>
                <li>- Areas rot silently until they break.</li>
              </ul>
            </div>
            <div className="panel space-y-2">
              <div className="text-sm font-semibold text-[#0b0d0f]">With Neyro</div>
              <ul className="space-y-1 text-sm text-[#555]">
                <li>- PARA is the only path: inbox / project / area / resource.</li>
                <li>- Hard cap at seven active projects with visible redlines.</li>
                <li>- Weekly review wizard ships a summary in minutes.</li>
                <li>- Area health scores show time-since-touch and prompt action.</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              Build my PARA workspace
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              See it in action
            </Link>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">Operational value</p>
              <h2 className="text-2xl font-semibold tracking-tight">Concrete actions, measurable outcomes.</h2>
            </div>
            <div className="pill">Outcome over aesthetics</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {operationalProps.map((prop) => (
              <div key={prop.title} className="panel space-y-2">
                <div className="text-sm font-semibold text-[#0b0d0f]">{prop.title}</div>
                <div className="text-xs font-semibold text-[#1e293b]">Before</div>
                <p className="text-sm text-[#555]">{prop.before}</p>
                <div className="text-xs font-semibold text-[#1e293b]">After</div>
                <p className="text-sm text-[#0b0d0f]">{prop.after}</p>
                <div className="rounded-md border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] px-3 py-2 text-xs text-[#0b0d0f]">Action: {prop.action}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              Start enforcing PARA
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              View the weekly wizard
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">Differentiation</p>
              <h2 className="text-2xl font-semibold tracking-tight">Not another notes app. Neyro enforces PARA with teeth.</h2>
            </div>
            <div className="pill">Precision inbox + Hard caps + Health scores</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {differentiation.map((item) => (
              <div key={item} className="panel text-sm font-semibold text-[#0b0d0f]">
                {item}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              Build with guardrails
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              See the guardrails
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">Product story</p>
              <h2 className="text-2xl font-semibold tracking-tight">Flow: inbox / projects / areas / resources.</h2>
            </div>
            <div className="pill">Narrative arc</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0b0d0f]">
                {flow.map((stage, idx) => (
                  <span key={stage} className="flex items-center gap-2">
                    <span className="rounded border border-[rgba(0,0,0,0.12)] bg-[#f8f9fa] px-3 py-1">{stage}</span>
                    {idx < flow.length - 1 && <span className="text-[#555]">/</span>}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[#555]">Neyro locks every item into PARA. No stray docs. No mystery tasks. Everything flows through the same path.</p>
              <div className="flex flex-wrap gap-2 text-xs text-[#555]">
                <span className="rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-1">Precision inbox</span>
                <span className="rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-1">Project hard caps</span>
                <span className="rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-1">Area health</span>
                <span className="rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-1">Resource library</span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="panel space-y-2">
                <div className="text-sm font-semibold text-[#0b0d0f]">Project card</div>
                <div className="rounded border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] p-3 text-xs text-[#0b0d0f]">Outcome, next step, deadline, status badge, redline at seven of seven.</div>
              </div>
              <div className="panel space-y-2">
                <div className="text-sm font-semibold text-[#0b0d0f]">Area health score</div>
                <div className="rounded border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] p-3 text-xs text-[#0b0d0f]">Score, time since touch, standards checklist, prompt to add one action.</div>
              </div>
              <div className="panel space-y-2">
                <div className="text-sm font-semibold text-[#0b0d0f]">Weekly review screen</div>
                <div className="rounded border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] p-3 text-xs text-[#0b0d0f]">Four-step wizard with stats, highlights, and exportable summary.</div>
              </div>
              <div className="panel space-y-2">
                <div className="text-sm font-semibold text-[#0b0d0f]">Inbox capture flow</div>
                <div className="rounded border border-[rgba(0,0,0,0.08)] bg-[#f8f9fa] p-3 text-xs text-[#0b0d0f]">Keyboard capture, auto-classify, confirm destination, done.</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              See the flow in-app
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              View demo screens
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">Visual proof</p>
              <h2 className="text-2xl font-semibold tracking-tight">UI mock sections (replace with real screenshots when ready).</h2>
            </div>
            <div className="pill">Show, do not just tell</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel space-y-2">
              <div className="text-sm font-semibold text-[#0b0d0f]">Dashboard snapshot</div>
              <div className="h-44 rounded-md border border-[rgba(0,0,0,0.08)] bg-gradient-to-br from-[#e5e7eb] to-[#f8f9fa]" />
              <p className="text-sm text-[#555]">Insert a real screenshot of the home dashboard with caps and health scores visible.</p>
            </div>
            <div className="panel space-y-2">
              <div className="text-sm font-semibold text-[#0b0d0f]">Weekly review wizard</div>
              <div className="h-44 rounded-md border border-[rgba(0,0,0,0.08)] bg-gradient-to-br from-[#e5e7eb] to-[#f8f9fa]" />
              <p className="text-sm text-[#555]">Highlight the four-step flow and the generated summary export.</p>
            </div>
            <div className="panel space-y-2">
              <div className="text-sm font-semibold text-[#0b0d0f]">Precision inbox</div>
              <div className="h-32 rounded-md border border-[rgba(0,0,0,0.08)] bg-gradient-to-br from-[#e5e7eb] to-[#f8f9fa]" />
              <p className="text-sm text-[#555]">Show the capture bar, classification chips, and batch triage.</p>
            </div>
            <div className="panel space-y-2">
              <div className="text-sm font-semibold text-[#0b0d0f]">Area health</div>
              <div className="h-32 rounded-md border border-[rgba(0,0,0,0.08)] bg-gradient-to-br from-[#e5e7eb] to-[#f8f9fa]" />
              <p className="text-sm text-[#555]">Display scores, time-since-touch, and a suggested action.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              Insert real screenshots
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              Preview the UI
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">Why Neyro</p>
              <h2 className="text-2xl font-semibold tracking-tight">Metrics and contrast.</h2>
            </div>
            <div className="pill">Speed + enforcement</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {whyMetrics.map((m) => (
              <div key={m} className="panel text-sm font-semibold text-[#0b0d0f]">
                {m}
              </div>
            ))}
          </div>
          <div className="panel space-y-2">
            <div className="text-sm font-semibold text-[#0b0d0f]">Contrast vs the usual tools</div>
            <ul className="space-y-1 text-sm text-[#555]">
              <li>- Notion: flexible but PARA is optional. Neyro enforces PARA with caps.</li>
              <li>- Evernote: notes only. Neyro runs PARA flow plus weekly review automation.</li>
              <li>- Apple Notes: quick capture. Neyro adds capture plus guardrails and health scores.</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              Try the enforced PARA
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              See the speed
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">Onboarding</p>
              <h2 className="text-2xl font-semibold tracking-tight">Get started in two minutes. Leave anytime.</h2>
            </div>
            <div className="pill">Zero friction</div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="panel space-y-2 text-sm text-[#0b0d0f]">
              <div className="text-sm font-semibold">01 - Create workspace</div>
              <p className="text-sm text-[#555]">Sign in, set your cap, import nothing. Export everything later.</p>
            </div>
            <div className="panel space-y-2 text-sm text-[#0b0d0f]">
              <div className="text-sm font-semibold">02 - Capture and classify</div>
              <p className="text-sm text-[#555]">Drop tasks, notes, and links via keyboard. One sweep sends them to PARA.</p>
            </div>
            <div className="panel space-y-2 text-sm text-[#0b0d0f]">
              <div className="text-sm font-semibold">03 - Run the weekly wizard</div>
              <p className="text-sm text-[#555]">Confirm stats, export your summary, and share it. Done.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-[#555]">
            <span className="rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-1">Zero learning curve for PARA beginners</span>
            <span className="rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-1">Export everything anytime</span>
            <span className="rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-1">Onboarding preview included</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={`${primaryCta} px-4 py-2`}>
              Start in two minutes
            </Link>
            <Link href="/auth/login" className={`${secondaryCta} px-4 py-2`}>
              Preview onboarding
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1e293b]">CTA</p>
              <h2 className="text-2xl font-semibold tracking-tight">Ready to enforce PARA?</h2>
            </div>
            <div className="pill">Decide now</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className={primaryCta}>
              Build my PARA workspace
            </Link>
            <Link href="/auth/login" className={secondaryCta}>
              View a live demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
