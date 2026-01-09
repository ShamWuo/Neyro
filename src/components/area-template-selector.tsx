"use client";

import { useState } from "react";
import { AREA_TEMPLATES, type AreaTemplate } from "@/lib/area-templates";

type AreaTemplateSelectorProps = {
  onSelect: (template: AreaTemplate) => void;
};

export function AreaTemplateSelector({ onSelect }: AreaTemplateSelectorProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setShowTemplates(!showTemplates)}
        className="text-xs text-[var(--text-secondary)] hover:underline"
      >
        {showTemplates ? "Hide templates" : "Use a template"}
      </button>
      {showTemplates && (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {AREA_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                onSelect(template);
                setShowTemplates(false);
              }}
              className="text-left rounded border border-[var(--border-subtle)] bg-[var(--card)] p-3 hover:bg-[var(--surface-muted)] transition"
            >
              <div className="font-semibold text-sm text-[var(--text-primary)]">{template.name}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{template.description}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-2 italic">{template.standard}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

