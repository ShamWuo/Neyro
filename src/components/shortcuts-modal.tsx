"use client";

import { useEffect, useState } from "react";

const shortcuts = [
  { keys: "C", action: "Go to Inbox" },
  { keys: "P", action: "Projects" },
  { keys: "A", action: "Areas" },
  { keys: "R", action: "Resources" },
  { keys: "F", action: "Focus" },
  { keys: "Cmd/Ctrl + K", action: "Command palette" },
  { keys: "Shift + /", action: "Show shortcuts" },
];

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    const toggleHandler = () => setOpen((prev) => !prev);
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("shortcuts:open", openHandler as EventListener);
    window.addEventListener("shortcuts:toggle", toggleHandler as EventListener);
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("shortcuts:open", openHandler as EventListener);
      window.removeEventListener("shortcuts:toggle", toggleHandler as EventListener);
      window.removeEventListener("keydown", keyHandler);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-[rgba(0,0,0,0.25)] p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 shadow-[var(--elev-2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Keyboard shortcuts</h3>
          <button className="text-[11px] font-semibold text-[var(--text-tertiary)]" onClick={() => setOpen(false)}>
            Esc
          </button>
        </div>
        <div className="grid gap-2 text-sm text-[var(--text-secondary)]">
          {shortcuts.map((s) => (
            <div key={s.action} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2">
              <span className="text-[var(--text-primary)]">{s.action}</span>
              <span className="rounded border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-[11px] text-[var(--text-tertiary)]">{s.keys}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
