'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, Folder, Activity } from 'lucide-react';
import { useDemoStore } from '@/store/demo-store';
import { cn } from '@/lib/utils';
import React from 'react';

const STEPS = [
    { id: 'welcome', title: 'Welcome to Neyro', icon: Sparkles },
    { id: 'projects', title: 'Your Current Projects', icon: Folder },
    { id: 'areas', title: 'Areas of Focus', icon: Activity },
    { id: 'complete', title: 'System Ready', icon: Check }
];

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [projectsInput, setProjectsInput] = useState<string[]>(['', '', '']);
    const [areasInput, setAreasInput] = useState<string[]>(['', '', '']);

    // In a real app, this would dispatch to the store
    const { setMomentumScore } = useDemoStore();

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(prev => prev + 1);
        } else {
            // Finish onboarding
            setMomentumScore(100);
            window.location.href = '/dashboard';
        }
    };

    const handlePrev = () => {
        if (step > 0) setStep(prev => prev - 1);
    };

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center p-6 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Header/Progress */}
            <div className="absolute top-12 left-0 right-0 max-w-2xl mx-auto px-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2 font-display font-bold text-brand tracking-tight">
                    <Compass className="text-accent" size={24} /> Neyro Setup
                </div>
                <div className="flex gap-2">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className={cn(
                            "w-12 h-1.5 rounded-full transition-all duration-500",
                            i === step ? "bg-accent" : i < step ? "bg-accent/40" : "bg-border"
                        )} />
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="w-full max-w-lg z-10">
                <AnimatePresence mode="wait">

                    {step === 0 && (
                        <motion.div
                            key="step-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white border border-border p-10 rounded-[32px] shadow-xl text-center relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-[30px]" />
                            <div className="w-20 h-20 bg-bg-primary border border-border rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 shadow-sm">
                                <Sparkles size={32} className="text-accent" />
                            </div>
                            <h1 className="text-3xl font-display font-bold text-brand mb-4 relative z-10">Welcome to Neyro</h1>
                            <p className="text-text-secondary leading-relaxed mb-8 relative z-10 text-lg">
                                Your life is about to become an action-ready system. We just need to know a few things to calibrate your dashboard.
                            </p>
                            <button
                                onClick={handleNext}
                                className="w-full py-4 bg-brand text-white rounded-button font-bold text-lg hover:bg-brand/90 transition-all shadow-md active:scale-[0.98]"
                            >
                                Let&apos;s get started
                            </button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h1 className="text-3xl font-display font-bold text-brand mb-3">What are your top 3 current projects?</h1>
                                <p className="text-text-secondary text-lg">Things with a clear finish line that you are actively working towards.</p>
                            </div>

                            <div className="space-y-4">
                                {[0, 1, 2].map(i => (
                                    <input
                                        key={i}
                                        type="text"
                                        placeholder={`Project ${i + 1} (e.g. &quot;Launch new website&quot;)`}
                                        value={projectsInput[i]}
                                        onChange={e => {
                                            const newArr = [...projectsInput];
                                            newArr[i] = e.target.value;
                                            setProjectsInput(newArr);
                                        }}
                                        className="w-full bg-white border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-[16px] p-5 text-brand text-lg transition-all shadow-sm placeholder:text-text-muted/70"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h1 className="text-3xl font-display font-bold text-brand mb-3">What areas do you want to maintain?</h1>
                                <p className="text-text-secondary text-lg">Ongoing responsibilities or standards (e.g., Health, Career, Finances).</p>
                            </div>

                            <div className="space-y-4">
                                {[0, 1, 2].map(i => (
                                    <input
                                        key={i}
                                        type="text"
                                        placeholder={`Area ${i + 1} (e.g. &quot;Physical Health&quot;)`}
                                        value={areasInput[i]}
                                        onChange={e => {
                                            const newArr = [...areasInput];
                                            newArr[i] = e.target.value;
                                            setAreasInput(newArr);
                                        }}
                                        className="w-full bg-white border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 rounded-[16px] p-5 text-brand text-lg transition-all shadow-sm placeholder:text-text-muted/70"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-brand text-white p-10 rounded-[32px] shadow-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/40 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />

                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-24 h-24 bg-[#00D4AA]/20 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10"
                            >
                                <Check size={40} className="text-[#00D4AA]" />
                            </motion.div>

                            <h1 className="text-3xl font-display font-bold mb-4 relative z-10">System Initialized</h1>
                            <p className="text-white/80 leading-relaxed mb-10 relative z-10 text-lg">
                                Your initial projects and areas have been seeded. The AI is ready to help you capture, organize, and act.
                            </p>

                            <button
                                onClick={handleNext}
                                className="w-full py-4 bg-white text-brand rounded-button font-bold text-lg hover:bg-white/90 transition-all shadow-[0_8px_30px_rgba(255,255,255,0.2)] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                Enter Dashboard <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Navigation Controls (Only for steps 1 & 2) */}
            <AnimatePresence>
                {step > 0 && step < STEPS.length - 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-12 left-0 right-0 max-w-lg mx-auto px-6 flex justify-between z-10"
                    >
                        <button
                            onClick={handlePrev}
                            className="flex items-center gap-2 px-6 py-3 rounded-button font-semibold text-text-secondary bg-white border border-border hover:bg-bg-subtle transition-colors shadow-sm"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-8 py-3 rounded-button font-bold text-white bg-accent hover:opacity-90 transition-all shadow-[0_4px_14px_rgba(108,99,255,0.4)] hover:shadow-[0_6px_20px_rgba(108,99,255,0.6)]"
                        >
                            Continue <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
