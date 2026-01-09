"use client";

import { useEffect, useState } from "react";

const shortcuts = [
  { category: "Navigation", items: [
    { keys: "C", action: "Go to Inbox" },
    { keys: "P", action: "Projects" },
    { keys: "A", action: "Areas" },
    { keys: "R", action: "Resources" },
    { keys: "F", action: "Focus" },
    { keys: "S", action: "Search" },
  ]},
  { category: "Actions", items: [
    { keys: "Cmd/Ctrl + I", action: "Quick capture" },
    { keys: "Cmd/Ctrl + K", action: "Command palette" },
  ]},
  { category: "Other", items: [
    { keys: "Shift + U", action: "Upgrade / Pricing" },
    { keys: "Shift + ?", action: "Show shortcuts" },
    { keys: "Esc", action: "Close modals" },
  ]},
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
    <div 
      className="fixed inset-0 z-40 flex items-start justify-center bg-[var(--overlay)] p-4 backdrop-blur-sm" 
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
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
        <div className="space-y-4 text-sm text-[var(--text-secondary)]">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                {category.category}
              </h4>
              <div className="grid gap-2">
                {category.items.map((s) => (
                  <div
                    key={s.action}
                    className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2"
                  >
                    <span className="text-[var(--text-primary)]">{s.action}</span>
                    <span className="rounded border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-[11px] font-mono text-[var(--text-tertiary)]">
                      {s.keys}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
