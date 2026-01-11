"use client";
import React from "react";

export default function QuickCaptureButton() {
  return (
    <button
      aria-label="Open quick capture"
      onClick={() => window.dispatchEvent(new Event("quick-capture:open"))}
      className="btn"
    >
      Quick Capture
    </button>
  );
}
