'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, CalendarRange, FolderEdit, Activity, Target, ArrowRight, ArrowLeft } from 'lucide-react';
import { useDemoStore } from '@/store/demo-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from '@/components/ui/Button';

const STEPS = [
    { id: 'inbox', title: 'Clear Inbox', icon: Inbox, desc: 'Process all active captures' },
    { id: 'reflection', title: 'Reflect', icon: CalendarRange, desc: 'Review the past 7 days' },
    { id: 'projects', title: 'Projects', icon: FolderEdit, desc: 'Update statuses & tasks' },
    { id: 'areas', title: 'Areas', icon: Activity, desc: 'Assess health & standards' },
    { id: 'planning', title: 'Plan', icon: Target, desc: 'Set intentions for the week' }
];

export default function ReviewPage() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const { captures, projects, areas, setMomentumScore, momentumScore } = useDemoStore();

    const currentStep = STEPS[currentStepIndex];

    const nextStep = () => {
        if (currentStepIndex === STEPS.length - 1) {
            setIsComplete(true);
            setMomentumScore(momentumScore + 50);
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    if (isComplete) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center animate-in fade-in duration-700">
                <div className="text-center max-w-[480px]">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="w-16 h-16 bg-accent-light/10 text-accent rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                        <Target size={32} />
                    </motion.div>

                    <h1 className="text-[40px] font-display font-bold text-primary mb-4 tracking-tight leading-tight">Review Complete</h1>
                    <p className="text-[17px] text-secondary mb-10 leading-relaxed">
                        You&apos;re locked in and ready for the week. You gained <strong className="text-accent font-medium">+50 Momentum</strong>.
                    </p>

                    <Button
                        size="lg"
                        variant="primary"
                        className="w-full text-[15px] h-14"
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[640px] mx-auto h-full flex flex-col pt-12 pb-24 px-8 min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">

            {/* 5-Dot Progress Tracker */}
            <div className="flex items-center justify-center gap-3 mb-16">
                {STEPS.map((step, idx) => {
                    const isActive = idx === currentStepIndex;
                    const isPast = idx < currentStepIndex;
                    return (
                        <div key={step.id} className="flex items-center gap-3">
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                isActive ? "bg-accent scale-125 ring-4 ring-accent-light/20" : isPast ? "bg-accent/40" : "bg-subtle border border-border"
                            )} />
                            {idx < STEPS.length - 1 && (
                                <div className={cn(
                                    "h-[1px] w-6 transition-colors duration-300",
                                    isPast ? "bg-accent/40" : "bg-border/60"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="absolute inset-0 pb-32"
                    >
                        <div className="mb-12">
                            <h2 className="text-[40px] font-display font-medium text-primary tracking-tight leading-tight mb-3">
                                {currentStep.title}
                            </h2>
                            <p className="text-[17px] text-text-muted">{currentStep.desc}</p>
                        </div>

                        {/* Step Details */}
                        <div className="space-y-6">
                            {currentStep.id === 'inbox' && (
                                <div className="space-y-6">
                                    <div className="text-[15px] text-secondary leading-relaxed">
                                        You have <strong className="text-primary font-medium">{captures.length}</strong> items in your inbox. Review them and convert to projects, resources, or archive.
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {captures.slice(0, 4).map(capture => (
                                            <div key={capture.id} className="p-5 border border-border bg-transparent rounded-card group hover:border-accent/30 transition-colors">
                                                <p className="text-primary text-[15px] mb-4 leading-relaxed">&quot;{capture.content}&quot;</p>
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => {
                                                            toast.info(`Converting "${capture.content}" to Project...`);
                                                            // In a real app, this would open the New Project modal with the title pre-filled
                                                        }}
                                                        className="text-[12px] font-semibold text-text-muted hover:text-accent transition-colors"
                                                    >
                                                        Make Project
                                                    </button>
                                                    <span className="text-border">•</span>
                                                    <button 
                                                        onClick={() => {
                                                            toast.info(`Saving "${capture.content}" to Reference Library...`);
                                                        }}
                                                        className="text-[12px] font-semibold text-text-muted hover:text-accent transition-colors"
                                                    >
                                                        Resource
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {captures.length > 4 && (
                                        <div className="text-center text-[13px] text-text-muted mt-4">
                                            + {captures.length - 4} more items...
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep.id === 'reflection' && (
                                <div className="space-y-8">
                                    <textarea
                                        placeholder="What went well this week? What didn't go well? What did you learn?"
                                        className="w-full h-40 bg-transparent border-b border-border/60 p-0 text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-all resize-none text-[17px] leading-relaxed"
                                    />
                                    <div className="bg-accent-light/5 border-l-2 border-accent p-5">
                                        <p className="text-[14px] text-secondary leading-relaxed">
                                            <strong className="text-primary font-semibold block mb-1">Neyro Recap:</strong>
                                            Your energy spiked on Tuesday, perfectly aligning with your Deep Work blocks. However, Friday showed a massive dip in focus.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {currentStep.id === 'projects' && (
                                <div className="space-y-4">
                                    {projects.filter(p => p.status === 'Active' || p.status === 'Stalled').map(p => (
                                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-border bg-transparent rounded-card gap-4 group hover:border-border-strong transition-colors">
                                            <div>
                                                <h4 className="font-semibold text-primary text-[15px] group-hover:text-accent transition-colors">{p.title}</h4>
                                                <p className="text-[13px] text-text-muted mt-1">Progress: {p.progress}% • {p.tasksCount} tasks</p>
                                            </div>
                                            <select className="bg-transparent border border-border/60 rounded px-3 py-1.5 text-[13px] font-medium text-secondary focus:outline-none focus:border-accent/50 cursor-pointer w-full sm:w-auto hover:bg-subtle transition-colors">
                                                <option value="Active">Active</option>
                                                <option value="Stalled">Stalled</option>
                                                <option value="Paused">Paused</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentStep.id === 'areas' && (
                                <div className="space-y-4">
                                    {areas.map(area => (
                                        <div key={area.id} className="p-5 border border-border bg-transparent rounded-card group hover:border-border-strong transition-colors">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-semibold text-primary text-[15px]">{area.name}</h4>
                                                <span className={cn(
                                                    "text-[11px] font-bold px-2 py-0.5 rounded",
                                                    area.score >= 80 ? "bg-teal-light/20 text-teal" : area.score >= 50 ? "bg-amber-light/20 text-amber" : "bg-coral-light/20 text-coral"
                                                )}>{area.score}%</span>
                                            </div>
                                            <p className="text-[14px] text-secondary leading-relaxed mb-4">&quot;{area.insight}&quot;</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentStep.id === 'planning' && (
                                <div className="space-y-8">
                                    <div className="bg-accent-light/5 border-l-2 border-accent p-6">
                                        <h3 className="font-semibold text-primary text-[15px] mb-2">AI Suggested Plan</h3>
                                        <p className="text-[13px] text-text-muted mb-5">Based on your stalled projects and upcoming deadlines.</p>

                                        <ul className="space-y-3">
                                            {[
                                                'Push "Neyro Website Launch" to Active status.',
                                                'Schedule 2 Deep Work blocks for "Freelance Client Proposal".',
                                                'Focus on Health area this weekend.'
                                            ].map((plan, i) => (
                                                <li key={i} className="flex items-start gap-3 text-[14px] text-secondary">
                                                    <span className="text-accent mt-0.5">—</span>
                                                    <span>{plan}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button 
                                        variant="secondary" 
                                        className="w-full h-12 text-[14px] border border-dashed border-border hover:border-solid bg-transparent text-primary"
                                        onClick={() => toast.info("Custom goal feature coming soon!")}
                                    >
                                        Add Custom Goal
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sticky Footer Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-bg-card/95 backdrop-blur-sm border-t border-border py-4 px-6 md:px-12 z-20">
                <div className="max-w-[640px] mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStepIndex === 0}
                        className="text-[14px] h-12 px-6"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Previous
                    </Button>
                    <Button
                        variant="primary"
                        onClick={nextStep}
                        className="text-[14px] h-12 px-8 shadow-sm"
                    >
                        {currentStepIndex === STEPS.length - 1 ? 'Finish Review' : 'Next Step'}
                        <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
