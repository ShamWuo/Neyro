import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { ArchiveFilters } from "@/components/archive-filters";
import { restoreItem, deleteItemAction, restoreProjectAction, restoreAreaAction } from "./actions";

export default async function ArchivePage({ searchParams }: { searchParams?: Promise<{ q?: string; classification?: string; type?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;
  const params = (await searchParams) ?? {};
  const { q = "", classification = "", type = "" } = params;

  const whereClause: Prisma.ItemWhereInput = {
    userId,
    archivedAt: { not: null },
  };

  if (q) {
    whereClause.title = { contains: q, mode: "insensitive" };
  }
  if (classification && Object.values(ItemClassification).includes(classification as ItemClassification)) {
    whereClause.classification = classification as ItemClassification;
  }
  if (type && Object.values(ItemType).includes(type as ItemType)) {
    whereClause.type = type as ItemType;
  }

  const [items, projects, areas, collections, activeProjects, activeAreas, stats] = await Promise.all([
    prisma.item.findMany({
      where: whereClause,
      orderBy: { archivedAt: "desc" },
    }),
    prisma.project.findMany({ where: { userId, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    (async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return Promise.all([
        prisma.item.count({ where: { userId, archivedAt: { not: null } } }),
        prisma.project.count({ where: { userId, archivedAt: { not: null } } }),
        prisma.area.count({ where: { userId, archivedAt: { not: null } } }),
        prisma.item.count({ where: { userId, archivedAt: { not: null }, createdAt: { gte: thirtyDaysAgo } } }),
      ]);
    })(),
  ]);

  const [totalArchivedItems, totalArchivedProjects, totalArchivedAreas, archivedLast30Days] = stats;

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
        <p className="text-sm text-[var(--text-secondary)]">Completed work and old items.</p>
      </div>

      <ArchiveFilters />

      <div className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
            <span className="text-[var(--text-secondary)]">Items: </span>
            <span className="font-semibold text-[var(--text-primary)]">{totalArchivedItems}</span>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
            <span className="text-[var(--text-secondary)]">Projects: </span>
            <span className="font-semibold text-[var(--text-primary)]">{totalArchivedProjects}</span>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
            <span className="text-[var(--text-secondary)]">Areas: </span>
            <span className="font-semibold text-[var(--text-primary)]">{totalArchivedAreas}</span>
          </div>
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card-muted)] px-3 py-2">
            <span className="text-[var(--text-secondary)]">Last 30 days: </span>
            <span className="font-semibold text-[var(--text-primary)]">{archivedLast30Days}</span>
          </div>
        </div>
        <form className="flex gap-2" method="get">
          <input name="q" defaultValue={q} placeholder="Search archived titles" className="flex-1 border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)]" />
          <button className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-[var(--text-inverse)]">Search</button>
        </form>
      </div>

      <section className="panel space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Items</h2>
          <span className="text-xs text-[var(--text-secondary)]">{items.length} archived</span>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium text-[var(--text-primary)]">{item.title}</div>
                  {item.details && <div className="text-sm text-[var(--text-secondary)]">{item.details}</div>}
                  {item.url && <a className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>}
                  <div className="text-xs text-[var(--text-secondary)]">Type: {item.classification}</div>
                </div>
                <form action={deleteItemAction}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button className="text-xs font-semibold text-[var(--danger)] hover:text-[var(--danger)]">Delete permanently</button>
                </form>
              </div>
              <form action={restoreItem} className="flex flex-wrap gap-2 text-sm items-center">
                <input type="hidden" name="itemId" value={item.id} />
                <label className="flex items-center gap-2">
                  <span>Restore to</span>
                  <select name="target" className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]">
                    <option value="inbox">Inbox</option>
                    <option value="project">Project</option>
                    <option value="area">Area</option>
                    <option value="resource">Resource</option>
                  </select>
                </label>
                <select name="projectId" className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]">
                  <option value="">Project target</option>
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select name="areaId" className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]">
                  <option value="">Area target</option>
                  {activeAreas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <select name="collectionId" className="border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]">
                  <option value="">Resource target</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)]">Restore</button>
              </form>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No archived items.</div>}
        </div>
      </section>

      <section className="panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Projects</h2>
          <span className="text-xs text-[var(--text-secondary)]">{projects.length} archived</span>
        </div>
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium text-[var(--text-primary)]">{p.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">Outcome: {p.outcome}</div>
              </div>
              <form action={restoreProjectAction}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-sm font-semibold text-[var(--primary-strong)] hover:text-[var(--primary)]">Restore</button>
              </form>
            </div>
          ))}
          {projects.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No archived projects.</div>}
        </div>
      </section>

      <section className="panel space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Areas</h2>
          <span className="text-xs text-[var(--text-secondary)]">{areas.length} archived</span>
        </div>
        <div className="space-y-2">
          {areas.map((a) => (
            <div key={a.id} className="rounded border border-[var(--border-subtle)] bg-[var(--card-muted)] p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium text-[var(--text-primary)]">{a.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">{a.standard}</div>
              </div>
              <form action={restoreAreaAction}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-sm font-semibold text-[var(--primary-strong)] hover:text-[var(--primary)]">Restore</button>
              </form>
            </div>
          ))}
          {areas.length === 0 && <div className="text-sm text-[var(--text-secondary)]">No archived areas.</div>}
        </div>
      </section>
    </div>
  );
}
