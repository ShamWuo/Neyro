import { auth } from "@/auth";
import { ensureProjectLimit, getActiveProjectCount, touchProject } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType, ProjectStatus, SharePermission } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

// Code splitting: Load completion percentage component dynamically
const ProjectCompletionPercentage = dynamic(
  () => import("@/components/project-completion-percentage").then((mod) => ({ default: mod.ProjectCompletionPercentage })),
  {
    loading: () => <div className="h-24 w-full bg-[var(--surface-muted)] rounded animate-pulse" />,
    ssr: true,
  }
);

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const project = await prisma.project.findUnique({
    where: { id, userId },
    include: {
      items: { where: { classification: ItemClassification.PROJECT }, orderBy: { createdAt: "desc" } },
      shares: true,
    },
  });
  if (!project) redirect("/projects");
  const projectId = project.id;

  const [areas, collections, activeCount] = await Promise.all([
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { name: "asc" } }),
    getActiveProjectCount(userId),
  ]);

  async function updateProject(formData: FormData) {
    "use server";
    try {
      const name = String(formData.get("name") ?? "").trim();
      const outcome = String(formData.get("outcome") ?? "").trim();
      const deadlineRaw = String(formData.get("deadline") ?? "").trim();
      if (!name || !outcome) return;
      let deadline: Date | null = null;
      if (deadlineRaw) {
        try {
          deadline = new Date(deadlineRaw);
          if (isNaN(deadline.getTime())) deadline = null;
        } catch {
          deadline = null;
        }
      }
      await prisma.project.update({
        where: { id: projectId, userId },
        data: { name, outcome, deadline },
      });
      await touchProject(userId, projectId);
      redirect(`/projects/${projectId}`);
    } catch (error) {
      logger.error("Error updating project", error);
      redirect(`/projects/${projectId}?error=update_failed`);
    }
  }

  async function changeStatus(status: ProjectStatus) {
    "use server";
    try {
      if (status === ProjectStatus.ACTIVE) {
        await ensureProjectLimit(userId);
      }
      await prisma.project.update({ where: { id: projectId, userId }, data: { status } });
      await touchProject(userId, projectId);
      redirect(`/projects/${projectId}`);
    } catch (error) {
      logger.error("Error changing project status", error);
      redirect(`/projects/${projectId}?error=status_failed`);
    }
  }

  async function archiveProject() {
    "use server";
    await prisma.project.update({ where: { id: projectId, userId }, data: { archivedAt: new Date(), status: ProjectStatus.COMPLETED } });
    redirect("/projects");
  }

  async function addShare(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;
    await prisma.shareAccess.create({
      data: { ownerId: userId, projectId, email, permission: SharePermission.VIEW },
    });
    redirect(`/projects/${projectId}`);
  }

  async function addItem(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim() || null;
    const url = String(formData.get("url") ?? "").trim() || null;
    const type = (String(formData.get("type") ?? ItemType.NOTE) as ItemType) || ItemType.NOTE;
    if (!title) return;
    await prisma.item.create({
      data: {
        userId,
        title,
        details,
        url,
        type,
        classification: ItemClassification.PROJECT,
        projectId,
      },
    });
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  }

  async function updateItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim() || null;
    const url = String(formData.get("url") ?? "").trim() || null;
    const type = (String(formData.get("type") ?? ItemType.NOTE) as ItemType) || ItemType.NOTE;
    if (!itemId || !title) return;
    await prisma.item.update({ where: { id: itemId, userId }, data: { title, details, url, type } });
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  }

  async function toggleDone(itemId: string, isDone: boolean) {
    "use server";
    if (!itemId) return;
    await prisma.item.update({ where: { id: itemId, userId }, data: { isDone } });
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  }

  async function moveItem(formData: FormData) {
    "use server";
    const itemId = String(formData.get("itemId") ?? "");
    const target = String(formData.get("target") ?? "");
    const areaId = String(formData.get("areaId") ?? "").trim() || null;
    const collectionId = String(formData.get("collectionId") ?? "").trim() || null;
    if (!itemId) return;

    if (target === "inbox") {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.INBOX, projectId: null, areaId: null, resourceCollectionId: null, archivedAt: null },
      });
    } else if (target === "area" && areaId) {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null },
      });
    } else if (target === "resource" && collectionId) {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null },
      });
    } else if (target === "archive") {
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null },
      });
    }
    await touchProject(userId, projectId);
    redirect(`/projects/${projectId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-[var(--text-tertiary)]">Project</div>
            <div className="text-xl font-semibold text-[var(--text-primary)]">{project.name}</div>
            <div className="text-sm text-[var(--text-secondary)]">Outcome: {project.outcome}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Status: {project.status}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Active projects: {activeCount}/7</div>
            <div className="mt-3">
              <ProjectCompletionPercentage
                totalItems={project.items.length}
                completedItems={project.items.filter((i) => i.isDone).length}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <form action={() => changeStatus(ProjectStatus.ACTIVE)}>
              <button className="rounded border px-3 py-2">Set active</button>
            </form>
            <form action={() => changeStatus(ProjectStatus.PAUSED)}>
              <button className="rounded border px-3 py-2">Pause</button>
            </form>
            <form action={() => changeStatus(ProjectStatus.COMPLETED)}>
              <button className="rounded border px-3 py-2">Complete</button>
            </form>
            {project.status === ProjectStatus.COMPLETED && (
              <form action={archiveProject}>
                <button className="rounded border px-3 py-2 text-[var(--danger)]">Move to archive</button>
              </form>
            )}
          </div>
        </div>
        <form action={updateProject} className="grid gap-3 md:grid-cols-2">
          <input name="name" defaultValue={project.name} placeholder="Name" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-3 py-2" required />
          <input name="outcome" defaultValue={project.outcome} placeholder="Outcome" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" required />
          <label className="text-sm text-[var(--text-secondary)] flex flex-col">
            Deadline
            <input name="deadline" type="date" defaultValue={project.deadline ? project.deadline.toISOString().slice(0, 10) : ""} className="rounded border border-[var(--border-default)] bg-[var(--card)] px-3 py-2" />
          </label>
          <button type="submit" className="rounded bg-[var(--text-primary)] px-4 py-2 text-[var(--text-inverse)] md:col-span-2">Save project</button>
        </form>
      </div>

      <div className="rounded border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Items in this project</h2>
          <span className="text-xs text-[var(--text-tertiary)]">{project.items.length} items</span>
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Share with a partner</span>
          <form action={addShare} className="flex gap-2 items-center">
            <input name="email" placeholder="email" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1" />
            <button className="rounded border px-2 py-1">Share</button>
          </form>
        </div>
          {project.shares.length > 0 && <div className="text-xs text-[var(--text-tertiary)]">Shared with: {project.shares.map((s) => s.email).join(", ")}</div>}
        <div className="space-y-3">
          {project.items.map((item) => (
            <div key={item.id} className="rounded border border-[var(--border-subtle)] bg-[var(--card)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                  {item.details && <div className="text-sm text-[var(--text-secondary)]">{item.details}</div>}
                  {item.url && (
                    <a href={item.url} className="text-xs text-[var(--primary-strong)] underline" target="_blank" rel="noreferrer">
                      {item.url}
                    </a>
                  )}
                  <div className="text-xs text-[var(--text-tertiary)]">Type: {item.type}</div>
                </div>
                <form action={() => toggleDone(item.id, !item.isDone)}>
                  <button className="text-xs rounded border px-2 py-1">{item.isDone ? "Mark undone" : "Mark done"}</button>
                </form>
              </div>
              <form action={updateItem} className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="itemId" value={item.id} />
                <input name="title" defaultValue={item.title} className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1" required />
                <select name="type" defaultValue={item.type} className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1">
                  {Object.values(ItemType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <textarea name="details" defaultValue={item.details ?? ""} rows={2} className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 md:col-span-2" />
                <input name="url" defaultValue={item.url ?? ""} placeholder="URL" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 md:col-span-2" />
                <button type="submit" className="rounded bg-[var(--text-primary)] px-3 py-2 text-[var(--text-inverse)] md:col-span-2 text-sm">
                  Save item
                </button>
              </form>
              <form action={moveItem} className="flex flex-wrap gap-2 text-sm">
                <input type="hidden" name="itemId" value={item.id} />
                <select name="target" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1" required>
                  <option value="">Move to...</option>
                  <option value="inbox">Inbox</option>
                  <option value="area">Area</option>
                  <option value="resource">Resource</option>
                  <option value="archive">Archive</option>
                </select>
                <select name="areaId" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1">
                  <option value="">Area target</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <select name="collectionId" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-2 py-1">
                  <option value="">Resource target</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="rounded border px-3 py-2">
                  Apply
                </button>
              </form>
            </div>
          ))}
          {project.items.length === 0 && <div className="text-sm text-[var(--text-tertiary)]">No items yet.</div>}
        </div>
      </div>

      <div className="rounded border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Add item to this project</h2>
        <form action={addItem} className="grid gap-3 md:col-span-2">
          <input name="title" placeholder="Title" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" required />
          <textarea name="details" placeholder="Details" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" rows={3} />
          <input name="url" placeholder="URL (optional)" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" />
          <select name="type" className="rounded border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2" defaultValue={ItemType.NOTE}>
            {Object.values(ItemType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded bg-[var(--text-primary)] px-4 py-2 text-[var(--text-inverse)] md:col-span-2">
            Add item
          </button>
        </form>
      </div>

      <div className="text-sm text-[var(--text-tertiary)]">
        <Link href="/projects" className="underline">
          Back to projects
        </Link>
      </div>
    </div>
  );
}
