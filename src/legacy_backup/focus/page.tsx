import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { setDailyProject, pinItem, unpin, addSession } from "./actions";

function startOfToday() {
  const iso = new Date().toISOString().slice(0, 10);
  return new Date(iso);
}

export default async function FocusPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const today = startOfToday();

  const [activeProjects, dailyFocus, pinnedPins, suggested, sessions] = await Promise.all([
    prisma.project.findMany({ where: { userId, archivedAt: null, status: ProjectStatus.ACTIVE }, orderBy: { updatedAt: "desc" } }),
    prisma.dailyFocus.findUnique({ where: { userId_date: { userId, date: today } }, include: { project: true } }),
    prisma.focusPin.findMany({ where: { userId, date: { gte: today } }, include: { item: true } }),
    prisma.item.findMany({
      where: { userId, archivedAt: null, isDone: false, classification: ItemClassification.PROJECT },
      include: { project: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.focusSession.findMany({ where: { userId, date: { gte: today } }, orderBy: { createdAt: "desc" } }),
  ]);

  const pinnedItems = pinnedPins.map((p) => p.item);
  const pinnedIds = new Set(pinnedItems.map((p) => p.id));
  const unpinnedSuggestions = suggested.filter((s) => !pinnedIds.has(s.id)).slice(0, 5);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">Today</p>
            <h1 className="text-2xl font-semibold tracking-tight">Focus</h1>
            <p className="text-sm text-[var(--text-secondary)]">Pick one project, pin three tasks, box the time. This is the PARA execution lane.</p>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-xs text-[var(--text-secondary)]">
            <div className="font-semibold text-[var(--text-primary)]">How to use focus</div>
            <div>1) Commit a project for today. 2) Pin up to 3 tasks. 3) Log time boxes. Clear pins before new ones.</div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--primary-strong)_8%,var(--card))] p-3 text-sm text-[var(--text-primary)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Upgrade</div>
              <div className="font-semibold">Focus plan: unlimited Smart Assist + timelines for accountability.</div>
              <p className="text-xs text-[var(--text-secondary)]">Keep pins, time boxes, and review exports synced for your weekly cadence.</p>
            </div>
            <div className="flex gap-2 text-sm font-semibold">
              <Link href="/pricing" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">Upgrade</Link>
              <Link href="/assist" className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-[var(--text-primary)]">Try Smart Assist</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="panel space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Commit a daily focus</h2>
          {dailyFocus?.project && <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--text-secondary)]">Committed: {dailyFocus.project.name}</span>}
        </div>
        <form action={setDailyProject} className="flex flex-wrap items-center gap-2 text-sm">
          <select name="projectId" defaultValue={dailyFocus?.projectId ?? ""} className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2">
            <option value="">Choose a project</option>
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="submit" className="rounded-md border border-[var(--border-default)] px-4 py-2 text-sm font-semibold">Commit</button>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Pinned for today</h2>
            <span className="text-xs text-[var(--text-secondary)]">Up to 3 tasks</span>
          </div>
          <div className="space-y-2">
            {pinnedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                  {item.projectId && <div className="text-xs text-[var(--text-secondary)]">Project task</div>}
                </div>
                <form action={unpin}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button className="text-xs font-semibold text-[var(--text-primary)]">Unpin</button>
                </form>
              </div>
            ))}
            {pinnedItems.length === 0 && (
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                <div className="font-semibold text-[var(--text-primary)]">Nothing pinned yet.</div>
                <div>Grab tasks from suggestions or inbox, then pin the top three for today.</div>
                <div className="mt-2 flex gap-2 text-xs font-semibold">
                  <Link href="/inbox" className="rounded border border-[var(--border-default)] px-2 py-1">Open inbox</Link>
                  <Link href="/projects" className="rounded border border-[var(--border-default)] px-2 py-1">Open projects</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Suggested tasks</h2>
            <span className="text-xs text-[var(--text-secondary)]">From active projects</span>
          </div>
          <div className="space-y-2">
            {unpinnedSuggestions.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{item.project?.name ?? "Project"}</div>
                </div>
                {!pinnedIds.has(item.id) && pinnedItems.length < 3 && (
                  <form action={pinItem}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="rounded-md border border-[var(--border-default)] px-3 py-1 text-xs font-semibold">Pin</button>
                  </form>
                )}
              </div>
            ))}
            {unpinnedSuggestions.length === 0 && (
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                <div className="font-semibold text-[var(--text-primary)]">No suggestions yet.</div>
                <div>Create a project task or classify inbox items into a project to surface here.</div>
                <div className="mt-2 flex gap-2 text-xs font-semibold">
                  <Link href="/projects" className="rounded border border-[var(--border-default)] px-2 py-1">Projects</Link>
                  <Link href="/inbox" className="rounded border border-[var(--border-default)] px-2 py-1">Inbox</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Time boxes</h2>
          <span className="text-xs text-[var(--text-secondary)]">Total: {totalMinutes} min</span>
        </div>
        <form action={addSession} className="flex flex-wrap gap-2 text-sm">
          <input name="label" placeholder="Focus block" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 flex-1" required />
          <input name="minutes" type="number" min={15} step={5} placeholder="Minutes" className="border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 w-28" required />
          <button type="submit" className="rounded-md border border-[var(--border-default)] px-4 py-2 text-sm font-semibold">Add</button>
        </form>
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm">
              <div className="font-semibold text-[var(--text-primary)]">{s.label}</div>
              <div className="text-xs text-[var(--text-secondary)]">{s.minutes} min</div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-3 text-sm text-[var(--text-secondary)]">
              <div className="font-semibold text-[var(--text-primary)]">No sessions logged yet.</div>
              <div>Plan one 25-50 minute block per pinned task. Log it here when you start.</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
