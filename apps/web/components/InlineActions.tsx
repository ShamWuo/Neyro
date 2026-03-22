'use client';

import { Folder, Layers, Database, Archive, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { cn } from '@/lib/utils';

interface InlineActionsProps {
    itemId: string;
    itemType: 'inbox' | 'project' | 'task';
    className?: string;
}

export function InlineActions({ itemId, itemType, className }: InlineActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    // @ts-ignore
    const classifyItem = useNeyroStore((state: any) => state.classifyItem);
    // @ts-ignore
    const deleteInboxItem = useNeyroStore((state: any) => state.deleteInboxItem);
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);

    const handleAction = async (action: string) => {
        if (itemType === 'inbox') {
            switch (action) {
                case 'project':
                    await classifyItem(itemId, 'project');
                    break;
                case 'area':
                    await classifyItem(itemId, 'area');
                    break;
                case 'resource':
                    await classifyItem(itemId, 'resource');
                    break;
                case 'archive':
                    await classifyItem(itemId, 'archive');
                    break;
                case 'delete':
                    await deleteInboxItem(itemId);
                    break;
            }
            await loadData();
        }
        setIsOpen(false);
    };

    if (itemType !== 'inbox') return null;

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
                <MoreVertical className="size-4 text-neutral-400" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 bg-[#1C1C1E] border border-white/10 rounded-lg p-1 shadow-xl z-50 min-w-[160px]"
                        >
                            <button
                                onClick={() => handleAction('project')}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 text-left text-sm text-white transition-colors"
                            >
                                <Folder className="size-4 text-blue-400" />
                                <span>Move to Project</span>
                            </button>
                            <button
                                onClick={() => handleAction('area')}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 text-left text-sm text-white transition-colors"
                            >
                                <Layers className="size-4 text-purple-400" />
                                <span>Move to Area</span>
                            </button>
                            <button
                                onClick={() => handleAction('resource')}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 text-left text-sm text-white transition-colors"
                            >
                                <Database className="size-4 text-green-400" />
                                <span>Move to Resource</span>
                            </button>
                            <button
                                onClick={() => handleAction('archive')}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 text-left text-sm text-white transition-colors"
                            >
                                <Archive className="size-4 text-neutral-400" />
                                <span>Archive</span>
                            </button>
                            <div className="h-px bg-white/10 my-1" />
                            <button
                                onClick={() => handleAction('delete')}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-500/20 text-left text-sm text-red-400 transition-colors"
                            >
                                <Trash2 className="size-4" />
                                <span>Delete</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
