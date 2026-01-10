"use client";

import { useState } from "react";
import { showToast } from "./ui/toast";
import { GoalProgressTracker } from "./goal-progress-tracker";

type AreaGoal = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
  targetDate?: Date | null;
};

type AreaGoalsProps = {
  areaId: string;
  initialGoals?: AreaGoal[];
  onGoalUpdate?: (goals: AreaGoal[]) => void;
};

export function AreaGoals({ areaId, initialGoals = [], onGoalUpdate }: AreaGoalsProps) {
  const [goals, setGoals] = useState<AreaGoal[]>(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleAddGoal = async () => {
    if (!goalName.trim()) {
      showToast("Please enter a goal name", "error");
      return;
    }

    if (!targetValue || parseFloat(targetValue) <= 0) {
      showToast("Please enter a valid target value greater than 0", "error");
      return;
    }

    if (!areaId) {
      showToast("Area ID is required", "error");
      return;
    }

    const targetNum = parseFloat(targetValue);
    if (isNaN(targetNum) || targetNum <= 0) {
      showToast("Target value must be a positive number", "error");
      return;
    }

    const newGoal: AreaGoal = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: goalName.trim(),
      current: 0,
      target: targetNum,
      unit: unit.trim() || undefined,
      targetDate: targetDate ? new Date(targetDate) : null,
    };

    try {
      const res = await fetch(`/api/areas/${areaId}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newGoal,
          targetDate: newGoal.targetDate?.toISOString() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to create goal");
      }

      const createdGoal = await res.json();
      const goalWithDate = {
        ...createdGoal,
        targetDate: createdGoal.targetDate ? new Date(createdGoal.targetDate) : null,
      };

      const updated = [...goals, goalWithDate];
      setGoals(updated);
      onGoalUpdate?.(updated);
      setGoalName("");
      setTargetValue("");
      setUnit("");
      setTargetDate("");
      setShowForm(false);
      showToast("Goal added successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add goal";
      showToast(message, "error");
    }
  };

  const handleUpdateProgress = async (goalId: string, newCurrent: number) => {
    if (newCurrent < 0) {
      showToast("Progress cannot be negative", "error");
      return;
    }

    const previousGoals = goals;
    const updated = goals.map((g) => (g.id === goalId ? { ...g, current: newCurrent } : g));
    setGoals(updated);

    try {
      const res = await fetch(`/api/areas/${areaId}/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: newCurrent }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to update goal");
      }

      onGoalUpdate?.(updated);
      showToast("Progress updated", "success");
    } catch (error) {
      // Revert on error
      setGoals(previousGoals);
      const message = error instanceof Error ? error.message : "Failed to update goal progress";
      showToast(message, "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Area Goals</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold text-[var(--primary-strong)] hover:underline"
          >
            + Add Goal
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
          <input
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            placeholder="Goal name (e.g., Exercise sessions)"
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Target value"
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
            />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Unit (optional)"
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
            />
          </div>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            placeholder="Target date (optional)"
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddGoal}
              disabled={!goalName.trim() || !targetValue}
              className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Add Goal
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setGoalName("");
                setTargetValue("");
                setUnit("");
                setTargetDate("");
              }}
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {goals.length > 0 ? (
        <GoalProgressTracker goals={goals} />
      ) : (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 text-center">
          <p className="text-sm text-[var(--text-secondary)]">No goals set yet</p>
        </div>
      )}
    </div>
  );
}
