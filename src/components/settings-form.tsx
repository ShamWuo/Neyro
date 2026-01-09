"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "./ui/toast";
import { UserSettings } from "@prisma/client";

type SettingsFormProps = {
  initialSettings: UserSettings;
};

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    projectLimit: initialSettings.projectLimit,
    voiceLanguage: initialSettings.voiceLanguage,
    ttsEnabled: initialSettings.ttsEnabled,
    personality: initialSettings.personality,
    reviewDay: initialSettings.reviewDay,
    reviewTime: initialSettings.reviewTime,
    theme: initialSettings.theme,
    notifications: initialSettings.notifications as {
      deadlines?: boolean;
      inbox?: boolean;
      review?: boolean;
      areas?: boolean;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      showToast("Settings saved!", "success");
      router.refresh();
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Project Settings</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Project Limit</span>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.projectLimit}
              onChange={(e) => setSettings({ ...settings, projectLimit: parseInt(e.target.value) || 7 })}
              className="w-20 border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 rounded text-sm"
            />
          </label>
          <p className="text-xs text-[var(--text-tertiary)]">
            Maximum number of active projects (PARA recommends 7)
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Voice Settings</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Input Language</span>
            <select
              value={settings.voiceLanguage}
              onChange={(e) => setSettings({ ...settings, voiceLanguage: e.target.value })}
              className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 rounded text-sm"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Text-to-Speech</span>
            <input
              type="checkbox"
              checked={settings.ttsEnabled}
              onChange={(e) => setSettings({ ...settings, ttsEnabled: e.target.checked })}
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">App Personality</span>
            <select
              value={settings.personality}
              onChange={(e) => setSettings({ ...settings, personality: e.target.value })}
              className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 rounded text-sm"
            >
              <option value="strict">Strict</option>
              <option value="supportive">Supportive</option>
              <option value="balanced">Balanced</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Weekly Review</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Review Day</span>
            <select
              value={settings.reviewDay}
              onChange={(e) => setSettings({ ...settings, reviewDay: e.target.value })}
              className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 rounded text-sm"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
            </select>
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Review Time</span>
            <input
              type="time"
              value={settings.reviewTime}
              onChange={(e) => setSettings({ ...settings, reviewTime: e.target.value })}
              className="border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1 rounded text-sm"
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Deadline Reminders</span>
            <input
              type="checkbox"
              checked={settings.notifications.deadlines ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, deadlines: e.target.checked },
                })
              }
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Inbox Overflow Alerts</span>
            <input
              type="checkbox"
              checked={settings.notifications.inbox ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, inbox: e.target.checked },
                })
              }
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Weekly Review Reminders</span>
            <input
              type="checkbox"
              checked={settings.notifications.review ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, review: e.target.checked },
                })
              }
              className="h-4 w-4"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Area Health Check-ins</span>
            <input
              type="checkbox"
              checked={settings.notifications.areas ?? true}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, areas: e.target.checked },
                })
              }
              className="h-4 w-4"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-6 py-2 text-sm font-semibold text-[var(--text-inverse)] disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
