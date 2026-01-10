"use client";

import { useEffect } from "react";

// Simplified theme provider - always uses light mode
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    
    // Force light theme - run immediately and on any changes
    const forceLightTheme = () => {
      const root = document.documentElement;
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
      // Remove any stored theme preference
      try {
        localStorage.removeItem("theme");
        // Also clear any system preference
        localStorage.setItem("theme", "light");
      } catch {
        // localStorage may be unavailable
      }
    };
    
    // Set immediately
    forceLightTheme();
    
    // Watch for any changes to data-theme and force it back to light
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          const currentTheme = document.documentElement.getAttribute("data-theme");
          if (currentTheme !== "light") {
            forceLightTheme();
          }
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    
    // Also check periodically (in case something else changes it)
    const interval = setInterval(forceLightTheme, 1000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}

// Simplified useTheme hook - always returns light
export function useTheme() {
  return {
    theme: "light" as const,
    setTheme: () => {
      // No-op - theme is always light (parameter ignored intentionally)
    },
    mounted: true,
  };
}
