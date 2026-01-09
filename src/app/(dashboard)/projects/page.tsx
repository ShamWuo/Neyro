import Link from "next/link";
import { auth } from "@/auth";
import { ensureProjectLimit, MAX_ACTIVE_PROJECTS, projectHealth } from "@/lib/para";
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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className={`text-sm ${activeCount >= MAX_ACTIVE_PROJECTS ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"}`}>
            Active projects: {activeCount} / {MAX_ACTIVE_PROJECTS}
          </p>
        </div>
      </div>

      <form action={createProject} className="panel grid gap-3 md:grid-cols-2">
        <input name="name" placeholder="Name" className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]" required />
        <input name="outcome" placeholder="Outcome sentence" className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] md:col-span-2" required />
        <input name="deadline" type="date" className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)]" />
        <label className="flex flex-col text-sm text-[var(--text-secondary)]">
          Status
          <select name="status" className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)]">
            {Object.values(ProjectStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-[var(--text-inverse)] md:col-span-2">New Project</button>
      </form>

      <div className="space-y-5">
        {[ProjectStatus.ACTIVE, ProjectStatus.PAUSED, ProjectStatus.COMPLETED].map((status) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">{status}</h2>
              <span className="text-xs text-[var(--text-secondary)]">{projects.filter((p) => p.status === status).length} total</span>
            </div>
            <div className="space-y-2">
              {projects
                .filter((p) => p.status === status)
                .map((p) => (
                  <div key={p.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/projects/${p.id}`} className="flex-1 space-y-1">
                        <div className="font-semibold text-[var(--text-primary)]">{p.name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">Outcome: {p.outcome}</div>
                        {p.deadline && <div className="text-sm text-[var(--text-secondary)]">Deadline: {p.deadline.toISOString().slice(0, 10)}</div>}
                        <div className="text-xs text-[var(--text-secondary)]">Items: {p._count.items}</div>
                        <div className="text-xs text-[var(--text-secondary)]">Health: {projectHealth(p.lastActivityAt)}</div>
                      </Link>
                      <div className="ml-3 flex gap-2 text-sm">
                        {status !== ProjectStatus.ACTIVE && (
                          <form action={() => updateProjectStatus(p.id, ProjectStatus.ACTIVE)}>
                            <button className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Set Active</button>
                          </form>
                        )}
                        {status !== ProjectStatus.PAUSED && (
                          <form action={() => updateProjectStatus(p.id, ProjectStatus.PAUSED)}>
                            <button className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Pause</button>
                          </form>
                        )}
                        {status !== ProjectStatus.COMPLETED && (
                          <form action={() => updateProjectStatus(p.id, ProjectStatus.COMPLETED)}>
                            <button className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-[var(--text-primary)] hover:border-[var(--border-strong)] transition">Complete</button>
                          </form>
                        )}
                        {status === ProjectStatus.COMPLETED && (
                          <form action={() => archiveProject(p.id)}>
                            <button className="rounded-md border border-[var(--border-default)] px-2 py-1 text-[var(--danger)]">Archive</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {projects.filter((p) => p.status === status).length === 0 && (
                <div className="text-sm text-[var(--text-secondary)]">No {status.toLowerCase()} projects.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
