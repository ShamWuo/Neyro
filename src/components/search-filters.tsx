"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ItemClassification, ItemType } from "@prisma/client";
import { Badge } from "./ui/badge";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const classification = searchParams.get("classification") || "";
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "updated";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 when filtering
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/search");
  };

  const hasActiveFilters = classification || type || sort !== "updated";

  return (
    <div className="panel space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Classification</label>
          <select
            value={classification}
            onChange={(e) => updateFilter("classification", e.target.value)}
            className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 text-sm"
          >
            <option value="">All</option>
            <option value={ItemClassification.INBOX}>Inbox</option>
            <option value={ItemClassification.PROJECT}>Project</option>
            <option value={ItemClassification.AREA}>Area</option>
            <option value={ItemClassification.RESOURCE}>Resource</option>
            <option value={ItemClassification.ARCHIVE}>Archive</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 text-sm"
          >
            <option value="">All</option>
            <option value={ItemType.NOTE}>Note</option>
            <option value={ItemType.TASK}>Task</option>
            <option value={ItemType.LINK}>Link</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Sort by</label>
          <select
            value={sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 text-sm"
          >
            <option value="updated">Recently updated</option>
            <option value="created">Recently created</option>
            <option value="title">Title (A-Z)</option>
            <option value="due">Due date</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-subtle)]">
          {classification && (
            <Badge variant="info" className="text-xs">
              Classification: {classification}
              <button
                onClick={() => updateFilter("classification", "")}
                className="ml-1 hover:opacity-70"
                aria-label="Remove filter"
              >
                ×
              </button>
            </Badge>
          )}
          {type && (
            <Badge variant="info" className="text-xs">
              Type: {type}
              <button
                onClick={() => updateFilter("type", "")}
                className="ml-1 hover:opacity-70"
                aria-label="Remove filter"
              >
                ×
              </button>
            </Badge>
          )}
          {sort !== "updated" && (
            <Badge variant="info" className="text-xs">
              Sort: {sort}
              <button
                onClick={() => updateFilter("sort", "updated")}
                className="ml-1 hover:opacity-70"
                aria-label="Remove filter"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

