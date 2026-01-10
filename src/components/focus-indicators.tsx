"use client";

import { useEffect } from "react";

/**
 * Enhanced focus indicators for better keyboard navigation
 */
export function FocusIndicators() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Enhanced focus indicators for keyboard navigation */
      *:focus-visible {
        outline: 2px solid var(--primary-strong);
        outline-offset: 2px;
        border-radius: 4px;
      }

      /* Remove default focus for mouse users */
      *:focus:not(:focus-visible) {
        outline: none;
      }

      /* Enhanced focus for interactive elements */
      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible,
      [role="button"]:focus-visible,
      [role="link"]:focus-visible,
      [tabindex]:focus-visible {
        outline: 2px solid var(--primary-strong);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px rgba(var(--primary-strong-rgb), 0.2);
      }

      /* Focus indicators for custom components */
      [data-focus-visible] {
        outline: 2px solid var(--primary-strong);
        outline-offset: 2px;
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        *:focus-visible {
          outline: 3px solid;
          outline-offset: 3px;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        *:focus-visible {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
