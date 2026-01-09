import { auth } from "@/auth";
import { ensureProjectLimit, touchArea, touchCollection, touchProject } from "@/lib/para";
import { prisma } from "@/lib/prisma";
import { ItemClassification, ItemType } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { InboxItemActions } from "@/components/inbox-item-actions";
import { InboxPaginationWrapper } from "@/components/inbox-pagination-wrapper";
import { Badge } from "@/components/ui/badge";
import { ItemCompletionToggle } from "@/components/item-completion-toggle";
import { InboxItemTags } from "@/components/inbox-item-tags";
import { InboxCaptureForm } from "@/components/inbox-capture-form";
import { InboxZeroCelebration } from "@/components/inbox-zero-celebration";
import { InboxWithRefresh } from "@/components/inbox-with-refresh";

export default async function InboxPage({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const userId = session.user.id;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page || "1", 10));
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const [items, totalCount, projects, areas, collections, tags] = await Promise.all([
    prisma.item.findMany({
      where: { userId, classification: ItemClassification.INBOX, archivedAt: null },
      orderBy: [
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      skip,
      take: pageSize,
      include: {
        itemTags: {
          include: {
            tag: true,
          },
        },
      },
    }),
    prisma.item.count({ where: { userId, classification: ItemClassification.INBOX, archivedAt: null } }),
    prisma.project.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.area.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.resourceCollection.findMany({ where: { userId, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } }),
  ]);

  async function createItem(formData: FormData) {
    "use server";
    try {
      const title = String(formData.get("title") ?? "").trim();
      const details = String(formData.get("details") ?? "").trim() || null;
      const url = String(formData.get("url") ?? "").trim() || null;
      const type = (String(formData.get("type") ?? ItemType.NOTE) as ItemType) || ItemType.NOTE;
      const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
      let dueDate: Date | null = null;
      if (dueDateRaw) {
        try {
          dueDate = new Date(dueDateRaw);
          if (isNaN(dueDate.getTime())) dueDate = null;
        } catch {
          dueDate = null;
        }
      }
      if (!title) return;
      await prisma.item.create({ data: { userId, title, details, url, type, classification: ItemClassification.INBOX, dueDate } });
      redirect("/inbox");
    } catch (error) {
      logger.error("Error creating item", error);
      redirect("/inbox?error=create_failed");
    }
  }

  async function updateItem(formData: FormData) {
    "use server";
    try {
      const itemId = String(formData.get("itemId") ?? "");
      const title = String(formData.get("title") ?? "").trim();
      const details = String(formData.get("details") ?? "").trim() || null;
      const url = String(formData.get("url") ?? "").trim() || null;
      const type = String(formData.get("type") ?? ItemType.NOTE) as ItemType;
      const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
      let dueDate: Date | null = null;
      if (dueDateRaw) {
        try {
          dueDate = new Date(dueDateRaw);
          if (isNaN(dueDate.getTime())) dueDate = null;
        } catch {
          dueDate = null;
        }
      }
      const isDone = String(formData.get("isDone") ?? "") === "on";
      if (!itemId || !title) return;
      await prisma.item.update({ where: { id: itemId, userId }, data: { title, details, url, type, dueDate, isDone } });
      redirect("/inbox");
    } catch (error) {
      logger.error("Error updating item", error);
      redirect("/inbox?error=update_failed");
    }
  }

  async function moveToProject(formData: FormData) {
    "use server";
    try {
      const itemId = String(formData.get("itemId") ?? "");
      const projectIdRaw = String(formData.get("projectId") ?? "");
      const newName = String(formData.get("newProjectName") ?? "").trim();
      const newOutcome = String(formData.get("newProjectOutcome") ?? "").trim();
      const newDeadline = String(formData.get("newProjectDeadline") ?? "").trim();
      let projectId = projectIdRaw || null;

      if (!projectId && newName && newOutcome) {
        await ensureProjectLimit(userId);
        let deadline: Date | null = null;
        if (newDeadline) {
          try {
            deadline = new Date(newDeadline);
            if (isNaN(deadline.getTime())) deadline = null;
          } catch {
            deadline = null;
          }
        }
        const created = await prisma.project.create({
          data: { userId, name: newName, outcome: newOutcome, deadline, status: ProjectStatus.ACTIVE },
        });
        projectId = created.id;
      }

      if (!itemId || !projectId) return;
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null },
      });
      await touchProject(userId, projectId);
      redirect("/inbox");
    } catch (error) {
      logger.error("Error moving item to project", error);
      redirect("/inbox?error=move_failed");
    }
  }

  async function moveToArea(formData: FormData) {
    "use server";
    try {
      const itemId = String(formData.get("itemId") ?? "");
      const areaIdRaw = String(formData.get("areaId") ?? "");
      const newName = String(formData.get("newAreaName") ?? "").trim();
      const newStandard = String(formData.get("newAreaStandard") ?? "").trim();
      let areaId = areaIdRaw || null;

      if (!areaId && newName && newStandard) {
        const created = await prisma.area.create({ data: { userId, name: newName, standard: newStandard } });
        areaId = created.id;
      }

      if (!itemId || !areaId) return;
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null },
      });
      await touchArea(userId, areaId);
      redirect("/inbox");
    } catch (error) {
      logger.error("Error moving item to area", error);
      redirect("/inbox?error=move_failed");
    }
  }

  async function moveToResource(formData: FormData) {
    "use server";
    try {
      const itemId = String(formData.get("itemId") ?? "");
      const collectionIdRaw = String(formData.get("collectionId") ?? "");
      const newName = String(formData.get("newCollectionName") ?? "").trim();
      let collectionId = collectionIdRaw || null;
      if (!collectionId && newName) {
        const created = await prisma.resourceCollection.create({ data: { userId, name: newName } });
        collectionId = created.id;
      }
      if (!itemId || !collectionId) return;
      await prisma.item.update({
        where: { id: itemId, userId },
        data: { classification: ItemClassification.RESOURCE, resourceCollectionId: collectionId, projectId: null, areaId: null, archivedAt: null },
      });
      await touchCollection(userId, collectionId);
      redirect("/inbox");
    } catch (error) {
      logger.error("Error moving item to resource", error);
      redirect("/inbox?error=move_failed");
    }
  }

  async function bulkClassify(formData: FormData) {
    "use server";
    try {
      const selected = formData.getAll("selected").map(String).filter(Boolean);
      if (!selected.length) return;

      const classificationRaw = String(formData.get("classification") ?? "").trim();
      const classification = classificationRaw as ItemClassification;

      if (!Object.values(ItemClassification).includes(classification)) {
        return;
      }

      let data: {
        classification: ItemClassification;
        projectId?: string | null;
        areaId?: string | null;
        resourceCollectionId?: string | null;
        archivedAt?: Date | null;
      } | null = null;

      if (classification === ItemClassification.PROJECT) {
        const projectId = String(formData.get("projectId") ?? "").trim();
        if (!projectId) return;
        data = { classification: ItemClassification.PROJECT, projectId, areaId: null, resourceCollectionId: null, archivedAt: null };
      } else if (classification === ItemClassification.AREA) {
        const areaId = String(formData.get("areaId") ?? "").trim();
        if (!areaId) return;
        data = { classification: ItemClassification.AREA, areaId, projectId: null, resourceCollectionId: null, archivedAt: null };
      } else if (classification === ItemClassification.RESOURCE) {
        const resourceCollectionId = String(formData.get("resourceCollectionId") ?? "").trim();
        if (!resourceCollectionId) return;
        data = { classification: ItemClassification.RESOURCE, resourceCollectionId, areaId: null, projectId: null, archivedAt: null };
      } else if (classification === ItemClassification.ARCHIVE) {
        const confirmArchive = String(formData.get("confirmArchive") ?? "");
        if (confirmArchive !== "on") {
          return;
        }
        data = { classification: ItemClassification.ARCHIVE, archivedAt: new Date(), projectId: null, areaId: null, resourceCollectionId: null };
      } else if (classification === ItemClassification.INBOX) {
        data = { classification: ItemClassification.INBOX, projectId: null, areaId: null, resourceCollectionId: null, archivedAt: null };
      }

      if (!data) return;

      await prisma.item.updateMany({
        where: { id: { in: selected }, userId },
        data,
      });
    } catch (error) {
      logger.error("Error bulk classifying items", error);
    }
  }

      return (
        <InboxWithRefresh>
          <div className="space-y-10">
            <InboxZeroCelebration show={totalCount === 0} />
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-[var(--text-secondary)]">Capture with intention, then move items out calmly.</p>
        </div>
        <div className="text-xs text-[var(--text-secondary)]">
          {totalCount} {totalCount === 1 ? "item" : "items"}
          {totalCount > pageSize && ` · Page ${page} of ${Math.ceil(totalCount / pageSize)}`}
        </div>
      </div>

      <InboxCaptureForm createItemAction={createItem} />

      <form action={bulkClassify} className="panel space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-[var(--text-primary)]">Classification</span>
            <select name="classification" className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" required>
              <option value="">Select</option>
              <option value={ItemClassification.PROJECT}>Project</option>
              <option value={ItemClassification.AREA}>Area</option>
              <option value={ItemClassification.RESOURCE}>Resource</option>
              <option value={ItemClassification.INBOX}>Inbox</option>
              <option value={ItemClassification.ARCHIVE}>Archive</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[var(--text-primary)]">Project</span>
            <select name="projectId" className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
              <option value="">Select</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[var(--text-primary)]">Area</span>
            <select name="areaId" className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
              <option value="">Select</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[var(--text-primary)]">Resource</span>
            <select name="resourceCollectionId" className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
              <option value="">Select</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[var(--danger)]">
            <input type="checkbox" name="confirmArchive" className="h-4 w-4" />
            <span className="text-xs">Confirm archive for bulk moves</span>
          </label>
        </div>
        <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-[var(--text-inverse)]">
          Apply to selected
        </button>
        <div className="text-xs text-[var(--text-secondary)]">Targets are required for Project/Area/Resource. Use Archive or Inbox to clear without targets.</div>

        <div className="space-y-3">
          {items.map((item) => {
            const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.isDone;
            const formatDate = (date: Date | null) => (date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null);
            return (
            <div key={item.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)]/80 p-3 space-y-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" name="selected" value={item.id} className="mt-1 h-4 w-4" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                    {item.dueDate && (
                      <Badge variant={isOverdue ? "error" : "info"}>
                        Due: {formatDate(item.dueDate)}
                      </Badge>
                    )}
                    {item.isDone && <Badge variant="success">Done</Badge>}
                  </div>
                  {item.itemTags && item.itemTags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.itemTags.map((it) => {
                        if (!it.tag) return null;
                        const tag = it.tag;
                        const getTagColor = (t: typeof tag) => {
                          if (t.color) return t.color;
                          const colors = ["var(--primary-strong)", "var(--accent)", "var(--success)", "var(--warning)", "#8b5cf6", "#ec4899"];
                          const index = t.name.charCodeAt(0) % colors.length;
                          return colors[index];
                        };
                        return (
                          <Badge
                            key={tag.id}
                            variant="default"
                            className="text-xs"
                            style={{ backgroundColor: getTagColor(tag) + "20", borderColor: getTagColor(tag) }}
                          >
                            {tag.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  {item.details && <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{item.details}</p>}
                  {item.url && (
                    <a href={item.url} className="text-xs font-semibold text-[var(--primary-strong)] underline" target="_blank" rel="noreferrer">{item.url}</a>
                  )}
                  <div className="text-xs text-[var(--text-secondary)]">Type: {item.type} · Created {item.createdAt.toISOString().slice(0, 10)}</div>
                </div>
              </label>

              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                <form action={moveToProject} className="space-y-2 rounded-md border border-[var(--border-subtle)] p-2 text-sm">
                  <input type="hidden" name="itemId" value={item.id} />
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Move to project</div>
                  <select name="projectId" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input name="newProjectName" placeholder="New project name" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                  <input name="newProjectOutcome" placeholder="Outcome" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                  <input name="newProjectDeadline" type="date" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                  <button className="rounded-md border border-[var(--border-strong)] px-2 py-1">Move</button>
                </form>

                <form action={moveToArea} className="space-y-2 rounded-md border border-[var(--border-subtle)] p-2 text-sm">
                  <input type="hidden" name="itemId" value={item.id} />
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Move to area</div>
                  <select name="areaId" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                    <option value="">Select area</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <input name="newAreaName" placeholder="New area name" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                  <input name="newAreaStandard" placeholder="Standard" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                  <button className="rounded-md border border-[var(--border-strong)] px-2 py-1">Move</button>
                </form>

                <form action={moveToResource} className="space-y-2 rounded-md border border-[var(--border-subtle)] p-2 text-sm">
                  <input type="hidden" name="itemId" value={item.id} />
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Save as resource</div>
                  <select name="collectionId" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                    <option value="">Select collection</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input name="newCollectionName" placeholder="New collection name" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                  <button className="rounded-md border border-[var(--border-strong)] px-2 py-1">Save</button>
                </form>
              </div>

              <div className="flex items-center gap-2">
                <ItemCompletionToggle itemId={item.id} isDone={item.isDone} />
                <InboxItemActions itemId={item.id} />
              </div>

              <details className="rounded-md border border-dashed border-[var(--border-subtle)] p-2 text-sm">
                <summary className="cursor-pointer text-xs font-semibold text-[var(--text-primary)]">Edit item</summary>
                <form action={updateItem} className="mt-2 grid gap-2 md:grid-cols-2">
                  <input type="hidden" name="itemId" value={item.id} />
                  <input name="title" defaultValue={item.title} className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" required />
                  <select name="type" defaultValue={item.type} className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                    {Object.values(ItemType).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <textarea name="details" defaultValue={item.details ?? ""} rows={2} className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 md:col-span-2" />
                  <input name="url" defaultValue={item.url ?? ""} placeholder="URL" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                  <input name="dueDate" type="date" defaultValue={item.dueDate ? new Date(item.dueDate).toISOString().split("T")[0] : ""} className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                  <label className="flex items-center gap-2 md:col-span-2">
                    <input type="checkbox" name="isDone" defaultChecked={item.isDone} className="h-4 w-4" />
                    <span className="text-sm">Mark as done</span>
                  </label>
                  <div className="md:col-span-2">
                    <InboxItemTags
                      itemId={item.id}
                      initialTags={item.itemTags?.map((it) => it.tag).filter((tag): tag is NonNullable<typeof tag> => tag !== null) || []}
                      allTags={tags}
                    />
                  </div>
                  <button className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-[var(--text-inverse)] md:col-span-2" type="submit">Save</button>
                </form>
              </details>
            </div>
          );
          })}
          {items.length === 0 && (
            <EmptyState
              title="Inbox Zero Achieved! 🎉"
              description="Your inbox is empty. Capture new items using the form above, or use the quick capture shortcut (Ctrl/Cmd+I)."
              icon="📭"
            />
          )}
        </div>
        <InboxPaginationWrapper currentPage={page} totalPages={Math.ceil(totalCount / pageSize)} />
      </form>

            <div className="text-sm text-[var(--text-secondary)]">Need a new project or area first? Head to <Link href="/projects" className="font-semibold text-[var(--primary-strong)] underline">Projects</Link> or <Link href="/areas" className="font-semibold text-[var(--primary-strong)] underline">Areas</Link>.</div>
          </div>
        </InboxWithRefresh>
      );
}
