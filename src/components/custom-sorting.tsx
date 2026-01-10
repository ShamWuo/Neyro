"use client";

import { useState } from "react";

type SortOption = {
  field: string;
  direction: "asc" | "desc";
  label: string;
};

type CustomSortingProps = {
  options: SortOption[];
  currentSort?: SortOption;
  onChange: (sort: SortOption) => void;
  label?: string;
};

export function CustomSorting({
  options,
  currentSort,
  onChange,
  label = "Sort by",
}: CustomSortingProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: SortOption) => {
    onChange(option);
    setIsOpen(false);
  };

  const toggleDirection = (field: string) => {
    const option = options.find((o) => o.field === field);
    if (option && currentSort?.field === field) {
      const newDirection = currentSort.direction === "asc" ? "desc" : "asc";
      onChange({ ...option, direction: newDirection });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-default)]"
        aria-label={label}
      >
        <span>{label}</span>
        {currentSort && (
          <>
            <span className="text-xs text-[var(--text-tertiary)]">
              {currentSort.label} ({currentSort.direction === "asc" ? "↑" : "↓"})
            </span>
          </>
        )}
        <svg
          className={`h-4 w-4 text-[var(--text-tertiary)] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full left-0 mt-1 z-20 min-w-[200px] rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--elev-2)] py-1">
            {options.map((option) => (
              <button
                key={option.field}
                onClick={() => handleSelect(option)}
                onDoubleClick={() => toggleDirection(option.field)}
                className={`w-full px-3 py-2 text-left text-sm transition ${
                  currentSort?.field === option.field
                    ? "bg-[var(--card-muted)] text-[var(--primary-strong)] font-semibold"
                    : "text-[var(--text-primary)] hover:bg-[var(--card-muted)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {currentSort?.field === option.field && (
                    <span className="text-xs">{currentSort.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </button>
            ))}
            <div className="my-1 border-t border-[var(--border-subtle)]" />
            <button
              onClick={() => {
                onChange(options[0]);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-[var(--text-tertiary)] hover:bg-[var(--card-muted)]"
            >
              Reset to default
            </button>
          </div>
        </>
      )}
    </div>
  );
}
