import { auth } from "@/auth";
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
import { InboxWithRefresh } from "@/components/inbox-with-refresh";
import { CenteredCapture } from "@/components/centered-capture";
import { createItem, updateItem, moveToProject, moveToArea, moveToResource, bulkClassify } from "./actions";

export default async function InboxPage({ searchParams }: { searchParams?: Promise<{ page?: string; mode?: string }> }) {
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
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <InboxWithRefresh>
      <div className="space-y-8">
        {/* Centered Capture Interface */}
        <section className="py-8">
          <CenteredCapture />
        </section>

        {/* Inbox Items List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Inbox Items ({totalCount})</h2>
            <div className="text-sm text-[var(--text-secondary)]">
              Page {page} of {totalPages}
            </div>
          </div>

          {items.map((item) => {
            const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.isDone;
            const formatDate = (date: Date | null) => (date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null);
            return (
              <div key={item.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)]/90 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-[var(--text-primary)]">{item.title}</div>
                      {item.dueDate && (
                        <Badge variant={isOverdue ? "error" : "info"}>Due {formatDate(item.dueDate)}</Badge>
                      )}
                      {item.isDone && <Badge variant="success">Done</Badge>}
                    </div>
                    {item.details && <p className="text-sm text-[var(--text-secondary)]">{item.details}</p>}
                    {item.url && (
                      <a href={item.url} className="text-xs font-semibold text-[var(--primary-strong)] underline" target="_blank" rel="noreferrer">{item.url}</a>
                    )}
                    <div className="text-xs text-[var(--text-secondary)]">{item.type} · {item.createdAt.toISOString().slice(0, 10)}</div>
                    {item.itemTags && item.itemTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.itemTags.map((it) => {
                          if (!it.tag) return null;
                          const tag = it.tag;
                          const getTagColor = (t: typeof tag) => {
                            if (t.color) return t.color;
                            const colors = ["var(--primary-strong)", "var(--accent)", "var(--success)", "var(--warning)", "#8b5cf6", "#ec4899"];
                            const index = t.name.charCodeAt(0) % colors.length;
                            return colors[index];
                          };
                          const color = getTagColor(tag);
                          return (
                            <Badge key={tag.id} variant="default" className="text-xs" style={{ backgroundColor: color + "20", borderColor: color }}>
                              {tag.name}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ItemCompletionToggle itemId={item.id} isDone={item.isDone} />
                    <InboxItemActions itemId={item.id} />
                  </div>
                </div>

                <details className="mt-3 rounded-lg border border-dashed border-[var(--border-subtle)] p-3 text-sm">
                  <summary className="cursor-pointer text-xs font-semibold text-[var(--text-primary)]">Organize & edit</summary>
                  <div className="mt-2 space-y-3">
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      <form action={moveToProject} className="space-y-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2 text-xs">
                        <input type="hidden" name="itemId" value={item.id} />
                        <div className="font-semibold text-[var(--text-primary)]">Project</div>
                        <select name="projectId" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                          <option value="">Select project</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <input name="newProjectName" placeholder="New project" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                        <input name="newProjectOutcome" placeholder="Outcome" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                        <input name="newProjectDeadline" type="date" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                        <button className="rounded-md border border-[var(--border-strong)] px-2 py-1">Move</button>
                      </form>

                      <form action={moveToArea} className="space-y-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2 text-xs">
                        <input type="hidden" name="itemId" value={item.id} />
                        <div className="font-semibold text-[var(--text-primary)]">Area</div>
                        <select name="areaId" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                          <option value="">Select area</option>
                          {areas.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        <input name="newAreaName" placeholder="New area" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                        <input name="newAreaStandard" placeholder="Standard" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                        <button className="rounded-md border border-[var(--border-strong)] px-2 py-1">Move</button>
                      </form>

                      <form action={moveToResource} className="space-y-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] p-2 text-xs">
                        <input type="hidden" name="itemId" value={item.id} />
                        <div className="font-semibold text-[var(--text-primary)]">Resource</div>
                        <select name="collectionId" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                          <option value="">Select collection</option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <input name="newCollectionName" placeholder="New collection" className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1" />
                        <button className="rounded-md border border-[var(--border-strong)] px-2 py-1">Save</button>
                      </form>
                    </div>

                    <form action={updateItem} className="grid gap-2 md:grid-cols-2">
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
                  </div>
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
        </section>

        <section className="panel space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Bulk classify</h2>
              <p className="text-xs text-[var(--text-secondary)]">Select items, choose a destination, and apply once.</p>
            </div>
          </div>
          <form action={bulkClassify} className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-3">
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
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-[var(--text-primary)]">Area</span>
                <select name="areaId" className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                  <option value="">Select</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-[var(--text-primary)]">Resource</span>
                <select name="resourceCollectionId" className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1">
                  <option value="">Select</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-[var(--danger)]">
                <input type="checkbox" name="confirmArchive" className="h-4 w-4" />
                <span className="text-xs">Confirm archive</span>
              </label>
            </div>
            <button type="submit" className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-[var(--text-inverse)]">
              Apply to selected
            </button>
          </form>
          <div className="text-xs text-[var(--text-secondary)]">Need a new project or area first? Head to <Link href="/projects" className="font-semibold text-[var(--primary-strong)] underline">Projects</Link> or <Link href="/areas" className="font-semibold text-[var(--primary-strong)] underline">Areas</Link>.</div>
        </section>

        <InboxPaginationWrapper currentPage={page} totalPages={totalPages} />
      </div>
    </InboxWithRefresh>
  );
}
