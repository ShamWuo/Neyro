import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function ArchivePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const [items, projects, areas] = await Promise.all([
    prisma.item.findMany({ where: { userId: session.user.id, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
    prisma.project.findMany({ where: { userId: session.user.id, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
    prisma.area.findMany({ where: { userId: session.user.id, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
  ]);

  async function restoreItem(id: string) {
    "use server";
    await prisma.item.update({ where: { id, userId }, data: { classification: ItemClassification.INBOX, archivedAt: null } });
  }

  async function restoreProject(id: string) {
    "use server";
    await prisma.project.update({ where: { id, userId }, data: { archivedAt: null, status: ProjectStatus.PAUSED } });
  }

  async function restoreArea(id: string) {
    "use server";
    await prisma.area.update({ where: { id, userId }, data: { archivedAt: null } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Archive</h1>
        <p className="text-sm text-zinc-600">Out of sight, still searchable.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">Items</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium">{item.title}</div>
                {item.details && <div className="text-sm text-zinc-600">{item.details}</div>}
              </div>
              <form action={() => restoreItem(item.id)}>
                <button className="text-sm text-blue-600">Restore</button>
              </form>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-zinc-500">No archived items.</div>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">Projects</h2>
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-zinc-600">Outcome: {p.outcome}</div>
              </div>
              <form action={() => restoreProject(p.id)}>
                <button className="text-sm text-blue-600">Restore</button>
              </form>
            </div>
          ))}
          {projects.length === 0 && <div className="text-sm text-zinc-500">No archived projects.</div>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">Areas</h2>
        <div className="space-y-2">
          {areas.map((a) => (
            <div key={a.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm flex items-center justify-between">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-sm text-zinc-600">{a.standard}</div>
              </div>
              <form action={() => restoreArea(a.id)}>
                <button className="text-sm text-blue-600">Restore</button>
              </form>
            </div>
          ))}
          {areas.length === 0 && <div className="text-sm text-zinc-500">No archived areas.</div>}
        </div>
      </section>
    </div>
  );
}
