'use client';

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { ClassifierService } from '@/services/classifierService';
import { useTodayList } from '@/hooks/useTodayList';
import { cn } from '@/lib/utils';

interface ProcessingWizardProps {
    item: { id: string; content: string; createdAt: number };
    onComplete: () => void;
    onCancel: () => void;
}

type WizardStep = 'clarify' | 'categorize' | 'plan' | 'commit';

export function ProcessingWizard({ item, onComplete, onCancel }: ProcessingWizardProps) {
    const [step, setStep] = useState<WizardStep>('clarify');
    const [clarified, setClarified] = useState(item.content);
    const [category, setCategory] = useState<'project' | 'area' | 'resource' | 'archive' | null>(null);
    const [targetId, setTargetId] = useState<string | undefined>();
    const [dueDate, setDueDate] = useState<string>('');
    const [timeEstimate, setTimeEstimate] = useState<number>(30);
    const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
    const [commitment, setCommitment] = useState<'today' | 'this-week' | 'someday' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-ignore
    const areas = useNeyroStore((state: any) => state.areas || []);
    // @ts-ignore
    const classifyItem = useNeyroStore((state: any) => state.classifyItem);
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    const { addToToday } = useTodayList();

    const handleAIEnhance = async () => {
        setIsProcessing(true);
        try {
            const classification = await ClassifierService.classify(clarified, {
                projects: activeProjects,
                areas: areas,
            });
            
            if (classification.destination !== 'archive') {
                setCategory(classification.destination);
                setTargetId(classification.targetId);
            }
        } catch (e) {
            console.error('AI enhancement failed:', e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinish = async () => {
        if (!category) return;
        
        setIsProcessing(true);
        try {
            await classifyItem(item.id, category, targetId);
            
            // Add to Today list if commitment is 'today'
            if (commitment === 'today') {
                addToToday({
                    id: `today_${item.id}_${Date.now()}`,
                    title: clarified,
                    priority: energyLevel === 'high' ? 'high' : energyLevel === 'medium' ? 'medium' : 'low',
                    timeEstimate,
                    energyLevel,
                    sourceType: 'inbox',
                    sourceId: item.id,
                    dueDate: dueDate || undefined,
                    tags: [],
                });
            }
            
            await loadData();
            onComplete();
        } catch (e) {
            console.error('Failed to process:', e);
        } finally {
            setIsProcessing(false);
        }
    };

    const steps: WizardStep[] = ['clarify', 'categorize', 'plan', 'commit'];
    const currentStepIndex = steps.indexOf(step);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Progress */}
                <div className="flex items-center gap-2 mb-6">
                    {steps.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={cn(
                                "size-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                i <= currentStepIndex ? "bg-primary text-white" : "bg-white/10 text-neutral-500"
                            )}>
                                {i < currentStepIndex ? <CheckCircle2 className="size-5" /> : i + 1}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={cn(
                                    "h-1 flex-1 rounded-full transition-all",
                                    i < currentStepIndex ? "bg-primary" : "bg-white/10"
                                )} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {step === 'clarify' && (
                        <motion.div
                            key="clarify"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3 className="text-2xl font-bold text-white mb-2">Clarify</h3>
                            <p className="text-neutral-400 mb-4">Refine and clarify what this item means</p>
                            <textarea
                                value={clarified}
                                onChange={(e) => setClarified(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white min-h-[150px] focus:outline-none focus:border-primary/50"
                                placeholder="What does this really mean?"
                            />
                            <Button
                                onClick={handleAIEnhance}
                                disabled={isProcessing}
                                variant="ghost"
                                className="mt-3"
                            >
                                <Sparkles className="size-4 mr-2" />
                                {isProcessing ? 'AI is thinking...' : 'Enhance with AI'}
                            </Button>
                        </motion.div>
                    )}

                    {step === 'categorize' && (
                        <motion.div
                            key="categorize"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3 className="text-2xl font-bold text-white mb-2">Categorize</h3>
                            <p className="text-neutral-400 mb-4">Where does this belong?</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'project' as const, label: 'Project', icon: '📁', desc: 'Actionable goal' },
                                    { value: 'area' as const, label: 'Area', icon: '📂', desc: 'Ongoing responsibility' },
                                    { value: 'resource' as const, label: 'Resource', icon: '📚', desc: 'Reference material' },
                                    { value: 'archive' as const, label: 'Archive', icon: '🗄️', desc: 'Completed/done' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setCategory(opt.value)}
                                        className={cn(
                                            "p-4 rounded-xl border-2 text-left transition-all",
                                            category === opt.value
                                                ? "border-primary bg-primary/20"
                                                : "border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <div className="text-2xl mb-2">{opt.icon}</div>
                                        <div className="font-semibold text-white">{opt.label}</div>
                                        <div className="text-xs text-neutral-400">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                            {category && category !== 'archive' && (
                                <div className="mt-4">
                                    <p className="text-sm text-neutral-400 mb-2">Select target:</p>
                                    {category === 'project' && (
                                        <select
                                            value={targetId || ''}
                                            onChange={(e) => setTargetId(e.target.value || undefined)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                        >
                                            <option value="">New Project</option>
                                            {activeProjects.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    )}
                                    {category === 'area' && (
                                        <select
                                            value={targetId || ''}
                                            onChange={(e) => setTargetId(e.target.value || undefined)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                        >
                                            <option value="">New Area</option>
                                            {areas.map((a: any) => (
                                                <option key={a.id} value={a.id}>{a.title}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 'plan' && (
                        <motion.div
                            key="plan"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3 className="text-2xl font-bold text-white mb-2">Plan</h3>
                            <p className="text-neutral-400 mb-4">Add details for execution</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Time Estimate (minutes)</label>
                                    <input
                                        type="number"
                                        value={timeEstimate}
                                        onChange={(e) => setTimeEstimate(parseInt(e.target.value) || 30)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                                        min="5"
                                        step="5"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Energy Level</label>
                                    <div className="flex gap-2">
                                        {(['low', 'medium', 'high'] as const).map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setEnergyLevel(level)}
                                                className={cn(
                                                    "flex-1 py-2 rounded-lg border-2 capitalize",
                                                    energyLevel === level
                                                        ? "border-primary bg-primary/20 text-primary"
                                                        : "border-white/10 text-neutral-400"
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'commit' && (
                        <motion.div
                            key="commit"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3 className="text-2xl font-bold text-white mb-2">Commit</h3>
                            <p className="text-neutral-400 mb-4">When will you do this?</p>
                            <div className="space-y-3">
                                {[
                                    { value: 'today' as const, label: 'Today', desc: 'Do this today' },
                                    { value: 'this-week' as const, label: 'This Week', desc: 'Within 7 days' },
                                    { value: 'someday' as const, label: 'Someday', desc: 'No specific timeline' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setCommitment(opt.value)}
                                        className={cn(
                                            "w-full p-4 rounded-xl border-2 text-left transition-all",
                                            commitment === opt.value
                                                ? "border-primary bg-primary/20"
                                                : "border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <div className="font-semibold text-white">{opt.label}</div>
                                        <div className="text-xs text-neutral-400">{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                    <Button
                        onClick={currentStepIndex > 0 ? () => setStep(steps[currentStepIndex - 1]) : onCancel}
                        variant="ghost"
                    >
                        {currentStepIndex > 0 ? (
                            <>
                                <ArrowLeft className="size-4 mr-2" />
                                Back
                            </>
                        ) : (
                            'Cancel'
                        )}
                    </Button>
                    <Button
                        onClick={currentStepIndex < steps.length - 1 
                            ? () => setStep(steps[currentStepIndex + 1])
                            : handleFinish
                        }
                        disabled={isProcessing || (step === 'categorize' && !category) || (step === 'commit' && !commitment)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        {currentStepIndex < steps.length - 1 ? (
                            <>
                                Next
                                <ArrowRight className="size-4 ml-2" />
                            </>
                        ) : (
                            <>
                                {isProcessing ? 'Processing...' : 'Complete'}
                                <CheckCircle2 className="size-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
