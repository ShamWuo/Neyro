"use client";

import { useEffect, useState } from "react";

export type Toast = {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
};

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notify() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function showToast(message: string, type: Toast["type"] = "success", duration = 3000) {
  if (!message || typeof message !== "string") return "";
  const id = Math.random().toString(36).substring(7);
  const toast: Toast = { id, message: String(message).slice(0, 500), type, duration: Math.max(0, Math.min(duration, 10000)) };
  toasts = [...toasts, toast];
  notify();

  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, duration);
  }

  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function useToast() {
  return {
    toast: (options: { title?: string; description?: string; variant?: "success" | "error" | "info" | "warning" }) => {
      const message = options.description || options.title || "";
      const type = options.variant || "success";
      showToast(message, type);
    },
  };
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setCurrentToasts);
    // Use setTimeout to defer state updates and avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setCurrentToasts([...toasts]);
    }, 0);
    return () => {
      clearTimeout(timer);
      toastListeners = toastListeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite" aria-atomic="true">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-[var(--elev-2)] min-w-[300px] max-w-md animate-in slide-in-from-right-full ${
            toast.type === "error"
              ? "border-[var(--danger)] bg-[var(--surface)] text-[var(--danger)]"
              : toast.type === "warning"
                ? "border-[var(--warning)] bg-[var(--surface)] text-[var(--warning)]"
                : toast.type === "info"
                  ? "border-[var(--primary-strong)] bg-[var(--surface)] text-[var(--primary-strong)]"
                  : "border-[var(--success)] bg-[var(--surface)] text-[var(--success)]"
          }`}
          role="alert"
        >
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

