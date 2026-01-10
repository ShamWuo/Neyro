"use client";

import { useState } from "react";
import { sanitizeMarkdownHtml } from "@/lib/xss-sanitizer";

type HelpSection = {
  id: string;
  title: string;
  content: string;
};

const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `
      <h3>Welcome to Neyro!</h3>
      <p>Neyro is a PARA productivity system that helps you capture, organize, and finish your work.</p>
      
      <h4>Quick Start</h4>
      <ol>
        <li>Capture items to your inbox</li>
        <li>Classify items into Projects, Areas, Resources, or Archive</li>
        <li>Keep projects capped at 7 maximum</li>
        <li>Complete weekly reviews regularly</li>
      </ol>
    `,
  },
  {
    id: "capture",
    title: "Capture",
    content: `
      <h3>Capture Everything</h3>
      <p>Your inbox is the entry point for all items. Use quick capture (Ctrl/Cmd+I) to add items instantly.</p>
      
      <h4>Best Practices</h4>
      <ul>
        <li>Capture immediately, classify later</li>
        <li>Keep inbox items actionable</li>
        <li>Review inbox daily</li>
      </ul>
    `,
  },
  {
    id: "projects",
    title: "Projects",
    content: `
      <h3>Manage Projects</h3>
      <p>Projects have a defined outcome and deadline. Keep your active projects at 7 or fewer.</p>
      
      <h4>Project Rules</h4>
      <ul>
        <li>Maximum 7 active projects</li>
        <li>Each project needs a clear outcome</li>
        <li>Set realistic deadlines</li>
      </ul>
    `,
  },
  {
    id: "areas",
    title: "Areas",
    content: `
      <h3>Maintain Areas</h3>
      <p>Areas are ongoing responsibilities that need to be maintained at a certain standard.</p>
      
      <h4>Area Standards</h4>
      <ul>
        <li>Define clear standards for each area</li>
        <li>Review areas regularly</li>
        <li>Track health scores</li>
      </ul>
    `,
  },
  {
    id: "weekly-review",
    title: "Weekly Review",
    content: `
      <h3>Complete Weekly Reviews</h3>
      <p>The weekly review is the key to keeping your PARA system current and actionable.</p>
      
      <h4>Review Steps</h4>
      <ol>
        <li>Review projects and update status</li>
        <li>Check area health scores</li>
        <li>Archive completed items</li>
        <li>Plan next week's priorities</li>
      </ol>
    `,
  },
];

export function HelpDocumentation() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const section = helpSections.find((s) => s.id === activeSection);

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-[var(--elev-1)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Help & Documentation</h3>
        <nav className="flex flex-wrap gap-2">
          {helpSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                activeSection === section.id
                  ? "border-[var(--primary-strong)] bg-[var(--primary-strong)] text-white"
                  : "border-[var(--border-subtle)] bg-[var(--card)] text-[var(--text-primary)] hover:border-[var(--border-default)]"
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {section && (
        <div
          className="prose prose-sm max-w-none text-sm text-[var(--text-secondary)] [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-[var(--text-primary)] [&>h3]:mt-4 [&>h3]:mb-2 [&>h4]:text-sm [&>h4]:font-semibold [&>h4]:text-[var(--text-primary)] [&>h4]:mt-3 [&>h4]:mb-1 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>li]:mb-1 [&>p]:mb-2"
          dangerouslySetInnerHTML={{ __html: sanitizeMarkdownHtml(section.content) }}
        />
      )}
    </div>
  );
}
