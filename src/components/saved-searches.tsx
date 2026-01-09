"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from "./ui/toast";
import { Badge } from "./ui/badge";

type SavedSearch = {
  id: string;
  name: string;
  query?: string | null;
  filters: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type SavedSearchesProps = {
  initialSearches?: SavedSearch[];
};

export function SavedSearches({ initialSearches = [] }: SavedSearchesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searches, setSearches] = useState<SavedSearch[]>(initialSearches);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    // Fetch saved searches on mount
    async function fetchSearches() {
      try {
        const res = await fetch("/api/saved-searches");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSearches(data);
          }
        }
      } catch {
        // Silent fail - searches will use initialSearches
      }
    }
    fetchSearches();
  }, []);

  const handleSaveSearch = async () => {
    if (!name.trim()) {
      showToast("Please enter a name for this search", "error");
      return;
    }

    setSaving(true);
    try {
      const currentQuery = searchParams.get("q") || null;
      const filters: Record<string, unknown> = {};
      
      const classification = searchParams.get("classification");
      const type = searchParams.get("type");
      const sort = searchParams.get("sort");

      if (classification) filters.classification = classification;
      if (type) filters.type = type;
      if (sort) filters.sort = sort;

      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          query: currentQuery,
          filters,
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to save search" }));
        throw new Error(error.error || "Failed to save search");
      }

      const newSearch = await res.json();
      setSearches((prev) => [newSearch, ...prev]);
      setName("");
      setShowForm(false);
      showToast("Search saved successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save search";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    
    if (search.query) params.set("q", search.query);
    
    if (search.filters && typeof search.filters === "object") {
      const filters = search.filters as Record<string, string>;
      if (filters.classification) params.set("classification", String(filters.classification));
      if (filters.type) params.set("type", String(filters.type));
      if (filters.sort) params.set("sort", String(filters.sort));
    }

    router.push(`/search?${params.toString()}`);
  };

  const handleDeleteSearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this saved search?")) return;

    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to delete search" }));
        throw new Error(error.error || "Failed to delete search");
      }

      setSearches((prev) => prev.filter((s) => s.id !== id));
      showToast("Search deleted", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete search";
      showToast(message, "error");
    }
  };

  const hasActiveSearch = searchParams.get("q") || searchParams.get("classification") || searchParams.get("type");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--text-primary)]">Saved Searches</div>
        {hasActiveSearch && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-[var(--primary-strong)] hover:underline"
          >
            Save current search
          </button>
        )}
      </div>

      {showForm && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search name..."
            className="flex-1 border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveSearch();
              if (e.key === "Escape") {
                setShowForm(false);
                setName("");
              }
            }}
          />
          <button
            onClick={handleSaveSearch}
            disabled={saving || !name.trim()}
            className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-[var(--text-inverse)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setName("");
            }}
            className="rounded-md border border-[var(--border-default)] px-3 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      )}

      {searches.length > 0 ? (
        <div className="space-y-2">
          {searches.map((search) => (
            <div
              key={search.id}
              onClick={() => handleLoadSearch(search)}
              className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm cursor-pointer hover:border-[var(--border-default)] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[var(--text-primary)] truncate">{search.name}</div>
                {search.query && (
                  <div className="text-xs text-[var(--text-secondary)] truncate mt-1">Query: {search.query}</div>
                )}
                {search.filters && typeof search.filters === "object" && Object.keys(search.filters).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(search.filters).map(([key, value]) => (
                      <Badge key={key} variant="default" className="text-xs">
                        {key}: {String(value)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => handleDeleteSearch(search.id, e)}
                className="ml-2 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete saved search"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-[var(--text-secondary)]">No saved searches yet. Save your first search to get started.</div>
      )}
    </div>
  );
}

