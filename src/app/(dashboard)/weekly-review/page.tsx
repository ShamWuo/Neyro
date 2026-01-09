import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

type WeeklyReviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WeeklyReviewPage({ searchParams }: WeeklyReviewPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const resolvedParams = (searchParams ? await searchParams : null) ?? {};
  const rawStep = resolvedParams.step;
  const step = Array.isArray(rawStep) ? rawStep[0] ?? "1" : rawStep ?? "1";

  const [inbox, projects, areas, reviews] = await Promise.all([
    prisma.item.findMany({ where: { userId, classification: ItemClassification.INBOX }, orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.weeklyReview.findMany({ where: { userId }, orderBy: { completedAt: "desc" }, take: 5 }),
  ]);

  async function markReview(formData: FormData) {
    "use server";
    const areaScores: { areaId: string; score: number }[] = [];
    areas.forEach((a) => {
      const value = formData.get(`area-${a.id}`);
      if (value) {
        const score = Number(value);
        if (score >= 1 && score <= 5) areaScores.push({ areaId: a.id, score });
      }
    });

    const [inboxCount, activeProjects] = await Promise.all([
      prisma.item.count({ where: { userId, classification: ItemClassification.INBOX } }),
      prisma.project.count({ where: { userId, status: ProjectStatus.ACTIVE, archivedAt: null } }),
    ]);

    const areaHealthAverage = areaScores.length
      ? areaScores.reduce((a, b) => a + b.score, 0) / areaScores.length
      : null;

    if (areaScores.length) {
      await Promise.all(
        areaScores.map(({ areaId, score }) =>
          prisma.area.update({ where: { id: areaId, userId }, data: { lastReviewDate: new Date(), lastHealthScore: score } })
        )
      );
    }

    await prisma.weeklyReview.create({
      data: {
        userId,
        inboxCount,
        activeProjectsCount: activeProjects,
        areaHealthAverage,
      },
    });
    redirect("/weekly-review?step=4&saved=1");
  }

  async function goToStep(next: string) {
    "use server";
    redirect(`/weekly-review?step=${next}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Weekly Review</h1>
          <p className="text-sm text-[var(--text-secondary)]">Guided sweep: inbox, projects, areas, then a dignified summary.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <div className="h-1 w-36 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div className="h-full bg-[var(--primary-strong)]" style={{ width: `${(Number(step) / 4) * 100}%` }} />
          </div>
          <span>Step {step} of 4</span>
        </div>
      </div>

      {step === "1" && (
        <section className="panel space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Step 1 – Inbox</h2>
              <p className="text-xs text-[var(--text-secondary)]">Clear or classify in the Inbox view; aim for zero before continuing.</p>
            </div>
            <span className="pill">{inbox.length} items</span>
          </div>
          <div className="flex gap-3 text-sm">
            <Link className="font-semibold text-[var(--text-tertiary)] underline" href="/inbox">
              Go to Inbox
            </Link>
            <form action={() => goToStep("2")}>
              <button className="rounded-md border border-[var(--text-primary)] bg-[var(--text-primary)] px-3 py-2 text-[var(--text-inverse)]">Next: Projects</button>
            </form>
          </div>
        </section>
      )}

      {step === "2" && (
        <section className="panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Step 2 – Projects</h2>
            <form action={() => goToStep("3")}>
              <button className="rounded-md border border-[var(--text-primary)] bg-[var(--text-primary)] px-3 py-2 text-[var(--text-inverse)] text-sm">Next: Areas</button>
            </form>
          </div>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-3 shadow-sm">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{p.name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">Outcome: {p.outcome}</div>
                  <div className="text-xs text-[var(--text-secondary)]">Status: {p.status}</div>
                </div>
                <div className="flex gap-2 text-xs">
                  <form action={async () => {
                    "use server";
                    await prisma.project.update({ where: { id: p.id, userId }, data: { status: ProjectStatus.ACTIVE } });
                    redirect("/weekly-review?step=2");
                  }}>
                    <button className="rounded-md border border-[var(--border-default)] px-2 py-1">Active</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await prisma.project.update({ where: { id: p.id, userId }, data: { status: ProjectStatus.PAUSED } });
                    redirect("/weekly-review?step=2");
                  }}>
                    <button className="rounded-md border border-[var(--border-default)] px-2 py-1">Pause</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await prisma.project.update({ where: { id: p.id, userId }, data: { status: ProjectStatus.COMPLETED } });
                    redirect("/weekly-review?step=2");
                  }}>
                    <button className="rounded-md border border-[var(--border-default)] px-2 py-1">Complete</button>
                  </form>
                </div>
              </div>
            ))}
            {projects.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No projects yet.</div>}
          </div>
        </section>
      )}

      {step === "3" && (
        <section className="panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Step 3 – Area check-in</h2>
            <div className="flex gap-2">
              <form action={() => goToStep("2")}>
                <button className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm">Back</button>
              </form>
              <button form="area-review" type="submit" className="rounded-md border border-[var(--text-primary)] bg-[var(--text-primary)] px-3 py-2 text-[var(--text-inverse)] text-sm">Complete & log</button>
            </div>
          </div>
          <form id="area-review" action={markReview} className="space-y-3">
            {areas.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{a.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{a.standard}</div>
                </div>
                <select name={`area-${a.id}`} className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-sm">
                  <option value="">Score</option>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {areas.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No areas yet.</div>}
          </form>
        </section>
      )}

      {step === "4" && (
        <section className="panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Step 4 – Summary</h2>
            <span className="pill">Review saved</span>
          </div>
          <div className="space-y-1 text-sm text-[var(--text-primary)]">
            <div>Inbox items: {inbox.length}</div>
            <div>Active projects: {projects.filter((p) => p.status === ProjectStatus.ACTIVE).length}</div>
            <div>Areas: {areas.length}</div>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">If you just logged a review, you&apos;re done. Otherwise, head back to log.</div>
          <div className="flex gap-2 text-sm">
            <form action={() => goToStep("1")}>
              <button className="rounded-md border border-[var(--border-default)] px-3 py-2">Restart review</button>
            </form>
            <Link className="rounded-md border border-[var(--text-primary)] bg-[var(--text-primary)] px-3 py-2 text-[var(--text-inverse)]" href="/home">
              Back to dashboard
            </Link>
          </div>
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-3 text-sm">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{r.completedAt.toISOString().slice(0, 10)}</div>
                  <div className="text-[var(--text-secondary)]">Inbox at start: {r.inboxCount}</div>
                  <div className="text-[var(--text-secondary)]">Active projects: {r.activeProjectsCount}</div>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Area avg: {r.areaHealthAverage ?? "n/a"}</div>
              </div>
            ))}
            {reviews.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No past reviews yet.</div>}
          </div>
        </section>
      )}
    </div>
  );
}
