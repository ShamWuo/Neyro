"use client";
import React from "react";
import { useProjectQuota } from "@/lib/useProjectQuota";

export default function ProjectQuota({ pollMs = 0 }: { pollMs?: number }) {
  const { data, loading, error, refresh } = useProjectQuota(pollMs);

  if (loading) return <div className="text-sm text-muted">Checking project quota…</div>;
  if (error) return <div className="text-sm text-red-500">Quota error</div>;
  if (!data) return null;

  const { active, limit, remaining, allowed } = data;

  return (
    <div className="project-quota text-sm">
      <div className="mb-1">
        Active projects: <strong>{active}</strong> / <strong>{limit}</strong>
        {remaining <= 2 && remaining > 0 && (
          <span className="ml-2 text-yellow-600">Only {remaining} slot{remaining>1?"s":""} left</span>
        )}
        {!allowed && (
          <span className="ml-2 text-red-600">Limit reached — pause or complete a project</span>
        )}
      </div>
      <div className="flex gap-2">
        <button className="rounded border px-3 py-1" onClick={() => refresh()}>
          Refresh
        </button>
        {!allowed && (
          <a className="text-primary underline" href="/pricing">Upgrade</a>
        )}
      </div>
    </div>
  );
}
