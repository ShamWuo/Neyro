"use client";

import { useState, useEffect } from "react";
import { showToast } from "./ui/toast";

type FilterConfig = {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string;
};

type CustomFiltersProps = {
  currentFilters: Record<string, unknown>;
  onApply: (filters: Record<string, unknown>) => void;
  filterType?: "items" | "projects" | "areas";
};

export function CustomFilters({
  currentFilters,
  onApply,
  filterType = "items",
}: CustomFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<FilterConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`custom-filters-${filterType}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedFilters(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSavedFilters([]);
      }
    }
  }, [filterType]);

  const handleSave = () => {
    if (!filterName.trim()) {
      showToast("Please enter a name for this filter", "error");
      return;
    }

    if (Object.keys(currentFilters).length === 0) {
      showToast("Please set some filters before saving", "warning");
      return;
    }

    try {
      const newFilter: FilterConfig = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: filterName.trim(),
        filters: { ...currentFilters }, // Deep copy
        createdAt: new Date().toISOString(),
      };

      const updated = [newFilter, ...savedFilters].slice(0, 10); // Keep max 10
      setSavedFilters(updated);
      localStorage.setItem(`custom-filters-${filterType}`, JSON.stringify(updated));
      setFilterName("");
      setShowForm(false);
      showToast("Filter saved successfully", "success");
    } catch (error) {
      console.error("Error saving filter:", error);
      showToast("Failed to save filter", "error");
    }
  };

  const handleDelete = (id: string) => {
    try {
      const updated = savedFilters.filter((f) => f.id !== id);
      setSavedFilters(updated);
      localStorage.setItem(`custom-filters-${filterType}`, JSON.stringify(updated));
      showToast("Filter deleted", "success");
    } catch (error) {
      console.error("Error deleting filter:", error);
      showToast("Failed to delete filter", "error");
    }
  };

  const handleApply = (filters: Record<string, unknown>) => {
    onApply(filters);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          Saved Filters
        </span>
        {!showForm && Object.keys(currentFilters).length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-[var(--primary-strong)] hover:underline"
          >
            Save current
          </button>
        )}
      </div>

      {showForm && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Filter name..."
            className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && filterName.trim()) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") {
                setShowForm(false);
                setFilterName("");
              }
            }}
            aria-label="Filter name input"
          />
          <button
            onClick={handleSave}
            disabled={!filterName.trim()}
            className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setFilterName("");
            }}
            className="rounded-md border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
          >
            Cancel
          </button>
        </div>
      )}

      {savedFilters.length > 0 ? (
        <div className="space-y-2">
          {savedFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between rounded border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 group"
            >
              <button
                onClick={() => handleApply(filter.filters)}
                className="flex-1 text-left text-sm text-[var(--text-primary)] hover:text-[var(--primary-strong)] transition"
              >
                {filter.name}
              </button>
              <button
                onClick={() => handleDelete(filter.id)}
                className="ml-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Delete filter ${filter.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-secondary)]">No saved filters yet</p>
      )}
    </div>
  );
}
