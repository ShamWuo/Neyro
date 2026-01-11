"use client";

import { useState, useEffect } from "react";

type LayoutOption = "list" | "grid" | "board" | "timeline";

type LayoutOptionsProps = {
  currentLayout?: LayoutOption;
  onLayoutChange: (layout: LayoutOption) => void;
  availableLayouts?: LayoutOption[];
};

const layoutIcons: Record<LayoutOption, string> = {
  list: "☰",
  grid: "⊞",
  board: "▦",
  timeline: "━",
};

const layoutLabels: Record<LayoutOption, string> = {
  list: "List",
  grid: "Grid",
  board: "Board",
  timeline: "Timeline",
};

export function LayoutOptions({
  currentLayout = "list",
  onLayoutChange,
  availableLayouts = ["list", "grid", "board"],
}: LayoutOptionsProps) {
  const [layout, setLayout] = useState<LayoutOption>(currentLayout);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("preferred-layout");
      if (saved && availableLayouts.includes(saved as LayoutOption)) {
        setLayout(saved as LayoutOption);
        onLayoutChange(saved as LayoutOption);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [availableLayouts, onLayoutChange]);

  const handleLayoutChange = (newLayout: LayoutOption) => {
    setLayout(newLayout);
    localStorage.setItem("preferred-layout", newLayout);
    onLayoutChange(newLayout);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-1">
      {availableLayouts.map((option) => (
        <button
          key={option}
          onClick={() => handleLayoutChange(option)}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition ${layout === option
              ? "bg-[var(--primary-strong)] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:bg-[var(--card-muted)] hover:text-[var(--text-primary)]"
            }`}
          aria-label={`Switch to ${layoutLabels[option]} layout`}
          aria-pressed={layout === option}
        >
          <span>{layoutIcons[option]}</span>
          <span className="hidden sm:inline">{layoutLabels[option]}</span>
        </button>
      ))}
    </div>
  );
}
