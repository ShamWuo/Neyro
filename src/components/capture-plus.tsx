"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const options = [
  {
    label: "Text",
    href: "/inbox?mode=text",
    description: "Type or paste a quick note. AI will classify it into Projects, Areas, Resources, or Archives.",
  },
  {
    label: "Voice",
    href: "/inbox?mode=voice",
    description: "Record a quick note and let AI transcribe + sort it into PARA.",
  },
  {
    label: "Photo/Upload",
    href: "/inbox?mode=photo",
    description: "Snap or upload a photo. AI will extract text and route it to the right PARA bucket.",
  },
  {
    label: "More",
    href: "/assist?mode=capture",
    description: "Capture links, emails, or files. AI will parse and classify automatically.",
  },
];

export function CapturePlus() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-40 md:bottom-10 md:right-10">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-strong)] text-[var(--text-inverse)] shadow-[var(--elev-3)] transition hover:shadow-[var(--elev-4)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          aria-label="Add capture"
        >
          <span className="text-2xl leading-none">+</span>
        </button>

        {open && (
          <div className="absolute bottom-16 right-0 w-80 space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3 shadow-[var(--elev-3)]">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">Capture with AI</div>
            <p className="text-xs text-[var(--text-secondary)]">AI parses each input and files it into Projects, Areas, Resources, or Archives.</p>
            <div className="space-y-2">
              {options.map((opt) => (
                <Link
                  key={opt.label}
                  href={opt.href}
                  className="block rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 transition hover:border-[var(--border-strong)] hover:-translate-y-[1px]"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
                    <span>{opt.label}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">AI sorted</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{opt.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
