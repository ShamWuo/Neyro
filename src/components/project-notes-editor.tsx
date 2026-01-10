"use client";

import { useState, useEffect } from "react";
import { showToast } from "./ui/toast";

type ProjectNotesEditorProps = {
  projectId: string;
  initialNotes?: string;
  onSave?: (notes: string) => void;
};

export function ProjectNotesEditor({
  projectId,
  initialNotes = "",
  onSave,
}: ProjectNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
    setIsDirty(false);
  }, [initialNotes]);

  const handleSave = async () => {
    if (!projectId) {
      showToast("Project ID is required", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to save notes");
      }

      setIsDirty(false);
      onSave?.(notes);
      showToast("Notes saved successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save notes";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setNotes(value);
    setIsDirty(value !== initialNotes);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Project Notes</h3>
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-1.5 text-xs font-semibold text-white transition hover:shadow-[var(--elev-2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add notes, ideas, or context for this project..."
        className="w-full min-h-[200px] rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-2 focus:outline-[var(--primary-strong)] focus:border-[var(--primary-strong)] resize-y disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={saving}
        aria-label="Project notes editor"
        aria-describedby="notes-help"
      />
      <p id="notes-help" className="text-xs text-[var(--text-tertiary)]">
        Supports Markdown formatting. Use **bold**, *italic*, `code`, and more.
      </p>
    </div>
  );
}
