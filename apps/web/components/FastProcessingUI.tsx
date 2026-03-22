'use client';

import { useState, useEffect } from 'react';
import { Folder, Layers, Database, Archive, Trash2, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { InboxItem } from '@mobile/database/schema';

interface FastProcessingUIProps {
    isOpen: boolean;
    onClose: () => void;
    items: InboxItem[];
}

export function FastProcessingUI({ isOpen, onClose, items }: FastProcessingUIProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [processedCount, setProcessedCount] = useState(0);
    // @ts-ignore
    const classifyItem = useNeyroStore((state: any) => state.classifyItem);
    // @ts-ignore
    const deleteInboxItem = useNeyroStore((state: any) => state.deleteInboxItem);
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);

    const currentItem = items[currentIndex];
    const progress = items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0;

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (!isOpen) {
            setCurrentIndex(0);
            setProcessedCount(0);
        }
    }

    const handleNext = async () => {
        setProcessedCount(prev => prev + 1);
        if (currentIndex < items.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            await loadData();
            onClose();
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyPress = async (e: KeyboardEvent) => {
            if (!currentItem) return;

            const key = e.key.toLowerCase();
            if (key === 'escape') {
                onClose();
                return;
            }

            switch (key) {
                case 'p':
                    await classifyItem(currentItem.id, 'project');
                    await handleNext();
                    break;
                case 'a':
                    await classifyItem(currentItem.id, 'area');
                    await handleNext();
                    break;
                case 'r':
                    await classifyItem(currentItem.id, 'resource');
                    await handleNext();
                    break;
                case 'd':
                    await deleteInboxItem(currentItem.id);
                    await handleNext();
                    break;
                case 'l':
                    await handleNext();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, currentIndex, currentItem, items.length, classifyItem, deleteInboxItem, loadData, onClose]);

    if (!isOpen || items.length === 0 || !currentItem) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 max-w-2xl w-full"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Fast Processing</h3>
                        <p className="text-sm text-neutral-400">
                            {currentIndex + 1} of {items.length} • {processedCount} processed
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="size-5 text-neutral-400" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-8">
                    <motion.div
                        className="bg-primary h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Current Item */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentItem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-8"
                    >
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                                {currentItem.content}
                            </p>
                            <p className="text-xs text-neutral-500 mt-3">
                                {new Date(currentItem.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <ActionButton
                        icon={Folder}
                        label="Project"
                        shortcut="P"
                        onClick={async () => {
                            await classifyItem(currentItem.id, 'project');
                            await handleNext();
                        }}
                        color="blue"
                    />
                    <ActionButton
                        icon={Layers}
                        label="Area"
                        shortcut="A"
                        onClick={async () => {
                            await classifyItem(currentItem.id, 'area');
                            await handleNext();
                        }}
                        color="purple"
                    />
                    <ActionButton
                        icon={Database}
                        label="Resource"
                        shortcut="R"
                        onClick={async () => {
                            await classifyItem(currentItem.id, 'resource');
                            await handleNext();
                        }}
                        color="green"
                    />
                    <ActionButton
                        icon={Trash2}
                        label="Delete"
                        shortcut="D"
                        onClick={async () => {
                            await deleteInboxItem(currentItem.id);
                            await handleNext();
                        }}
                        color="red"
                    />
                    <ActionButton
                        icon={Clock}
                        label="Later"
                        shortcut="L"
                        onClick={handleNext}
                        color="gray"
                    />
                </div>

                {/* Instructions */}
                <p className="text-center text-xs text-neutral-500 mt-6">
                    Press a key or click a button • <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">ESC</kbd> to close
                </p>
            </motion.div>
        </div>
    );
}

function ActionButton({ icon: Icon, label, shortcut, onClick, color }: {
    icon: any;
    label: string;
    shortcut: string;
    onClick: () => void;
    color: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30',
        purple: 'bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30',
        green: 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30',
        red: 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30',
        gray: 'bg-white/10 border-white/20 text-neutral-400 hover:bg-white/20',
    };

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${colorClasses[color as keyof typeof colorClasses]}`}
        >
            <Icon className="size-5" />
            <span className="text-xs font-medium">{label}</span>
            <kbd className="px-2 py-0.5 rounded bg-black/20 text-[10px] font-mono">{shortcut}</kbd>
        </button>
    );
}
