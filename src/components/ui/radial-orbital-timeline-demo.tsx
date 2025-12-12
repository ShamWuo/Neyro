"use client";

import { Calendar, Clock, Code, FileText, User } from "lucide-react";

import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Capture",
    date: "Step 1",
    content: "Collect every task, note, or reference in one inbox to avoid scattering context.",
    category: "Capture",
    icon: Calendar,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Projects",
    date: "Step 2",
    content: "Limit active projects, keep next actions visible, and prevent scope creep.",
    category: "Projects",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Areas",
    date: "Step 3",
    content: "Maintain responsibilities with standards and health checks so nothing decays.",
    category: "Areas",
    icon: Code,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 70,
  },
  {
    id: 4,
    title: "Resources",
    date: "Step 4",
    content: "Attach references and knowledge to the work so projects stay light.",
    category: "Resources",
    icon: User,
    relatedIds: [3, 5],
    status: "in-progress" as const,
    energy: 55,
  },
  {
    id: 5,
    title: "Review",
    date: "Weekly",
    content: "Close the loop with a weekly review: surface highlights, commitments, and next moves.",
    category: "Review",
    icon: Clock,
    relatedIds: [4],
    status: "pending" as const,
    energy: 40,
  },
];

export function RadialOrbitalTimelineDemo() {
  return <RadialOrbitalTimeline timelineData={timelineData} />;
}

export default RadialOrbitalTimelineDemo;
