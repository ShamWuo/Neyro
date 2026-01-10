"use client";

import { Tooltip } from "./ui/tooltip";

type HelpTooltipProps = {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
};

export function HelpTooltip({ content, position = "top" }: HelpTooltipProps) {
  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-tertiary)] hover:bg-[var(--card-muted)] hover:text-[var(--text-primary)] transition text-xs font-semibold"
        aria-label="Help"
      >
        ?
      </button>
    </Tooltip>
  );
}
