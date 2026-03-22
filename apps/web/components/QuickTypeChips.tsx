'use client';

import { FileText, Lightbulb, StickyNote, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuickType = 'task' | 'idea' | 'note' | 'reference';

interface QuickTypeChipsProps {
    onSelect: (type: QuickType) => void;
    selected?: QuickType;
}

const typeConfig: Record<QuickType, { label: string; icon: any; color: string; shortcut: string }> = {
    task: { label: 'Task', icon: FileText, color: 'text-blue-400', shortcut: 'T' },
    idea: { label: 'Idea', icon: Lightbulb, color: 'text-yellow-400', shortcut: 'I' },
    note: { label: 'Note', icon: StickyNote, color: 'text-green-400', shortcut: 'N' },
    reference: { label: 'Reference', icon: BookOpen, color: 'text-purple-400', shortcut: 'R' },
};

export function QuickTypeChips({ onSelect, selected }: QuickTypeChipsProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(typeConfig).map(([type, config]) => {
                const Icon = config.icon;
                const isSelected = selected === type;
                return (
                    <button
                        key={type}
                        onClick={() => onSelect(type as QuickType)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                            isSelected
                                ? "bg-white/10 border border-primary/50 text-white"
                                : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <Icon className={cn("size-3.5", isSelected ? config.color : "text-neutral-500")} />
                        <span>{config.label}</span>
                        <kbd className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-mono",
                            isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-neutral-500"
                        )}>
                            {config.shortcut}
                        </kbd>
                    </button>
                );
            })}
        </div>
    );
}
