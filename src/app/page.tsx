import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0b0d0f]">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-6 py-16 md:gap-16 md:py-24">
        <header className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1e293b]">Neyro · PARA System</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-5xl">Minimal, decisive, PARA-native productivity.</h1>
            <p className="max-w-2xl text-lg text-[#555]">Capture sharply, stay under seven active projects, and review weekly with a calm, intentional workspace inspired by Linear, Superhuman, and Vercel.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/auth/login" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">Sign in with Google</Link>
              <Link href="/auth/register" className="rounded-md border border-[rgba(0,0,0,0.12)] px-5 py-3 text-sm font-semibold text-[#0b0d0f] hover:border-[#0b0d0f]">Create an account</Link>
            </div>
          </div>
          <div className="panel space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Designed for PARA</span>
              <span className="badge">Precision over clutter</span>
            </div>
            <ul className="space-y-2 text-sm text-[#555]">
              <li>• Inbox capture that stays calm</li>
              <li>• Seven active projects guardrail</li>
              <li>• Area health and standards tracking</li>
              <li>• Weekly review wizard with clean stats</li>
            </ul>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Projects",
              subtitle: "Stay under seven",
              body: "Focus on the right outcomes with a hard cap, crisp status, and clear next actions.",
            },
            {
              title: "Areas",
              subtitle: "Guard your standards",
              body: "Keep long-term responsibilities healthy with scores, standards, and recent touchpoints.",
            },
            {
              title: "Weekly review",
              subtitle: "Clarity in four steps",
              body: "Guided sweep for inbox, projects, areas, and a final snapshot you can trust.",
            },
          ].map((card) => (
            <div key={card.title} className="panel space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1e293b]">{card.title}</div>
              <div className="text-xl font-semibold">{card.subtitle}</div>
              <p className="text-sm text-[#555]">{card.body}</p>
            </div>
          ))}
        </section>

        <section className="panel space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Why Neyro</h2>
            <span className="pill">Fast, minimal, intentional</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Fast capture",
                body: "Add notes, tasks, and links instantly. Classify without noise or cognitive drag.",
              },
              {
                title: "Resource libraries",
                body: "Collections stay crisp—organized, searchable, and ready to promote into projects.",
              },
              {
                title: "Guardrails built-in",
                body: "Project caps, review prompts, and area scores keep the system focused.",
              },
              {
                title: "Serious privacy",
                body: "Your workspace is yours—no confetti, no distractions, just signal.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-2 rounded-md border border-[rgba(0,0,0,0.06)] bg-white px-4 py-3">
                <div className="text-sm font-semibold text-[#0b0d0f]">{item.title}</div>
                <p className="text-sm text-[#555]">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/inbox" className="rounded-md border border-[#0b0d0f] bg-[#0b0d0f] px-4 py-2 text-sm font-semibold text-white">Preview the app</Link>
            <Link href="/review" className="rounded-md border border-[rgba(0,0,0,0.12)] px-4 py-2 text-sm font-semibold text-[#0b0d0f] hover:border-[#0b0d0f]">Run a review</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
