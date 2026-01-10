"use client";

import { useState } from "react";
import { AreaTemplateSelector } from "./area-template-selector";
import { type AreaTemplate } from "@/lib/area-templates";

type AreaTemplateFormProps = {
  createAreaAction: (formData: FormData) => Promise<void>;
};

export function AreaTemplateForm({ createAreaAction }: AreaTemplateFormProps) {
  const [name, setName] = useState("");
  const [standard, setStandard] = useState("");

  const handleTemplateSelect = (template: AreaTemplate) => {
    setName(template.name);
    setStandard(template.standard);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("standard", standard);
    await createAreaAction(formData);
    setName("");
    setStandard("");
  };

  return (
    <form onSubmit={handleSubmit} className="panel space-y-3">
      <AreaTemplateSelector onSelect={handleTemplateSelect} />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2"
          required
        />
        <textarea
          name="standard"
          value={standard}
          onChange={(e) => setStandard(e.target.value)}
          placeholder="Standard to maintain"
          className="w-full border border-[var(--border-default)] bg-[var(--card)] px-3 py-2 md:col-span-2"
          rows={2}
          required
        />
      </div>
      <button
        type="submit"
        className="rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]"
      >
        Add area
      </button>
    </form>
  );
}

