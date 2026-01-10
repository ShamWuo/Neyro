"use client";

import { useState } from "react";

type Shortcut = {
  keys: string[];
  description: string;
  category: string;
};

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["C"], description: "Go to Inbox", category: "Navigation" },
  { keys: ["P"], description: "Projects", category: "Navigation" },
  { keys: ["A"], description: "Areas", category: "Navigation" },
  { keys: ["R"], description: "Resources", category: "Navigation" },
  { keys: ["F"], description: "Focus", category: "Navigation" },
  { keys: ["S"], description: "Search", category: "Navigation" },
  // Actions
  { keys: ["Ctrl", "I"], description: "Quick capture", category: "Actions" },
  { keys: ["Ctrl", "K"], description: "Command palette", category: "Actions" },
  { keys: ["Esc"], description: "Close modals", category: "Actions" },
  { keys: ["Shift", "?"], description: "Show shortcuts", category: "Actions" },
  // Other
  { keys: ["Shift", "U"], description: "Upgrade / Pricing", category: "Other" },
];

export function KeyboardShortcutsDisplay() {
  const [open, setOpen] = useState(false);

  const grouped = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 rounded-full border border-[var(--border-subtle)] bg-[var(--card)] p-3 shadow-[var(--elev-2)] text-[var(--text-primary)] hover:bg-[var(--card-muted)] transition z-50"
        aria-label="Show keyboard shortcuts"
      >
        ⌘
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4">
      <div className="max-w-2xl w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-6 shadow-[var(--elev-3)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Keyboard Shortcuts</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--card-muted)] transition"
            aria-label="Close shortcuts"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <span className="text-sm text-[var(--text-secondary)]">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx} className="flex items-center gap-1">
                          {keyIdx > 0 && <span className="text-[var(--text-tertiary)]">+</span>}
                          <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--card)] px-2 py-1 text-xs font-semibold text-[var(--text-primary)]">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
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
