"use client";

import { useState, useEffect, useRef } from "react";
import { showToast } from "./ui/toast";

export function FocusTimeTracker({ projectId }: { projectId?: string }) {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [label, setLabel] = useState("");
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedSeconds(elapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking]);

  const handleStart = () => {
    if (!label.trim()) {
      showToast("Please enter a label for this focus session", "warning");
      return;
    }

    startTimeRef.current = Date.now();
    setIsTracking(true);
    showToast("Focus session started", "success");
  };

  const handleStop = async () => {
    if (!startTimeRef.current) return;

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 1) {
      setIsTracking(false);
      setElapsedSeconds(0);
      showToast("Session too short (minimum 1 minute)", "warning");
      return;
    }

    setIsTracking(false);

    try {
      const res = await fetch("/api/focus-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          minutes: elapsedMinutes,
          projectId: projectId || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save focus session");
      }

      showToast(`Focus session saved: ${elapsedMinutes} minutes`, "success");
      setElapsedSeconds(0);
      setLabel("");
      startTimeRef.current = null;
    } catch {
      showToast("Failed to save focus session", "error");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Focus Timer</h3>
        {isTracking && (
          <div className="text-2xl font-bold text-[var(--primary-strong)]">
            {formatTime(elapsedSeconds)}
          </div>
        )}
      </div>

      {!isTracking ? (
        <div className="space-y-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What are you focusing on?"
            className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-2 focus:outline-[var(--primary-strong)]"
          />
          <button
            onClick={handleStart}
            disabled={!label.trim()}
            className="w-full rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[var(--elev-2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Focus Session
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="rounded-md bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-primary)]">
            {label}
          </div>
          <button
            onClick={handleStop}
            className="w-full rounded-md border border-[var(--danger)] bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--danger)]/90"
          >
            Stop & Save
          </button>
        </div>
      )}
    </div>
  );
}
