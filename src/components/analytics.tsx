"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID || "", {
        page_path: pathname,
      });
    }

    // Track custom events (social shares, etc.)
    const handleShare = (platform: string) => {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "share", {
          method: platform,
          content_type: "page",
          item_id: pathname,
        });
      }
    };

    // Listen for share events (only on client)
    if (typeof window !== "undefined") {
      const shareHandler = ((e: CustomEvent) => {
        handleShare(e.detail.platform);
      }) as EventListener;

      window.addEventListener("share", shareHandler);

      return () => {
        window.removeEventListener("share", shareHandler);
      };
    }
  }, [pathname]);

  return null;
}

