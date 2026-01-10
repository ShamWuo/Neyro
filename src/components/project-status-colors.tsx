"use client";

import { ProjectStatus } from "@prisma/client";

type StatusColorConfig = {
  bg: string;
  border: string;
  text: string;
  badge: string;
};

const statusColors: Record<ProjectStatus, StatusColorConfig> = {
  ACTIVE: {
    bg: "bg-[var(--success-weak)]",
    border: "border-[var(--success)]",
    text: "text-[var(--success)]",
    badge: "bg-[var(--success)]",
  },
  PAUSED: {
    bg: "bg-[var(--warning-weak)]",
    border: "border-[var(--warning)]",
    text: "text-[var(--warning)]",
    badge: "bg-[var(--warning)]",
  },
  COMPLETED: {
    bg: "bg-[var(--info-weak)]",
    border: "border-[var(--info)]",
    text: "text-[var(--info)]",
    badge: "bg-[var(--info)]",
  },
};

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
  className?: string;
};

export function ProjectStatusBadge({ status, className = "" }: ProjectStatusBadgeProps) {
  const colors = statusColors[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${colors.border} ${colors.bg} px-2 py-1 text-xs font-semibold ${colors.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.badge}`} aria-hidden="true" />
      {status}
    </span>
  );
}

export function getProjectStatusColor(status: ProjectStatus): StatusColorConfig {
  return statusColors[status];
}
