"use client";

import { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { Badge } from "./ui/badge";

type Tag = {
  id: string;
  name: string;
  color?: string | null;
};

type TagInputProps = {
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag?: (name: string) => Promise<Tag | null>;
  placeholder?: string;
};

export const TagInput = memo(function TagInput({
  tags,
  selectedTagIds,
  onTagsChange,
  onCreateTag,
  placeholder = "Add tags...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTags = useMemo(() => tags.filter((t) => t && t.id && selectedTagIds.includes(t.id)), [tags, selectedTagIds]);
  const availableTags = useMemo(() => tags.filter((t) => t && t.id && !selectedTagIds.includes(t.id)), [tags, selectedTagIds]);

  useEffect(() => {
    // Use setTimeout to defer state updates and avoid synchronous setState in effect
    const timer = setTimeout(() => {
      if (inputValue.trim()) {
        const filtered = availableTags.filter((tag) =>
          tag.name && tag.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredTags(filtered);
        setIsOpen(true);
      } else {
        setFilteredTags(availableTags.slice(0, 5));
        setIsOpen(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [inputValue, availableTags]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTag = useCallback((tagId: string) => {
    onTagsChange([...selectedTagIds, tagId]);
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  }, [selectedTagIds, onTagsChange]);

  const handleRemoveTag = useCallback((tagId: string) => {
    onTagsChange(selectedTagIds.filter((id) => id !== tagId));
  }, [selectedTagIds, onTagsChange]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (!trimmedValue) return;
      
      // Try to find existing tag
      const existingTag = tags.find(
        (t) => t.name && t.name.toLowerCase() === trimmedValue.toLowerCase()
      );
      if (existingTag) {
        handleAddTag(existingTag.id);
      } else if (onCreateTag) {
        // Create new tag
        const newTag = await onCreateTag(trimmedValue);
        if (newTag && newTag.id) {
          handleAddTag(newTag.id);
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && selectedTagIds.length > 0) {
      handleRemoveTag(selectedTagIds[selectedTagIds.length - 1]);
    }
  };

  const getTagColor = (tag: Tag) => {
    if (tag.color) return tag.color;
    // Generate a color based on tag name
    const colors = [
      "var(--primary-strong)",
      "var(--accent)",
      "var(--success)",
      "var(--warning)",
      "#8b5cf6",
      "#ec4899",
    ];
    const index = (tag.name?.charCodeAt(0) || 0) % colors.length;
    return colors[index] || colors[0];
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-2 min-h-[40px] border border-[var(--border-subtle)] bg-[var(--surface)] rounded-md px-2 py-1 items-center">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="default"
            className="text-xs cursor-pointer hover:opacity-70 transition-opacity"
            style={{ backgroundColor: getTagColor(tag) + "20", borderColor: getTagColor(tag) }}
            onClick={() => handleRemoveTag(tag.id)}
          >
            {tag.name} ×
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          role="combobox"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTagIds.length === 0 ? placeholder : ""}
          aria-label="Add tags"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="tag-suggestions"
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        />
      </div>

      {isOpen && (filteredTags.length > 0 || (inputValue.trim() && onCreateTag)) && (
        <div 
          id="tag-suggestions"
          role="listbox"
          aria-label="Tag suggestions"
          className="absolute z-50 w-full mt-1 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-[var(--elev-2)] max-h-48 overflow-y-auto"
        >
          {filteredTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleAddTag(tag.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--surface-muted)] transition-colors flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getTagColor(tag) }}
              />
              <span>{tag.name}</span>
            </button>
          ))}
          {inputValue.trim() &&
            !tags.find((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()) &&
            onCreateTag && (
              <button
                type="button"
                onClick={async () => {
                  const newTag = await onCreateTag(inputValue.trim());
                  if (newTag) handleAddTag(newTag.id);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--surface-muted)] transition-colors flex items-center gap-2 text-[var(--primary-strong)]"
              >
                <span>+</span>
                <span>Create &quot;{inputValue.trim()}&quot;</span>
              </button>
            )}
        </div>
      )}
    </div>
  );
});

