'use client';

import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, X, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgenticProcessor, ProcessedItem, BatchCluster } from '@/services/agenticProcessor';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { useTodayList } from '@/hooks/useTodayList';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface AgenticProcessorProps {
    items: Array<{ id: string; content: string; createdAt: number }>;
    onComplete: (results?: any) => void;
}

export function AgenticProcessor({ items, onComplete }: AgenticProcessorProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'idle' | 'processing' | 'review' | 'applying'>('idle');
    const [results, setResults] = useState<{
        processedItems: ProcessedItem[];
        batches: BatchCluster[];
        suggestedTodayActions: any[];
    } | null>(null);
    const [approvedItems, setApprovedItems] = useState<Set<string>>(new Set());
    const [approvedBatches, setApprovedBatches] = useState<Set<number>>(new Set());

    // @ts-ignore
    const classifyItem = useNeyroStore((state: any) => state.classifyItem);
    // @ts-ignore
    const addProject = useNeyroStore((state: any) => state.addProject);
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    const { addToToday } = useTodayList();

    const handleProcess = async () => {
        setIsProcessing(true);
        setStep('processing');
        
        try {
            const result = await AgenticProcessor.processInbox(items);
            setResults(result);
            setStep('review');
        } catch (error) {
            console.error('Processing failed:', error);
            setStep('idle');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApply = async () => {
        if (!results) return;
        
        setStep('applying');
        
        try {
            // Apply approved items
            for (const item of results.processedItems) {
                if (approvedItems.has(item.id)) {
                    await classifyItem(item.id, item.suggestedDestination, item.suggestedTargetId);
                }
            }

            // Apply approved batches
            for (let i = 0; i < results.batches.length; i++) {
                if (approvedBatches.has(i)) {
                    const batch = results.batches[i];
                    if (batch.suggestedAction === 'create_project' && batch.projectTitle) {
                        await addProject(batch.projectTitle, batch.projectDescription);
                    }
                }
            }

            // Add suggested today actions to Today list
            if (results.suggestedTodayActions) {
                for (const action of results.suggestedTodayActions) {
                    const item = results.processedItems.find((p: ProcessedItem) => p.id === action.itemId);
                    if (item) {
                        addToToday({
                            id: `today_${action.itemId}_${Date.now()}`,
                            title: action.title || item.title,
                            priority: action.priority,
                            timeEstimate: action.timeEstimate || item.timeEstimate || 30,
                            energyLevel: action.energyLevel || item.energyLevel || 'medium',
                            sourceType: 'inbox',
                            sourceId: action.itemId,
                            dueDate: item.dueDate,
                            tags: item.tags,
                        });
                    }
                }
            }

            await loadData();
            onComplete(results);
        } catch (error) {
            console.error('Apply failed:', error);
        }
    };

    if (step === 'idle') {
        return (
            <Button
                onClick={handleProcess}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3"
            >
                <Sparkles className="size-5 mr-2" />
                Auto Process with AI
            </Button>
        );
    }

    if (step === 'processing') {
        return (
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="size-6 text-primary animate-spin" />
                    <div>
                        <h3 className="text-lg font-bold text-white">AI is analyzing your inbox...</h3>
                        <p className="text-sm text-neutral-400">Clustering items, suggesting actions, and planning your day</p>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'review' && results) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Review AI Suggestions</h3>
                    <Button
                        onClick={handleApply}
                        disabled={approvedItems.size === 0 && approvedBatches.size === 0}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        Apply {approvedItems.size + approvedBatches.size} Changes
                    </Button>
                </div>

                {/* Batches */}
                {results.batches.length > 0 && (
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Batched Items</h4>
                        <div className="space-y-3">
                            {results.batches.map((batch, i) => (
                                <BatchCard
                                    key={i}
                                    batch={batch}
                                    items={items}
                                    isApproved={approvedBatches.has(i)}
                                    onToggle={() => {
                                        const newSet = new Set(approvedBatches);
                                        if (newSet.has(i)) {
                                            newSet.delete(i);
                                        } else {
                                            newSet.add(i);
                                        }
                                        setApprovedBatches(newSet);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Processed Items */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Individual Items</h4>
                    <div className="space-y-3">
                        {results.processedItems.map((item) => (
                            <ProcessedItemCard
                                key={item.id}
                                item={item}
                                isApproved={approvedItems.has(item.id)}
                                onToggle={() => {
                                    const newSet = new Set(approvedItems);
                                    if (newSet.has(item.id)) {
                                        newSet.delete(item.id);
                                    } else {
                                        newSet.add(item.id);
                                    }
                                    setApprovedItems(newSet);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'applying') {
        return (
            <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="size-6 text-primary animate-spin" />
                    <div>
                        <h3 className="text-lg font-bold text-white">Applying changes...</h3>
                        <p className="text-sm text-neutral-400">Updating your system</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

function BatchCard({ batch, items, isApproved, onToggle }: {
    batch: BatchCluster;
    items: Array<{ id: string; content: string }>;
    isApproved: boolean;
    onToggle: () => void;
}) {
    const batchItems = items.filter(item => batch.items.includes(item.id));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-[#1C1C1E] border-2 rounded-xl p-4 cursor-pointer transition-all",
                isApproved ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20"
            )}
            onClick={onToggle}
        >
            <div className="flex items-start gap-3">
                <div className={cn(
                    "size-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5",
                    isApproved ? "bg-primary border-primary" : "border-white/30"
                )}>
                    {isApproved && <CheckCircle2 className="size-4 text-white" />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-primary uppercase">
                            {batch.suggestedAction === 'create_project' ? 'Create Project' : 
                             batch.suggestedAction === 'create_area' ? 'Create Area' : 
                             batch.suggestedAction === 'create_resource' ? 'Create Resource' : 
                             'Separate'}
                        </span>
                        <span className="text-xs text-neutral-500">
                            {batch.items.length} items • {Math.round(batch.confidence * 100)}% confidence
                        </span>
                    </div>
                    {batch.projectTitle && (
                        <h4 className="text-white font-semibold mb-1">{batch.projectTitle}</h4>
                    )}
                    {batch.projectDescription && (
                        <p className="text-neutral-400 text-sm mb-3">{batch.projectDescription}</p>
                    )}
                    {batch.tasks && batch.tasks.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-3 mb-2">
                            <p className="text-xs text-neutral-500 mb-2">Tasks:</p>
                            {batch.tasks.map((task, i) => (
                                <div key={i} className="text-sm text-neutral-300 flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-primary" />
                                    {task.title}
                                    {task.timeEstimate && (
                                        <span className="text-xs text-neutral-500">({task.timeEstimate}m)</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-xs text-neutral-500 mt-2">
                        <p className="mb-1">Items:</p>
                        {batchItems.map(item => (
                            <div key={item.id} className="text-neutral-400 ml-2">• {item.content.substring(0, 60)}...</div>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 italic">{batch.reasoning}</p>
                </div>
            </div>
        </motion.div>
    );
}

function ProcessedItemCard({ item, isApproved, onToggle }: {
    item: ProcessedItem;
    isApproved: boolean;
    onToggle: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-[#1C1C1E] border-2 rounded-xl p-4 cursor-pointer transition-all",
                isApproved ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20"
            )}
            onClick={onToggle}
        >
            <div className="flex items-start gap-3">
                <div className={cn(
                    "size-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5",
                    isApproved ? "bg-primary border-primary" : "border-white/30"
                )}>
                    {isApproved && <CheckCircle2 className="size-4 text-white" />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-neutral-400">
                            → {item.suggestedDestination}
                        </span>
                        {item.suggestedTargetName && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                                {item.suggestedTargetName}
                            </span>
                        )}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/5 text-neutral-500">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    {item.description && (
                        <p className="text-neutral-400 text-sm mb-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                        {item.dueDate && (
                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                        )}
                        {item.timeEstimate && (
                            <span>⏱ {item.timeEstimate}m</span>
                        )}
                        {item.energyLevel && (
                            <span className="capitalize">⚡ {item.energyLevel}</span>
                        )}
                        <span>{Math.round(item.confidence * 100)}% confidence</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 italic">{item.reasoning}</p>
                </div>
            </div>
        </motion.div>
    );
}
