"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm" aria-label="Theme toggle">
        <span className="opacity-0">🌓</span>
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
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

