"use client";

import { useState } from "react";
import { showToast } from "./ui/toast";

type Milestone = {
  id: string;
  name: string;
  targetDate: Date | null;
  completed: boolean;
  completedAt: Date | null;
};

type ProjectMilestonesProps = {
  projectId: string;
  initialMilestones?: Milestone[];
  onMilestoneComplete?: (milestoneId: string) => void;
};

export function ProjectMilestones({
  projectId,
  initialMilestones = [],
  onMilestoneComplete,
}: ProjectMilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [showForm, setShowForm] = useState(false);
  const [milestoneName, setMilestoneName] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleAddMilestone = async () => {
    if (!milestoneName.trim()) {
      showToast("Please enter a milestone name", "error");
      return;
    }

    if (!projectId) {
      showToast("Project ID is required", "error");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: milestoneName.trim(),
          targetDate: targetDate ? new Date(targetDate).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to create milestone");
      }

      const newMilestone = await res.json();
      setMilestones([...milestones, {
        ...newMilestone,
        targetDate: newMilestone.targetDate ? new Date(newMilestone.targetDate) : null,
        completedAt: newMilestone.completedAt ? new Date(newMilestone.completedAt) : null,
      }]);
      setMilestoneName("");
      setTargetDate("");
      setShowForm(false);
      showToast("Milestone added successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add milestone";
      showToast(message, "error");
    }
  };

  const handleToggleComplete = async (milestoneId: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: !milestone.completed,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update milestone");
      }

      const updated = milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date() : null }
          : m
      );
      setMilestones(updated);
      onMilestoneComplete?.(milestoneId);
      showToast(`Milestone ${!milestone.completed ? "completed" : "reopened"}`, "success");
    } catch {
      showToast("Failed to update milestone", "error");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Milestones</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-[var(--primary-strong)] hover:underline"
          >
            + Add Milestone
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-3 space-y-2">
          <input
            type="text"
            value={milestoneName}
            onChange={(e) => setMilestoneName(e.target.value)}
            placeholder="Milestone name..."
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
            autoFocus
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddMilestone}
              disabled={!milestoneName.trim()}
              className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setMilestoneName("");
                setTargetDate("");
              }}
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {milestones.length > 0 ? (
        <div className="space-y-2">
          {milestones.map((milestone) => (
            <label
              key={milestone.id}
              className="flex items-center gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-3 cursor-pointer group hover:border-[var(--border-default)] transition"
            >
              <input
                type="checkbox"
                checked={milestone.completed}
                onChange={() => handleToggleComplete(milestone.id)}
                className="h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--primary-strong)] focus:ring-[var(--primary-strong)]"
              />
              <div className="flex-1">
                <div
                  className={`text-sm font-medium ${
                    milestone.completed
                      ? "text-[var(--text-tertiary)] line-through"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {milestone.name}
                </div>
                {milestone.targetDate && (
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    Target: {new Date(milestone.targetDate).toLocaleDateString()}
                  </div>
                )}
                {milestone.completed && milestone.completedAt && (
                  <div className="text-xs text-[var(--success)] mt-1">
                    Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-secondary)] text-center py-4">
          No milestones yet. Break your project into manageable phases.
        </p>
      )}
    </div>
  );
}
