import Link from "next/link";
import { auth } from "@/auth";
import { ensureProjectLimit, MAX_ACTIVE_PROJECTS } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const projects = await prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } });
  const activeCount = projects.filter((p) => p.status === ProjectStatus.ACTIVE).length;

  async function createProject(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const outcome = String(formData.get("outcome") ?? "").trim();
    const deadlineRaw = String(formData.get("deadline") ?? "").trim();
    const status = (String(formData.get("status") ?? ProjectStatus.ACTIVE) as ProjectStatus) || ProjectStatus.ACTIVE;
    if (status === ProjectStatus.ACTIVE) {
      await ensureProjectLimit(userId);
    }
    if (!name || !outcome) return;
    await prisma.project.create({
      data: {
        userId,
        name,
        outcome,
        status,
        deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      },
    });
  }

  async function updateProjectStatus(id: string, status: ProjectStatus) {
    "use server";
    if (status === ProjectStatus.ACTIVE) {
      await ensureProjectLimit(userId);
    }
    await prisma.project.update({ where: { id, userId }, data: { status } });
  }

  async function archiveProject(id: string) {
    "use server";
    await prisma.project.update({ where: { id, userId }, data: { archivedAt: new Date(), status: ProjectStatus.COMPLETED } });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className={`text-sm ${activeCount >= MAX_ACTIVE_PROJECTS ? "text-red-600" : "text-zinc-600"}`}>
            Active projects: {activeCount} / {MAX_ACTIVE_PROJECTS}
          </p>
        </div>
      </div>

      <form action={createProject} className="grid gap-3 rounded border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <input name="name" placeholder="Name" className="rounded border border-zinc-300 px-3 py-2" required />
        <input name="outcome" placeholder="Outcome sentence" className="rounded border border-zinc-300 px-3 py-2 md:col-span-2" required />
        <input name="deadline" type="date" className="rounded border border-zinc-300 px-3 py-2" />
        <label className="text-sm text-zinc-600 flex flex-col">
          Status
          <select name="status" className="rounded border border-zinc-300 px-3 py-2">
            {Object.values(ProjectStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white md:col-span-2">New Project</button>
      </form>

      <div className="space-y-4">
        {[ProjectStatus.ACTIVE, ProjectStatus.PAUSED, ProjectStatus.COMPLETED].map((status) => (
          <div key={status} className="space-y-2">
            <h2 className="text-sm font-semibold text-zinc-700">{status}</h2>
            <div className="space-y-2">
              {projects
                .filter((p) => p.status === status)
                .map((p) => (
                  <div key={p.id} className="rounded border border-zinc-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Link href={`/projects/${p.id}`} className="flex-1">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-sm text-zinc-600">Outcome: {p.outcome}</div>
                        {p.deadline && <div className="text-sm text-zinc-600">Deadline: {p.deadline.toISOString().slice(0, 10)}</div>}
                        <div className="text-xs text-zinc-500">Items: {p._count.items}</div>
                      </Link>
                      <div className="flex gap-2 text-sm ml-3">
                        {status !== ProjectStatus.ACTIVE && (
                          <form action={() => updateProjectStatus(p.id, ProjectStatus.ACTIVE)}>
                            <button className="rounded border px-2 py-1">Set Active</button>
                          </form>
                        )}
                        {status !== ProjectStatus.PAUSED && (
                          <form action={() => updateProjectStatus(p.id, ProjectStatus.PAUSED)}>
                            <button className="rounded border px-2 py-1">Pause</button>
                          </form>
                        )}
                        {status !== ProjectStatus.COMPLETED && (
                          <form action={() => updateProjectStatus(p.id, ProjectStatus.COMPLETED)}>
                            <button className="rounded border px-2 py-1">Complete</button>
                          </form>
                        )}
                        {status === ProjectStatus.COMPLETED && (
                          <form action={() => archiveProject(p.id)}>
                            <button className="rounded border px-2 py-1 text-red-600">Archive</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {projects.filter((p) => p.status === status).length === 0 && (
                <div className="text-sm text-zinc-500">No {status.toLowerCase()} projects.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
