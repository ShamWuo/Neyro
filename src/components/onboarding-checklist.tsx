"use client";

import { useState, useEffect } from "react";
import { showToast } from "./ui/toast";

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
  href?: string;
};

const defaultChecklist: ChecklistItem[] = [
  { id: "1", label: "Create your first project", completed: false, href: "/projects" },
  { id: "2", label: "Set up your first area", completed: false, href: "/areas" },
  { id: "3", label: "Capture your first item", completed: false, href: "/inbox" },
  { id: "4", label: "Complete the weekly review", completed: false, href: "/review" },
  { id: "5", label: "Explore Smart Assist", completed: false, href: "/assist" },
];

export function OnboardingChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    // Loading from localStorage on mount is intentional
    const saved = localStorage.getItem("onboarding-checklist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChecklist(parsed);
      } catch {
        // Invalid saved data, use default
        setChecklist([]);
      }
    }

    // Check if onboarding is complete
    const completed = localStorage.getItem("onboarding-complete");
    if (completed === "true") {
      setIsOpen(false);
    }
  }, []);

  const handleToggle = (id: string) => {
    setChecklist((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      localStorage.setItem("onboarding-checklist", JSON.stringify(updated));

      // Check if all items are completed
      const allCompleted = updated.every((item) => item.completed);
      if (allCompleted) {
        localStorage.setItem("onboarding-complete", "true");
        showToast("🎉 Onboarding complete! You're all set.", "success");
        setTimeout(() => setIsOpen(false), 2000);
      }

      return updated;
    });
  };

  if (!isOpen) return null;

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-[var(--elev-1)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Getting Started</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {completedCount} of {checklist.length} tasks completed
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          aria-label="Close checklist"
        >
          ✕
        </button>
      </div>

      <div className="mb-3 h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden">
        <div
          className="h-full bg-[var(--primary-strong)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {checklist.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => handleToggle(item.id)}
              className="h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--primary-strong)] focus:ring-[var(--primary-strong)]"
            />
            <span
              className={`text-sm flex-1 ${
                item.completed
                  ? "text-[var(--text-tertiary)] line-through"
                  : "text-[var(--text-primary)]"
              }`}
            >
              {item.label}
            </span>
            {item.href && !item.completed && (
              <a
                href={item.href}
                className="text-xs text-[var(--primary-strong)] opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                →
              </a>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
