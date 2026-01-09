"use client";

import { useState, memo, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "./pagination";
import { InboxItemActions } from "./inbox-item-actions";
import { ItemSkeleton } from "./ui/loading-skeleton";
import { EmptyState } from "./ui/empty-state";
import { Badge } from "./ui/badge";
import { ItemClassification, ItemType } from "@prisma/client";

type Item = {
  id: string;
  title: string;
  details: string | null;
  url: string | null;
  type: ItemType;
  classification: ItemClassification;
  createdAt: Date;
  dueDate: Date | null;
  isDone: boolean;
};

type InboxPaginatedProps = {
  initialItems: Item[];
  totalCount: number;
  currentPage: number;
  pageSize?: number;
  projects: Array<{ id: string; name: string }>;
  areas: Array<{ id: string; name: string }>;
  collections: Array<{ id: string; name: string }>;
};

const ITEMS_PER_PAGE = 20;

export const InboxPaginated = memo(function InboxPaginated({
  initialItems,
  totalCount,
  currentPage,
  pageSize = ITEMS_PER_PAGE,
  projects,
  areas,
  collections,
}: InboxPaginatedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items] = useState(initialItems);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/inbox?${params.toString()}`);
  };

  const formatDate = useMemo(() => (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, []);

  const isOverdue = useMemo(() => (dueDate: Date | null) => {
    if (!dueDate) return false;
    const now = new Date();
    return new Date(dueDate) < now && !items.find((i) => i.dueDate && i.dueDate.getTime() === new Date(dueDate).getTime() && i.isDone);
  }, [items]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Inbox Zero Achieved! 🎉"
        description="Your inbox is empty. Capture new items using the form above, or use the quick capture shortcut (Ctrl/Cmd+I)."
        icon="📭"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)]/80 p-3 space-y-3">
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                name="selected" 
                value={item.id} 
                aria-label={`Select ${item.title}`}
                className="mt-1 h-4 w-4" 
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                  {item.dueDate && (
                    <Badge variant={isOverdue(item.dueDate) ? "error" : "info"}>
                      Due: {formatDate(item.dueDate)}
                    </Badge>
                  )}
                  {item.isDone && <Badge variant="success">Done</Badge>}
                </div>
                {item.details && <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{item.details}</p>}
                {item.url && (
                  <a
                    href={item.url}
                    className="text-xs font-semibold text-[var(--primary-strong)] underline hover:text-[var(--primary)]"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.url}
                  </a>
                )}
                <div className="text-xs text-[var(--text-secondary)]">
                  Type: {item.type} · Created {formatDate(item.createdAt)}
                </div>
              </div>
            </label>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              <form action="/api/inbox/move-to-project" method="post" className="space-y-2 rounded-md border border-[var(--border-subtle)] p-2 text-sm">
                <input type="hidden" name="itemId" value={item.id} />
                <label htmlFor={`project-${item.id}`} className="text-xs font-semibold text-[var(--text-primary)]">Move to project</label>
                <select 
                  id={`project-${item.id}`}
                  name="projectId" 
                  aria-label="Select project to move item to"
                  className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]"
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                >
                  Move
                </button>
              </form>

              <form action="/api/inbox/move-to-area" method="post" className="space-y-2 rounded-md border border-[var(--border-subtle)] p-2 text-sm">
                <input type="hidden" name="itemId" value={item.id} />
                <label htmlFor={`area-${item.id}`} className="text-xs font-semibold text-[var(--text-primary)]">Move to area</label>
                <select 
                  id={`area-${item.id}`}
                  name="areaId" 
                  aria-label="Select area to move item to"
                  className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]"
                >
                  <option value="">Select area</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                >
                  Move
                </button>
              </form>

              <form action="/api/inbox/move-to-resource" method="post" className="space-y-2 rounded-md border border-[var(--border-subtle)] p-2 text-sm">
                <input type="hidden" name="itemId" value={item.id} />
                <label htmlFor={`collection-${item.id}`} className="text-xs font-semibold text-[var(--text-primary)]">Save as resource</label>
                <select 
                  id={`collection-${item.id}`}
                  name="collectionId" 
                  aria-label="Select collection to save item as resource"
                  className="w-full border border-[var(--border-default)] bg-[var(--surface)] px-2 py-1 text-[var(--text-primary)]"
                >
                  <option value="">Select collection</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-2 py-1 text-xs text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                >
                  Save
                </button>
              </form>
            </div>

            <InboxItemActions itemId={item.id} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
});

