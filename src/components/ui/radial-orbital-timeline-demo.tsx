"use client";

import { Clock, Code, FileText, User } from "lucide-react";

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Projects",
    date: "Active Work",
    content:
      "Short-term, outcome-driven commitments with a clear 'done' state. Each project should have a concrete finish line.",
    category: "Projects",
    icon: FileText,
    relatedIds: [2, 3],
    status: "in-progress" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "Areas",
    date: "Ongoing Standards",
    content:
      "Long-term responsibilities you must maintain over time: health, school, finances, product quality, relationships.",
    category: "Areas",
    icon: Code,
    relatedIds: [1, 3],
    status: "in-progress" as const,
    energy: 80,
  },
  {
    id: 3,
    title: "Resources",
    date: "Knowledge Bank",
    content:
      "Reference material organized by topic—notes, links, and ideas you might use to support future projects and areas.",
    category: "Resources",
    icon: User,
    relatedIds: [1, 2, 4],
    status: "completed" as const,
    energy: 70,
  },
  {
    id: 4,
    title: "Archives",
    date: "Inactive",
    content:
      "Completed or abandoned projects, former areas, or old resources. Keeps your workspace lean without losing history.",
    category: "Archives",
    icon: Clock,
    relatedIds: [3],
    status: "pending" as const,
    energy: 40,
  },
];

export function RadialOrbitalTimelineDemo() {
  return <RadialOrbitalTimeline timelineData={timelineData} />;
}

export default RadialOrbitalTimelineDemo;
