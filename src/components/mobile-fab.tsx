"use client";

import { useState } from "react";
import { MobileCaptureSheet } from "./mobile-capture-sheet";

export function MobileFAB() {
  const [captureOpen, setCaptureOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setCaptureOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--primary-strong)] bg-[var(--primary-strong)] text-[var(--text-inverse)] shadow-lg transition-transform active:scale-95 md:hidden"
        aria-label="Quick capture"
      >
        <span className="text-2xl">+</span>
      </button>
      <MobileCaptureSheet open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </>
  );
}

