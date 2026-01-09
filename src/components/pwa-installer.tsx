"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { logger } from "@/lib/logger";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PWAInstaller = memo(function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          logger.log("Service Worker registered", { scope: registration.scope });
        })
        .catch((error) => {
          logger.error("Service Worker registration failed", error);
        });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 rounded-lg border border-[var(--primary-strong)] bg-[var(--surface)] p-4 shadow-lg md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Install Neyro</p>
          <p className="text-xs text-[var(--text-secondary)]">Add to home screen for quick access</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="rounded-md px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-3 py-2 text-xs font-semibold text-[var(--text-inverse)]"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
});

