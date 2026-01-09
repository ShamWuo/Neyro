"use client";

import { useEffect } from "react";
import { initNativeFeatures, isNative } from "@/lib/capacitor";

export function NativeInit() {
  useEffect(() => {
    if (isNative) {
      initNativeFeatures().catch((error) => {
        // Silently fail - native features are optional
        logger.error("Error initializing native features", error instanceof Error ? error : new Error(String(error)));
      });
    }
  }, []);

  return null;
}

