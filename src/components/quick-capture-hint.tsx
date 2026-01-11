"use client";
import React from "react";

export default function QuickCaptureHint() {
  return (
    <div className="quick-capture-hint" aria-hidden style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>
      Quick capture — <kbd style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.06)' }}>⌘/Ctrl</kbd>+<kbd style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.06)' }}>I</kbd>
    </div>
  );
}
