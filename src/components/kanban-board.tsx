"use client";

import { useState, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "./ui/toast";

type KanbanItem = {
  id: string;
  title: string;
  details: string | null;
  dueDate: Date | null;
  isDone: boolean;
};

type KanbanColumn = {
  id: string;
  title: string;
  items: KanbanItem[];
};

type KanbanBoardProps = {
  columns: KanbanColumn[];
  projectId: string;
};

// projectId is reserved for future API calls to update items by project
export const KanbanBoard = memo(function KanbanBoard({ columns: initialColumns, projectId: _projectId }: KanbanBoardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void _projectId; // Reserved for future use
  const [columns, setColumns] = useState(initialColumns);
  const [draggedItem, setDraggedItem] = useState<{ itemId: string; columnId: string } | null>(null);
  const router = useRouter();

  const handleDragStart = useCallback((itemId: string, columnId: string) => {
    setDraggedItem({ itemId, columnId });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = async (targetColumnId: string) => {
    if (!draggedItem) return;

    const { itemId, columnId: sourceColumnId } = draggedItem;

    if (sourceColumnId === targetColumnId) {
      setDraggedItem(null);
      return;
    }

    // Update item status based on target column
    const isDone = targetColumnId === "done";
    const dueDate = targetColumnId === "due" ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : null;

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone, dueDate }),
      });

      if (!response.ok) throw new Error("Failed to update item");

      // Optimistically update UI
      setColumns((prev) => {
        const newColumns = prev.map((col) => {
          if (col.id === sourceColumnId) {
            return { ...col, items: col.items.filter((i) => i.id !== itemId) };
          }
          if (col.id === targetColumnId) {
            const item = prev.find((c) => c.id === sourceColumnId)?.items.find((i) => i.id === itemId);
            if (item) {
              return { ...col, items: [...col.items, { ...item, isDone, dueDate: dueDate ? new Date(dueDate) : null }] };
            }
          }
          return col;
        });
        return newColumns;
      });

      showToast("Item moved", "success");
      router.refresh();
    } catch {
      showToast("Failed to move item", "error");
    }

    setDraggedItem(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-72 rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            {column.title} ({column.items.length})
          </h3>
          <div 
            className="space-y-2 min-h-[200px]"
            role="region"
            aria-label={`${column.title} column with ${column.items.length} items`}
          >
            {column.items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id, column.id)}
                role="button"
                tabIndex={0}
                aria-label={`${item.title}${item.dueDate ? `, due ${new Date(item.dueDate).toLocaleDateString()}` : ''}`}
                className="rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 cursor-move hover:shadow-sm transition"
              >
                <div className="font-medium text-sm text-[var(--text-primary)]">{item.title}</div>
                {item.details && <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{item.details}</div>}
                {item.dueDate && (
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
            {column.items.length === 0 && (
              <div className="text-xs text-[var(--text-secondary)] text-center py-8" aria-label="Empty column">Drop items here</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

