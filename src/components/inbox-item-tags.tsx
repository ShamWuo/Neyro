"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TagInput } from "./tag-input";
import { showToast } from "./ui/toast";
import { Badge } from "./ui/badge";

type Tag = {
  id: string;
  name: string;
  color?: string | null;
};

type InboxItemTagsProps = {
  itemId: string;
  initialTags: Tag[];
  allTags: Tag[];
};

export function InboxItemTags({ itemId, initialTags, allTags }: InboxItemTagsProps) {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>(initialTags);

  const handleTagsChange = async (tagIds: string[]) => {
    if (!itemId) return;
    try {
      const res = await fetch(`/api/items/${itemId}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: Array.isArray(tagIds) ? tagIds : [] }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update tags" }));
        throw new Error(error.error || "Failed to update tags");
      }

      const updatedTags = await res.json();
      if (Array.isArray(updatedTags)) {
        setTags(updatedTags);
        showToast("Tags updated", "success");
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update tags";
      showToast(message, "error");
    }
  };

  const handleCreateTag = async (name: string): Promise<Tag | null> => {
    if (!name || !name.trim()) return null;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to create tag" }));
        throw new Error(error.error || "Failed to create tag");
      }

      const newTag = await res.json();
      if (newTag && typeof newTag === "object" && "id" in newTag && "name" in newTag) {
        return newTag as Tag;
      }
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create tag";
      showToast(message, "error");
      return null;
    }
  };

  const getTagColor = (tag: Tag) => {
    if (tag.color) return tag.color;
    const colors = [
      "var(--primary-strong)",
      "var(--accent)",
      "var(--success)",
      "var(--warning)",
      "var(--primary)",
      "var(--info)",
    ];
    const index = (tag.name?.charCodeAt(0) || 0) % colors.length;
    return colors[index] || colors[0];
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="default"
            className="text-xs"
            style={{ backgroundColor: getTagColor(tag) + "20", borderColor: getTagColor(tag) }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      <TagInput
        tags={allTags}
        selectedTagIds={tags.map((t) => t.id)}
        onTagsChange={handleTagsChange}
        onCreateTag={handleCreateTag}
        placeholder="Add tags..."
      />
    </div>
  );
}

