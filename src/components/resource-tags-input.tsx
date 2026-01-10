"use client";

import { useState, KeyboardEvent } from "react";

type ResourceTagsInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
};

export function ResourceTagsInput({
  tags,
  onChange,
  placeholder = "Add tags...",
  maxTags = 10,
}: ResourceTagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() && tags.length < maxTags) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-3 py-2 min-h-[42px] items-center">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--primary-strong)] bg-[var(--primary-weak)] px-2 py-1 text-xs font-medium text-[var(--primary-strong)]"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--primary-strong)] transition-colors"
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      {tags.length < maxTags && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
        />
      )}
      {tags.length >= maxTags && (
        <span className="text-xs text-[var(--text-tertiary)]">Maximum tags reached</span>
      )}
    </div>
  );
}
