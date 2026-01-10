"use client";

import { useEffect } from "react";

/**
 * Performance monitoring component
 * Tracks page load times, render performance, and user interactions
 */
export function PerformanceMonitor({ enabled = false }: { enabled?: boolean }) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("performance" in window)) {
      return;
    }

    // Track page load performance
    if ("PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "navigation") {
              const navEntry = entry as PerformanceNavigationTiming;
              console.log("Page Load Performance:", {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
              });
            }
          }
        });

        observer.observe({ entryTypes: ["navigation"] });

        return () => observer.disconnect();
      } catch (err) {
        console.error("PerformanceObserver error:", err);
      }
    }

    // Track long tasks
    if ("PerformanceObserver" in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn("Long task detected:", {
                duration: entry.duration,
                name: entry.name,
              });
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ["longtask"] });

        return () => longTaskObserver.disconnect();
      } catch {
        // Long task observer may not be supported in all browsers
      }
    }
  }, [enabled]);

  return null;
}
