'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDemoStore } from '@/store/demo-store';
import { Play, Pause, Square, CheckCircle, BatteryCharging, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

type TimerStatus = 'idle' | 'running' | 'paused';

export default function FocusPage() {
    const { projects, momentumScore, setMomentumScore } = useDemoStore();
    const [status, setStatus] = useState<TimerStatus>('idle');
    const [elapsed, setElapsed] = useState(0);
    const [duration, setDuration] = useState(25); // minutes
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    // Timer logic
    useEffect(() => {
        let interval: number | null = null;
        if (status === 'running') {
            interval = setInterval(() => {
                setElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (!selectedProjectId && projects.length > 0) {
            setSelectedProjectId(projects[0].id);
        }
        setStatus('running');
    };

    const handleComplete = () => {
        const gainedMomentum = Math.floor(elapsed / 60) * 2;
        setMomentumScore(momentumScore + gainedMomentum);
        toast.success(`Session complete! +${gainedMomentum} Momentum`);
        setStatus('idle');
        setElapsed(0);
    };

    const progress = Math.min((elapsed / (duration * 60)) * 100, 100);

    return (
        <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 px-8 py-12">
            
            <div className="max-w-2xl w-full space-y-12">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-[40px] font-display font-medium text-primary tracking-tight">Deep Work</h1>
                    <p className="text-secondary text-[17px]">One thing at a time. No distractions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Left: Project Selector */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Focusing On</label>
                            <div className="space-y-2">
                                {projects.slice(0, 3).map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group",
                                            selectedProjectId === project.id 
                                                ? "bg-accent/10 border-accent/40 text-primary" 
                                                : "bg-card border-border text-secondary hover:border-border-strong"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                selectedProjectId === project.id ? "bg-accent" : "bg-text-muted/30"
                                            )} />
                                            <span className="text-[15px] font-medium">{project.title}</span>
                                        </div>
                                        <ChevronRight size={14} className={cn(
                                            "transition-transform",
                                            selectedProjectId === project.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                                        )} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 bg-subtle border border-border rounded-xl space-y-4">
                            <div className="flex items-center gap-2 text-accent">
                                <BatteryCharging size={18} />
                                <span className="text-[14px] font-bold uppercase tracking-wider">Energy Insight</span>
                            </div>
                            <p className="text-[13px] text-secondary leading-relaxed">
                                You&apos;re currently in your peak energy window. Now is the best time for high-leverage creative work.
                            </p>
                        </div>
                    </div>

                    {/* Right: Timer Area */}
                    <div className="flex flex-col items-center space-y-10">
                        {/* Circle Progress Timer */}
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="48%"
                                    className="fill-none stroke-border/20 stroke-[3]"
                                />
                                <motion.circle
                                    cx="50%"
                                    cy="50%"
                                    r="48%"
                                    className="fill-none stroke-accent stroke-[3]"
                                    strokeDasharray="100 100"
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 100 - progress }}
                                    transition={{ duration: 0.5, ease: "linear" }}
                                    pathLength="100"
                                />
                            </svg>
                            <div className="text-center">
                                <div className="text-[64px] font-mono font-bold text-primary tracking-tighter tabular-nums">
                                    {formatTime(elapsed || (duration * 60))}
                                </div>
                                <div className="text-[13px] text-text-muted font-medium uppercase tracking-[0.2em]">
                                    {status === 'idle' ? 'Ready' : status === 'running' ? 'Focusing' : 'Paused'}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            {status === 'idle' ? (
                                <Button
                                    size="lg"
                                    onClick={handleStart}
                                    className="bg-accent hover:bg-accent-light text-white rounded-full px-8 h-14 text-[16px] font-bold shadow-lg shadow-accent/20"
                                >
                                    <Play size={20} className="mr-2 fill-current" />
                                    Start Session
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        onClick={() => setStatus(status === 'running' ? 'paused' : 'running')}
                                        className="rounded-full w-14 h-14 p-0 border-border bg-card"
                                    >
                                        {status === 'running' ? <Pause size={20} /> : <Play size={20} className="fill-current" />}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="primary"
                                        onClick={handleComplete}
                                        className="bg-teal hover:bg-teal/90 text-white rounded-full px-8 h-14 font-bold"
                                    >
                                        <CheckCircle size={20} className="mr-2" />
                                        Complete
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        onClick={() => { setStatus('idle'); setElapsed(0); }}
                                        className="rounded-full w-14 h-14 p-0 text-text-muted hover:text-coral hover:bg-coral/10"
                                    >
                                        <Square size={18} />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Duration Picker */}
                {status === 'idle' && (
                    <div className="flex justify-center gap-3">
                        {[25, 50, 90].map(mins => (
                            <button
                                key={mins}
                                onClick={() => setDuration(mins)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-[13px] font-semibold transition-all duration-300",
                                    duration === mins 
                                        ? "bg-primary text-white" 
                                        : "bg-subtle text-text-muted hover:bg-border/40"
                                )}
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
