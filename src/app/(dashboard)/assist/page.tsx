import { auth } from "@/auth";
import { ensureProjectLimit, touchArea, touchCollection, touchProject, createProjectWithLimit } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, ProjectStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AICaptureCard } from "./ai-capture";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export default async function AssistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [inboxRecent, staleProjects, neglectedAreas, resourceCandidates] = await Promise.all([
    prisma.item.findMany({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null, createdAt: { gte: daysAgo(7) } }, orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ where: { userId, archivedAt: null, status: ProjectStatus.ACTIVE, lastActivityAt: { lt: daysAgo(7) } } }),
    prisma.area.findMany({ where: { userId, archivedAt: null, lastActivityAt: { lt: daysAgo(14) } }, orderBy: { lastActivityAt: "asc" } }),
    prisma.resourceCollection.findMany({
      where: { userId, archivedAt: null },
      include: { _count: { select: { items: true } } },
      orderBy: { items: { _count: "desc" } },
    }),
  ]);

  const duplicateGroups = Object.values(
    inboxRecent.reduce<Record<string, { title: string; ids: string[] }>>((acc, item) => {
      const key = item.title.toLowerCase();
      acc[key] = acc[key] || { title: item.title, ids: [] };
      acc[key].ids.push(item.id);
      return acc;
    }, {})
  ).filter((g) => g.ids.length > 1);

  async function mergeDuplicates(title: string) {
    "use server";
    const items = await prisma.item.findMany({ where: { userId, classification: ItemClassification.INBOX, title: { equals: title, mode: "insensitive" }, archivedAt: null }, orderBy: { createdAt: "desc" } });
    const [, ...duplicates] = items;
    if (duplicates.length === 0) return;
    const duplicateIds = duplicates.map((i) => i.id);
    await prisma.item.updateMany({
      where: { id: { in: duplicateIds }, userId },
      data: { archivedAt: new Date(), classification: ItemClassification.ARCHIVE },
    });
    redirect("/assist");
  }

  async function pauseProject(id: string) {
    "use server";
    await prisma.project.update({ where: { id, userId }, data: { status: ProjectStatus.PAUSED } });
    await touchProject(userId, id);
    redirect("/assist");
  }

  async function convertCollection(formData: FormData) {
    "use server";
    const collectionId = String(formData.get("collectionId") ?? "");
    if (!collectionId) return;
    await ensureProjectLimit(userId);
    const collection = await prisma.resourceCollection.findUnique({ where: { id: collectionId, userId }, include: { items: true } });
    if (!collection) return;
    const project = await createProjectWithLimit(userId, { userId, name: collection.name, outcome: collection.description ?? "Outcome TBD", status: ProjectStatus.ACTIVE } as Prisma.ProjectUncheckedCreateInput);
    if (collection.items.length) {
      await prisma.item.updateMany({ where: { id: { in: collection.items.map((i) => i.id) }, userId }, data: { classification: ItemClassification.PROJECT, projectId: project.id, resourceCollectionId: null } });
    }
    await touchProject(userId, project.id);
    await touchCollection(userId, collectionId);
    redirect("/projects/" + project.id);
  }

  async function addAreaAction(formData: FormData) {
    "use server";
    const areaId = String(formData.get("areaId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    if (!areaId || !title) return;
    await prisma.item.create({ data: { userId, title, classification: ItemClassification.AREA, type: ItemType.TASK, areaId } });
    await touchArea(userId, areaId);
    redirect("/assist");
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Smart Assist</h1>
        <p className="text-sm text-[var(--text-secondary)]">Prompts based on your activity—not chatty AI.</p>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--primary-strong)_8%,var(--card))] p-3 text-sm text-[var(--text-primary)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Upgrade</div>
              <div className="font-semibold">Unlock unlimited Smart Assist, timelines, and exports with Focus.</div>
            </div>
            <div className="flex gap-2 text-sm font-semibold">
              <Link href="/pricing" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-[var(--text-inverse)] shadow-sm transition hover:shadow-[var(--elev-2)]">See plans</Link>
              <Link href="/weekly-review" className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-[var(--text-primary)]">Run weekly review</Link>
            </div>
          </div>
        </div>
      </div>

      <AICaptureCard />

      <section className="panel space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Duplicates</h2>
        <div className="space-y-2">
          {duplicateGroups.map((g) => (
            <div key={g.title} className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm">
              <div>
                <div className="font-semibold text-[var(--text-primary)]">{g.title}</div>
                <div className="text-xs text-[var(--text-secondary)]">{g.ids.length} inbox items</div>
              </div>
              <form action={() => mergeDuplicates(g.title)}>
                <button
                  type="submit"
                  aria-label={`Archive ${g.ids.length} duplicate items titled "${g.title}"`}
                  className="rounded-md border border-[var(--border-default)] px-3 py-1 text-xs font-semibold hover:border-[var(--border-strong)] transition"
                >
                  Archive duplicates
                </button>
              </form>
            </div>
          ))}
          {duplicateGroups.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No duplicates detected this week.</div>}
        </div>
      </section>

      <section className="panel space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Stale projects</h2>
        <div className="space-y-2">
          {staleProjects.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm">
              <div>
                <div className="font-semibold text-[var(--text-primary)]">{p.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">No movement since {p.lastActivityAt.toISOString().slice(0, 10)}</div>
              </div>
              <form action={() => pauseProject(p.id)}>
                <button
                  type="submit"
                  aria-label={`Pause project "${p.name}"`}
                  className="rounded-md border border-[var(--border-default)] px-3 py-1 text-xs font-semibold hover:border-[var(--border-strong)] transition"
                >
                  Pause
                </button>
              </form>
            </div>
          ))}
          {staleProjects.length === 0 && <div className="text-sm text-[var(--text-secondary)]">All active projects moved in the last 7 days.</div>}
        </div>
      </section>

      <section className="panel space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Neglected areas</h2>
        <div className="space-y-2">
          {neglectedAreas.map((a) => (
            <div key={a.id} className="space-y-2 rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{a.name}</div>
                  <div className="text-xs text-[var(--text-secondary)]">No new activity since {a.lastActivityAt.toISOString().slice(0, 10)}</div>
                </div>
              </div>
              <form action={addAreaAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="areaId" value={a.id} />
                <input name="title" placeholder="Add one action" className="border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 flex-1" />
                <button className="rounded-md border border-[var(--border-default)] px-3 py-1 text-xs font-semibold">Add</button>
              </form>
            </div>
          ))}
          {neglectedAreas.length === 0 && <div className="text-sm text-[var(--text-secondary)]">Areas look good.</div>}
        </div>
      </section>

      <section className="panel space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Resource → Project?</h2>
        <div className="space-y-2">
          {resourceCandidates.filter((c) => c._count.items >= 8).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm">
              <div>
                <div className="font-semibold text-[var(--text-primary)]">{c.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">{c._count.items} items</div>
              </div>
              <form action={convertCollection} className="flex gap-2 items-center">
                <input type="hidden" name="collectionId" value={c.id} />
                <button
                  type="submit"
                  aria-label={`Convert collection "${c.name}" with ${c._count.items} items to a project`}
                  className="rounded-md border border-[var(--border-default)] px-3 py-1 text-xs font-semibold hover:border-[var(--border-strong)] transition"
                >
                  Convert to project
                </button>
              </form>
            </div>
          ))}
          {resourceCandidates.filter((c) => c._count.items >= 8).length === 0 && <div className="text-sm text-[var(--text-secondary)]">No resource collections look like projects yet.</div>}
        </div>
      </section>
    </div>
  );
}
