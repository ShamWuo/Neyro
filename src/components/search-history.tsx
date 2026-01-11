"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MAX_HISTORY_ITEMS = 10;

export function SearchHistory({ onSelect }: { onSelect?: (query: string) => void }) {
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Loading from localStorage on mount is intentional
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("search-history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHistory(Array.isArray(parsed) ? parsed : []);
        } catch {
          // Invalid saved data, use default
          setHistory([]);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    setHistory((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem("search-history", JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("search-history");
  };

  const handleSelect = (query: string) => {
    if (onSelect) {
      onSelect(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
    addToHistory(query);
  };

  if (history.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          Recent Searches
        </span>
        <button
          onClick={clearHistory}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((query, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(query)}
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--primary-strong)] hover:bg-[var(--card-muted)]"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}

// Export function to add to history from other components
export function addSearchToHistory(query: string) {
  const saved = localStorage.getItem("search-history");
  let history: string[] = [];

  if (saved) {
    try {
      history = JSON.parse(saved);
    } catch {
      history = [];
    }
  }

  const filtered = history.filter((q) => q.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem("search-history", JSON.stringify(updated));
}
