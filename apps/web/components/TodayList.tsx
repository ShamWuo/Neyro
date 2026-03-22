'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, Zap, X, Plus } from 'lucide-react';
import { useTodayList, TodayAction } from '@/hooks/useTodayList';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export function TodayList() {
    const { todayActions, removeFromToday, clearToday } = useTodayList();
    const [isExpanded, setIsExpanded] = useState(true);

    if (todayActions.length === 0) return null;

    const totalTime = todayActions.reduce((sum, a) => sum + a.timeEstimate, 0);
    const highPriority = todayActions.filter(a => a.priority === 'high').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border border-[#ffdea5] rounded-xl p-4 mb-6 shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#461704]">Today&apos;s Plan</h3>
                    <span className="text-sm text-[#82330c]">
                        {todayActions.length} action{todayActions.length !== 1 ? 's' : ''} • {totalTime}m
                    </span>
                    {highPriority > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-600">
                            {highPriority} high
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={clearToday}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#82330c] hover:text-[#461704]"
                    >
                        Clear
                    </Button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-[#ffdea5]/30 rounded transition-colors"
                    >
                        <X className={cn("size-4 text-[#82330c] transition-transform", isExpanded && "rotate-45")} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 pt-2">
                            {todayActions.map((action) => (
                                <TodayActionItem
                                    key={action.id}
                                    action={action}
                                    onRemove={() => removeFromToday(action.id)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function TodayActionItem({ action, onRemove }: { action: TodayAction; onRemove: () => void }) {
    const priorityColors = {
        high: 'border-red-500/30 bg-red-500/5',
        medium: 'border-[#ffdea5] bg-white/50',
        low: 'border-neutral-200 bg-neutral-50/50',
    };

    const energyIcons = {
        low: '🟢',
        medium: '🟡',
        high: '🔴',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                priorityColors[action.priority]
            )}
        >
            <div className="size-5 rounded border border-[#ffdea5] flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-3 text-[#ffdea5] opacity-0 group-hover:opacity-100" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-[#461704] truncate text-sm">{action.title}</span>
                    <span className="text-[10px]" title={`Energy level: ${action.energyLevel}`}>
                        {energyIcons[action.energyLevel]}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#82330c]">
                    <span className="flex items-center gap-1">
                        <Clock className="size-2.5" />
                        {action.timeEstimate}m
                    </span>
                    {action.dueDate && (
                        <span>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                    )}
                </div>
            </div>
            <button
                onClick={onRemove}
                className="p-1 hover:bg-[#ffdea5]/30 rounded text-[#82330c] hover:text-red-500 transition-colors"
                title="Remove from Today"
            >
                <X className="size-3" />
            </button>
        </motion.div>
    );
}
