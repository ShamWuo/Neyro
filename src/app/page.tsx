import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 md:py-24">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-wide text-zinc-500">NEYRO · PARA SYSTEM</p>
            <h1 className="text-4xl font-bold leading-tight text-zinc-900 md:text-5xl">Organize projects, protect areas, keep a calm inbox.</h1>
            <p className="max-w-2xl text-lg text-zinc-600">A focused PARA workspace with inbox capture, seven-project guardrails, area reviews, and resource libraries—all in one place.</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link href="/auth/login" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white shadow-md hover:-translate-y-[1px] hover:shadow-lg transition">Sign in with Google</Link>
            <Link href="/auth/register" className="text-sm text-blue-700 underline">Create an account</Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase text-zinc-500">Projects</div>
            <div className="mt-2 text-xl font-semibold">Stay under seven</div>
            <p className="mt-2 text-sm text-zinc-600">Track active outcomes, enforce the seven-project limit, and move work forward with clear next actions.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase text-zinc-500">Areas</div>
            <div className="mt-2 text-xl font-semibold">Guard your standards</div>
            <p className="mt-2 text-sm text-zinc-600">Define standards, review health scores weekly, and capture next actions that protect long-term responsibilities.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase text-zinc-500">Review</div>
            <div className="mt-2 text-xl font-semibold">Weekly clarity</div>
            <p className="mt-2 text-sm text-zinc-600">A guided review to clear inbox, choose active projects, rescore areas, and log a weekly snapshot.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Why Neyro</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-zinc-700">Fast capture inbox</div>
              <p className="text-sm text-zinc-600">Add notes, tasks, and links quickly, then classify to projects, areas, or resources with inline moves.</p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-zinc-700">Resource libraries</div>
              <p className="text-sm text-zinc-600">Keep reference materials tidy with collections; restore anything from the archive without losing context.</p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-zinc-700">Guardrails built-in</div>
              <p className="text-sm text-zinc-600">Project cap, health scores, and review prompts ensure focus instead of sprawl.</p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-zinc-700">Simple to start</div>
              <p className="text-sm text-zinc-600">Sign in with Google and begin in minutes. Your workspace stays private.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/auth/login" className="rounded bg-black px-4 py-2 text-sm font-semibold text-white">Start now</Link>
            <Link href="/inbox" className="text-sm text-blue-700 underline">Preview the app</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
