"use client";

import { useState, useEffect } from "react";

type Density = "compact" | "normal" | "comfortable";

type DensitySettingsProps = {
  currentDensity?: Density;
  onDensityChange: (density: Density) => void;
};

const densityConfig: Record<Density, { padding: string; fontSize: string; lineHeight: string; label: string }> = {
  compact: {
    padding: "p-2",
    fontSize: "text-xs",
    lineHeight: "leading-tight",
    label: "Compact",
  },
  normal: {
    padding: "p-3",
    fontSize: "text-sm",
    lineHeight: "leading-normal",
    label: "Normal",
  },
  comfortable: {
    padding: "p-4",
    fontSize: "text-base",
    lineHeight: "leading-relaxed",
    label: "Comfortable",
  },
};

export function DensitySettings({
  currentDensity = "normal",
  onDensityChange,
}: DensitySettingsProps) {
  const [density, setDensity] = useState<Density>(currentDensity);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("density-setting");
      if (saved && ["compact", "normal", "comfortable"].includes(saved)) {
        setDensity(saved as Density);
        onDensityChange(saved as Density);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [onDensityChange]);

  const handleDensityChange = (newDensity: Density) => {
    setDensity(newDensity);
    localStorage.setItem("density-setting", newDensity);
    onDensityChange(newDensity);

    // Apply density class to document
    document.documentElement.setAttribute("data-density", newDensity);
  };

  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-1">
      {(Object.keys(densityConfig) as Density[]).map((option) => (
        <button
          key={option}
          onClick={() => handleDensityChange(option)}
          className={`rounded px-3 py-1.5 text-xs font-semibold transition ${density === option
              ? "bg-[var(--primary-strong)] text-white shadow-sm"
              : "text-[var(--text-secondary)] hover:bg-[var(--card-muted)] hover:text-[var(--text-primary)]"
            }`}
          aria-label={`Switch to ${densityConfig[option].label} density`}
          aria-pressed={density === option}
        >
          {densityConfig[option].label}
        </button>
      ))}
    </div>
  );
}
