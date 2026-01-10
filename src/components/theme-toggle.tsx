"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm" aria-label="Theme toggle">
        <span className="opacity-0">🌓</span>
      </button>
    );
  }

  const cycleTheme = () => {
    // Theme is always light - no-op
    // This component is kept for compatibility but doesn't change theme
  };

  const icon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🌓";

  return (
    <button
      onClick={cycleTheme}
      className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm transition hover:border-[var(--border-strong)]"
      aria-label={`Current theme: ${theme}. Click to change theme.`}
      title={`Theme: ${theme}`}
    >
      {icon}
    </button>
  );
}

