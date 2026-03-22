'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle, List, TrendingUp, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

interface InboxItemProps {
    item: any;
    onToggle?: () => void;
    onUpdate?: (updates: any) => void;
    onDelete?: () => void;
}

export function InboxTodoItem({ item, onToggle, onUpdate, onDelete }: InboxItemProps) {
    const priorityColors = {
        low: 'border-[var(--border-subtle)]',
        medium: 'border-[var(--border-strong)]',
        high: 'border-[var(--color-primary)]',
        urgent: 'border-red-500 bg-red-50',
    };

    return (
        <div className={cn(
            "bg-white border-2 rounded-xl p-4 transition-all shadow-sm",
            item.isCompleted ? "opacity-60 border-[var(--border-subtle)]" : priorityColors[item.priority || 'medium'],
            item.dueDate && new Date(item.dueDate) < new Date() && !item.isCompleted && "ring-2 ring-red-500/30"
        )}>
            <div className="flex items-start gap-3">
                <button
                    onClick={onToggle}
                    className={cn(
                        "size-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        item.isCompleted 
                            ? "bg-[var(--color-primary)] border-[var(--color-primary)]" 
                            : "border-[var(--border-subtle)] hover:border-[var(--color-primary)]"
                    )}
                >
                    {item.isCompleted && <CheckCircle2 className="size-4 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                            "text-[var(--text-primary)] font-medium",
                            item.isCompleted && "line-through text-[var(--text-secondary)]"
                        )}>
                            {item.content}
                        </p>
                        {item.priority === 'urgent' && (
                            <AlertCircle className="size-4 text-red-600 shrink-0" />
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                        {item.dueDate && (
                            <span className={cn(
                                "flex items-center gap-1",
                                new Date(item.dueDate) < new Date() && !item.isCompleted && "text-red-600"
                            )}>
                                <Clock className="size-3" />
                                {new Date(item.dueDate).toLocaleDateString()}
                                {item.dueTime && ` ${item.dueTime}`}
                            </span>
                        )}
                        {item.projectId && (
                            <span className="px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px]">
                                Project
                            </span>
                        )}
                        {item.areaId && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px]">
                                Area
                            </span>
                        )}
                    </div>
                </div>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1 rounded hover:bg-[var(--border-subtle)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export function InboxChecklistItem({ item, onUpdate, onDelete }: InboxItemProps) {
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
        item.checklistItems ? JSON.parse(item.checklistItems) : []
    );

    const handleToggleItem = (itemId: string) => {
        const updated = checklistItems.map(i => 
            i.id === itemId ? { ...i, completed: !i.completed } : i
        );
        setChecklistItems(updated);
        onUpdate?.({ checklistItems: JSON.stringify(updated) });
    };

    const completedCount = checklistItems.filter(i => i.completed).length;
    const totalCount = checklistItems.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="bg-white border-2 border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <List className="size-4 text-[var(--color-primary)]" />
                    <p className="text-[var(--text-primary)] font-medium">{item.content}</p>
                </div>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1 rounded hover:bg-[var(--border-subtle)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
            
            <div className="space-y-2 mb-3">
                {checklistItems.map((checkItem) => (
                    <button
                        key={checkItem.id}
                        onClick={() => handleToggleItem(checkItem.id)}
                        className="w-full flex items-center gap-2 text-left p-2 rounded hover:bg-[var(--border-subtle)]/20 transition-colors"
                    >
                        {checkItem.completed ? (
                            <CheckCircle2 className="size-4 text-[var(--color-primary)] shrink-0" />
                        ) : (
                            <Circle className="size-4 text-[var(--text-tertiary)] shrink-0" />
                        )}
                        <span className={cn(
                            "text-sm text-[var(--text-primary)] flex-1",
                            checkItem.completed && "line-through text-[var(--text-secondary)]"
                        )}>
                            {checkItem.text}
                        </span>
                    </button>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[var(--color-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <span className="text-xs text-[var(--text-secondary)] min-w-[80px] text-right">
                    {completedCount}/{totalCount} ({Math.round(progress)}%)
                </span>
            </div>
        </div>
    );
}

export function InboxProgressItem({ item, onUpdate, onDelete }: InboxItemProps) {
    const progress = item.progress || 0;
    const target = item.progressTarget || 100;

    const handleProgressChange = (newProgress: number) => {
        const clamped = Math.max(0, Math.min(100, newProgress));
        onUpdate?.({ progress: clamped });
    };

    return (
        <div className="bg-white border-2 border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-[var(--color-primary)]" />
                    <p className="text-[var(--text-primary)] font-medium">{item.content}</p>
                </div>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1 rounded hover:bg-[var(--border-subtle)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Progress</span>
                    <span className="text-[var(--text-primary)] font-semibold">{progress}%</span>
                </div>
                <div className="h-3 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-[var(--color-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                {target && target !== 100 && (
                    <p className="text-xs text-[var(--text-secondary)] text-right">Target: {target}</p>
                )}
                <div className="flex gap-2 mt-2">
                    <Button
                        onClick={() => handleProgressChange(progress - 10)}
                        variant="ghost"
                        className="flex-1 text-xs"
                        disabled={progress <= 0}
                    >
                        -10%
                    </Button>
                    <Button
                        onClick={() => handleProgressChange(progress + 10)}
                        variant="ghost"
                        className="flex-1 text-xs"
                        disabled={progress >= 100}
                    >
                        +10%
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function InboxReminderItem({ item, onToggle, onUpdate, onDelete }: InboxItemProps) {
    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.isCompleted;
    const isToday = item.dueDate && new Date(item.dueDate).toDateString() === new Date().toDateString();

    return (
        <div className={cn(
            "bg-white border-2 rounded-xl p-4 transition-all shadow-sm",
            isOverdue && "ring-2 ring-red-500/30 border-red-500",
            isToday && !isOverdue && "border-yellow-500 bg-yellow-50"
        )}>
            <div className="flex items-start gap-3">
                <button
                    onClick={onToggle}
                    className={cn(
                        "size-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        item.isCompleted 
                            ? "bg-[var(--color-primary)] border-[var(--color-primary)]" 
                            : "border-[var(--border-subtle)] hover:border-[var(--color-primary)]"
                    )}
                >
                    {item.isCompleted && <CheckCircle2 className="size-4 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className={cn(
                            "size-4 shrink-0",
                            isOverdue ? "text-red-600" : isToday ? "text-yellow-600" : "text-[var(--text-secondary)]"
                        )} />
                        <p className={cn(
                            "text-[var(--text-primary)] font-medium",
                            item.isCompleted && "line-through text-[var(--text-secondary)]"
                        )}>
                            {item.content}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] ml-6">
                        {item.dueDate && (
                            <span className={cn(
                                isOverdue && "text-red-600 font-semibold",
                                isToday && !isOverdue && "text-yellow-600"
                            )}>
                                {new Date(item.dueDate).toLocaleDateString()}
                                {item.dueTime && ` at ${item.dueTime}`}
                            </span>
                        )}
                    </div>
                </div>
                {onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-1 rounded hover:bg-[var(--border-subtle)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
