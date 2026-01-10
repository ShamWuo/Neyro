"use client";

import { useEffect } from "react";

/**
 * Support for browser text scaling (accessibility)
 */
export function TextScalingSupport() {
  useEffect(() => {
    // Ensure text scales properly with browser zoom
    const style = document.createElement("style");
    style.textContent = `
      /* Use relative units for text sizing */
      html {
        font-size: 100%;
      }

      body {
        font-size: 1rem;
      }

      /* Ensure containers scale with text */
      .container, main, section {
        max-width: 100%;
      }

      /* Prevent horizontal scroll from scaled text */
      body, html {
        overflow-x: hidden;
      }

      /* Ensure buttons and inputs scale properly */
      button, input, textarea, select {
        font-size: inherit;
      }

      /* Responsive typography that scales with viewport */
      @media (max-width: 768px) {
        html {
          font-size: 16px;
        }
      }

      @media (min-width: 769px) {
        html {
          font-size: clamp(16px, 1vw, 18px);
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
