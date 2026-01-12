"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "./ui/toast";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";

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

export const KanbanBoard = memo(function KanbanBoard({ columns: initialColumns, projectId: _projectId }: KanbanBoardProps) {
  void _projectId;
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  // Sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
    const sourceColumn = columns.find((col) => col.items.some((item) => item.id === activeId));
    let destColumn = columns.find((col) => col.id === overId);

    // If dropped over an item, find that item's column
    if (!destColumn) {
      destColumn = columns.find((col) => col.items.some((item) => item.id === overId));
    }

    if (!sourceColumn || !destColumn || sourceColumn === destColumn) return;

    // Optimistic Update
    const item = sourceColumn.items.find((i) => i.id === activeId);
    if (!item) return;

    const newColumns = columns.map((col) => {
      if (col.id === sourceColumn.id) {
        return { ...col, items: col.items.filter((i) => i.id !== activeId) };
      }
      if (col.id === destColumn!.id) {
        // Determine new status/due date
        const isDone = col.id === "done";
        const dueDate = col.id === "due"
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : null;

        return {
          ...col,
          items: [...col.items, { ...item, isDone, dueDate: dueDate ? new Date(dueDate) : null }]
        };
      }
      return col;
    });

    setColumns(newColumns);

    // API Call
    try {
      const isDone = destColumn.id === "done";
      const dueDate = destColumn.id === "due"
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : null;

      const response = await fetch(`/api/items/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone, dueDate }),
      });

      if (!response.ok) throw new Error("Failed to update");
      showToast("Item moved", "success");
      router.refresh();
    } catch {
      showToast("Failed to move item", "error");
      setColumns(initialColumns); // Revert on error
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="p-3 bg-[var(--card)] border border-[var(--primary)] rounded shadow-lg opacity-80 cursor-grabbing">
            <span className="font-medium">Moving item...</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});

function KanbanColumn({ column }: { column: KanbanColumn }) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-72 flex flex-col rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex justify-between">
        {column.title}
        <span className="text-[var(--text-tertiary)] bg-[var(--surface-muted)] px-2 rounded-full text-xs py-0.5">
          {column.items.length}
        </span>
      </h3>
      <div className="flex-1 space-y-2 min-h-[100px]">
        <SortableContext items={column.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {column.items.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </SortableContext>
        {column.items.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-[var(--text-tertiary)] border-2 border-dashed border-[var(--border-subtle)] rounded-lg m-1 opacity-50">
            Empty
          </div>
        )}
      </div>
    </div>
  );
}

function SortableItem({ item }: { item: KanbanItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <motion.div
      layoutId={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 rounded border border-[var(--border-subtle)] bg-[var(--surface-muted)] cursor-grab hover:border-[var(--primary-strong)] hover:shadow-sm transition-all group bg-white dark:bg-zinc-900"
    >
      <div className="font-medium text-sm text-[var(--text-primary)] mb-1">{item.title}</div>
      {item.details && <div className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-1">{item.details}</div>}
      {item.dueDate && (
        <div className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-tertiary)] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
          Due: {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      )}
    </motion.div>
  );
}

