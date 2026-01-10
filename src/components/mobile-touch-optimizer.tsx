"use client";

import { useEffect } from "react";

/**
 * Mobile touch optimization utilities
 */
export function MobileTouchOptimizer() {
  useEffect(() => {
    // Ensure touch targets are at least 44x44px
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 768px) {
        button:not(.icon-only),
        a:not(.icon-only),
        input[type="button"],
        input[type="submit"],
        [role="button"]:not(.icon-only) {
          min-height: 44px;
          min-width: 44px;
        }

        /* Improve tap highlighting */
        button, a, [role="button"] {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        }

        /* Prevent text selection on tap */
        button, a, [role="button"] {
          -webkit-user-select: none;
          user-select: none;
        }

        /* Improve scrolling on mobile */
        * {
          -webkit-overflow-scrolling: touch;
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
