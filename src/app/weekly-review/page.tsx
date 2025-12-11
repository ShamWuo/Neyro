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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Weekly Review</h1>
          <p className="text-sm text-zinc-600">Guided sweep: clear inbox, check projects, score areas.</p>
        </div>
        <div className="text-xs text-zinc-500">Step {step} of 4</div>
      </div>

      {step === "1" && (
        <section className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-700">Step 1 – Inbox</h2>
          <p className="text-xs text-zinc-600">Clear or classify in the Inbox view; aim for zero before continuing.</p>
          <div className="text-sm">Inbox items: {inbox.length}</div>
          <div className="flex gap-3 text-sm">
            <Link className="text-blue-600 underline" href="/inbox">
              Go to Inbox
            </Link>
            <form action={() => goToStep("2")}>
              <button className="rounded bg-black px-3 py-2 text-white">Next: Projects</button>
            </form>
          </div>
        </section>
      )}

      {step === "2" && (
        <section className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-700">Step 2 – Projects</h2>
            <form action={() => goToStep("3")}>
              <button className="rounded bg-black px-3 py-2 text-white text-sm">Next: Areas</button>
            </form>
          </div>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-zinc-600">Outcome: {p.outcome}</div>
                  <div className="text-xs text-zinc-500">Status: {p.status}</div>
                </div>
                <div className="flex gap-2 text-xs">
                  <form action={async () => {
                    "use server";
                    await prisma.project.update({ where: { id: p.id, userId }, data: { status: ProjectStatus.ACTIVE } });
                    redirect("/weekly-review?step=2");
                  }}>
                    <button className="rounded border px-2 py-1">Active</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await prisma.project.update({ where: { id: p.id, userId }, data: { status: ProjectStatus.PAUSED } });
                    redirect("/weekly-review?step=2");
                  }}>
                    <button className="rounded border px-2 py-1">Pause</button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await prisma.project.update({ where: { id: p.id, userId }, data: { status: ProjectStatus.COMPLETED } });
                    redirect("/weekly-review?step=2");
                  }}>
                    <button className="rounded border px-2 py-1">Complete</button>
                  </form>
                </div>
              </div>
            ))}
            {projects.length === 0 && <div className="text-sm text-zinc-500">No projects yet.</div>}
          </div>
        </section>
      )}

      {step === "3" && (
        <section className="space-y-4 rounded border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-700">Step 3 – Area check-in</h2>
            <div className="flex gap-2">
              <form action={() => goToStep("2")}>
                <button className="rounded border px-3 py-2 text-sm">Back</button>
              </form>
              <button form="area-review" type="submit" className="rounded bg-black px-3 py-2 text-white text-sm">Complete & log</button>
            </div>
          </div>
          <form id="area-review" action={markReview} className="space-y-3">
            {areas.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-zinc-500">{a.standard}</div>
                </div>
                <select name={`area-${a.id}`} className="rounded border border-zinc-300 px-2 py-1 text-sm">
                  <option value="">Score</option>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {areas.length === 0 && <div className="text-sm text-zinc-500">No areas yet.</div>}
          </form>
        </section>
      )}

      {step === "4" && (
        <section className="space-y-3 rounded border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-700">Step 4 – Summary</h2>
          <div className="space-y-1 text-sm text-zinc-700">
            <div>Inbox items: {inbox.length}</div>
            <div>Active projects: {projects.filter((p) => p.status === ProjectStatus.ACTIVE).length}</div>
            <div>Areas: {areas.length}</div>
          </div>
          <div className="text-xs text-zinc-500">If you just logged a review, you’re done. Otherwise, head back to log.</div>
          <div className="flex gap-2 text-sm">
            <form action={() => goToStep("1")}>
              <button className="rounded border px-3 py-2">Restart review</button>
            </form>
            <Link className="rounded bg-black px-3 py-2 text-white" href="/">
              Back to dashboard
            </Link>
          </div>
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.completedAt.toISOString().slice(0, 10)}</div>
                  <div className="text-zinc-600">Inbox at start: {r.inboxCount}</div>
                  <div className="text-zinc-600">Active projects: {r.activeProjectsCount}</div>
                </div>
                <div className="text-xs text-zinc-500">Area avg: {r.areaHealthAverage ?? "n/a"}</div>
              </div>
            ))}
            {reviews.length === 0 && <div className="text-sm text-zinc-500">No past reviews yet.</div>}
          </div>
        </section>
      )}
    </div>
  );
}
