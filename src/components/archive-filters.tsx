"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ItemClassification, ItemType } from "@prisma/client";

export function ArchiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [classification, setClassification] = useState(searchParams.get("classification") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (classification) params.set("classification", classification);
    if (type) params.set("type", type);
    router.push(`/archive${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const clearFilters = () => {
    setQuery("");
    setClassification("");
    setType("");
    router.push("/archive");
  };

  return (
    <form onSubmit={handleFilter} className="panel space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search archive..."
          className="border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
        />
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
          className="border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
        >
          <option value="">All Classifications</option>
          {Object.values(ItemClassification).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
        >
          <option value="">All Types</option>
          {Object.values(ItemType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]"
        >
          Apply Filters
        </button>
        {(query || classification || type) && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

