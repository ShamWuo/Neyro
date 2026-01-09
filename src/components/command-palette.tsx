"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const actions = [
  { label: "Capture to Inbox", href: "/inbox", hint: "C" },
  { label: "Projects", href: "/projects", hint: "P" },
  { label: "Areas", href: "/areas", hint: "A" },
  { label: "Resources", href: "/resources", hint: "R" },
  { label: "Focus mode", href: "/focus", hint: "F" },
  { label: "Weekly review", href: "/review", hint: "W" },
  { label: "Wizard", href: "/weekly-review", hint: "" },
  { label: "Smart assist", href: "/assist", hint: "" },
  { label: "Upgrade to Focus", href: "/pricing", hint: "U" },
  { label: "Search", href: "/search", hint: "Cmd/Ctrl+K" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    function onOpen() {
      // Use setTimeout to avoid synchronous setState in event handlers
      setTimeout(() => {
        setOpen(true);
        setQuery("");
      }, 0);
    }
    function onToggle(e: CustomEvent) {
      setTimeout(() => {
        if (typeof e.detail === "boolean") {
          setOpen(e.detail);
          if (!e.detail) setQuery("");
        } else {
          setOpen((prev) => !prev);
          setQuery("");
        }
      }, 0);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setTimeout(() => {
          setOpen(false);
          setQuery("");
        }, 0);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("command-palette:open", onOpen as EventListener);
    window.addEventListener("command-palette:toggle", onToggle as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("command-palette:open", onOpen as EventListener);
      window.removeEventListener("command-palette:toggle", onToggle as EventListener);
    };
  }, []);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm" 
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 shadow-[var(--elev-3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          <span className="text-[var(--text-tertiary)]">⌘K</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to anything..."
            className="w-full bg-transparent text-[var(--text-primary)] outline-none"
          />
          <button className="text-[11px] font-semibold text-[var(--text-tertiary)]" onClick={() => setOpen(false)}>
            Esc
          </button>
        </div>
        <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="space-y-2 rounded-md bg-[var(--card-muted)] px-3 py-2 text-sm text-[var(--text-secondary)]">
              <div>No matches</div>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-[11px] font-semibold text-[var(--text-inverse)] shadow-sm hover:shadow-[var(--elev-2)]">
                Unlock Focus
              </Link>
            </div>
          )}
          {filtered.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center justify-between rounded-md border border-transparent px-3 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--border-subtle)] hover:bg-[var(--surface-muted)]"
              onClick={() => setOpen(false)}
            >
              <div className="space-y-0.5">
                <div className="font-semibold">{action.label}</div>
                {action.hint && <div className="text-[11px] text-[var(--text-tertiary)]">Shortcut: {action.hint}</div>}
              </div>
              <div className="rounded-md border border-[var(--border-subtle)] px-2 py-1 text-[11px] text-[var(--text-tertiary)]">{action.hint || ""}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
