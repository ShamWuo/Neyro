"use client";

import { useState, useEffect } from "react";
import { showToast } from "./ui/toast";

type NotificationPreference = {
  type: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
};

const defaultPreferences: NotificationPreference[] = [
  { type: "item_reminder", inApp: true, email: false, push: false },
  { type: "project_deadline", inApp: true, email: true, push: false },
  { type: "area_review", inApp: true, email: false, push: false },
  { type: "weekly_review", inApp: true, email: true, push: true },
  { type: "team_mention", inApp: true, email: true, push: true },
  { type: "system_update", inApp: true, email: false, push: false },
];

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(defaultPreferences);
  const [saving, setSaving] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");

  useEffect(() => {
    const saved = localStorage.getItem("notification-preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(Array.isArray(parsed.preferences) ? parsed.preferences : defaultPreferences);
        setQuietHoursEnabled(parsed.quietHoursEnabled || false);
        setQuietHoursStart(parsed.quietHoursStart || "22:00");
        setQuietHoursEnd(parsed.quietHoursEnd || "08:00");
      } catch {
        // Use defaults
      }
    }
  }, []);

  const handlePreferenceChange = (type: string, channel: "inApp" | "email" | "push", value: boolean) => {
    setPreferences((prev) =>
      prev.map((p) => (p.type === type ? { ...p, [channel]: value } : p))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences,
          quietHours: {
            enabled: quietHoursEnabled,
            start: quietHoursStart,
            end: quietHoursEnd,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save preferences");
      }

      localStorage.setItem(
        "notification-preferences",
        JSON.stringify({
          preferences,
          quietHoursEnabled,
          quietHoursStart,
          quietHoursEnd,
        })
      );

      showToast("Notification preferences saved", "success");
    } catch {
      showToast("Failed to save preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      item_reminder: "Item Reminders",
      project_deadline: "Project Deadlines",
      area_review: "Area Reviews",
      weekly_review: "Weekly Reviews",
      team_mention: "Team Mentions",
      system_update: "System Updates",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {preferences.map((pref) => (
            <div
              key={pref.type}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {getTypeLabel(pref.type)}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.inApp}
                    onChange={(e) => handlePreferenceChange(pref.type, "inApp", e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--primary-strong)] focus:ring-[var(--primary-strong)]"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">In-app notifications</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.email}
                    onChange={(e) => handlePreferenceChange(pref.type, "email", e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--primary-strong)] focus:ring-[var(--primary-strong)]"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">Email notifications</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.push}
                    onChange={(e) => handlePreferenceChange(pref.type, "push", e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--primary-strong)] focus:ring-[var(--primary-strong)]"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">Push notifications</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={quietHoursEnabled}
            onChange={(e) => setQuietHoursEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--primary-strong)] focus:ring-[var(--primary-strong)]"
          />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Quiet Hours</span>
        </label>
        {quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-3 pl-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1">
                End Time
              </label>
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[var(--elev-2)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}
