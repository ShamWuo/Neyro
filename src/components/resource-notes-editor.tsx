"use client";

import { useState, useEffect } from "react";
import { showToast } from "./ui/toast";

type ResourceNotesEditorProps = {
  resourceId: string;
  initialNotes?: string;
  onSave?: (notes: string) => void;
};

export function ResourceNotesEditor({
  resourceId,
  initialNotes = "",
  onSave,
}: ResourceNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setNotes(initialNotes || "");
    setIsDirty(false);
  }, [initialNotes]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/resources/${resourceId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        throw new Error("Failed to save notes");
      }

      setIsDirty(false);
      onSave?.(notes);
      showToast("Notes saved", "success");
    } catch {
      showToast("Failed to save notes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setNotes(value);
    setIsDirty(value !== (initialNotes || ""));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          Personal Notes
        </label>
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-semibold text-[var(--primary-strong)] hover:underline disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add your personal notes, thoughts, or key insights about this resource..."
        className="w-full min-h-[100px] rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-2 focus:outline-[var(--primary-strong)] focus:border-[var(--primary-strong)] resize-y"
        disabled={saving}
      />
    </div>
  );
}
