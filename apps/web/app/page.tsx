'use client';

import { motion } from 'framer-motion';
import { useDemoStore } from '@/store/demo-store';
import { Target, Sparkles, CheckCircle2, Circle, Clock, ArrowRight, Play, BatteryCharging } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';

export default function TodayPage() {
    const { projects, habits, captures } = useDemoStore();
    const [greeting, setGreeting] = useState('Good morning');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
        else if (hour >= 17) setGreeting('Good evening');
    }, []);

    const activeProjects = projects.filter(p => p.status === 'Active').slice(0, 3);
    const recentCaptures = captures.slice(0, 3);

    return (
        <div className="max-w-[1200px] mx-auto h-full flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards">

            {/* Left Column (Main Content) */}
            <div className="flex-1 space-y-12 pb-12 w-full lg:max-w-[65%]">

                {/* Greeting Section */}
                <div className="space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[40px] leading-tight font-display text-primary tracking-normal"
                    >
                        {greeting}, User.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-secondary text-[15px]"
                    >
                        You have <span className="font-semibold text-primary">{activeProjects.length} priorities</span> and <span className="font-semibold text-primary">4 tasks</span> due today.
                    </motion.p>
                </div>

                {/* Priority Cards */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
                            Top Priorities
                        </h2>
                        <button className="text-[12px] text-secondary hover:text-primary transition-colors font-medium flex items-center gap-1 group">
                            View all <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-5">
                        {activeProjects.map((project, i) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.15 }}
                            >
                                <Card hoverEffect className="h-full flex flex-col border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.03)] cursor-pointer overflow-hidden group">
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-8 h-8 rounded-full bg-subtle text-accent flex items-center justify-center font-bold">
                                                {i + 1}
                                            </div>
                                            <Badge category="projects">Project</Badge>
                                        </div>

                                        <h3 className="font-semibold text-primary text-base mb-2 group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                                            {project.title}
                                        </h3>

                                        <div className="flex items-center gap-2 text-[12px] text-secondary mt-auto pt-4">
                                            <Clock size={12} />
                                            <span>{project.dueDate || 'Soon'}</span>
                                            <span className="text-border-strong px-0.5">•</span>
                                            <span>{project.tasksCount} pending</span>
                                        </div>

                                        <div className="mt-4">
                                            <Progress value={project.progress} className="h-1 bg-border-default/50" indicatorColor="bg-accent" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <hr className="border-border" />

                {/* Up Next List */}
                <div className="space-y-4">
                    <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
                        Up Next
                    </h2>

                    <div className="space-y-1">
                        {[
                            { title: 'Review Q1 Analytics Report', project: 'Neyro Website Launch', time: '10:00 AM' },
                            { title: 'Draft email to beta testers', project: 'Investor Pitch Deck', time: '1:30 PM' },
                            { title: 'Call with design agency', project: 'Neyro Website Launch', time: '3:00 PM' }
                        ].map((task, i) => (
                            <div key={i} className="flex items-center justify-between p-3 -mx-3 rounded-button hover:bg-hover transition-colors group cursor-pointer border border-transparent hover:border-border/50">
                                <div className="flex items-center gap-4">
                                    <button className="text-text-placeholder hover:text-accent transition-colors">
                                        <Circle size={18} />
                                    </button>
                                    <div>
                                        <p className="text-[14px] text-primary font-medium">{task.title}</p>
                                        <p className="text-[12px] text-secondary">{task.project}</p>
                                    </div>
                                </div>
                                <div className="text-[11px] text-text-muted font-mono bg-subtle px-2 py-0.5 rounded-[4px] border border-border/50">
                                    {task.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Right Column (Side Panel) */}
            <div className="lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-8 lg:pt-0 lg:pl-8 space-y-10">

                {/* Quiet AI Context Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-accent" />
                        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">Insights</h2>
                    </div>

                    <div className="p-4 bg-accent-light/30 border-l-2 border-l-accent rounded-r-card text-sm space-y-3">
                        <p className="text-primary leading-relaxed text-[13px]">
                            You captured 3 notes about "Traction" yesterday. Want me to draft the Investor Deck slides?
                        </p>
                        <button className="text-[12px] font-semibold text-accent hover:text-accent-dark transition-colors">
                            Draft Slides &rarr;
                        </button>
                    </div>

                    <div className="p-4 bg-teal-light/30 border border-teal-light rounded-card text-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <BatteryCharging size={14} className="text-teal" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-teal">Energy Check</span>
                        </div>
                        <p className="text-secondary leading-relaxed text-[13px]">
                            You usually hit a slump around 2PM. Knock out the 'Health Routine' tasks now while momentum is high.
                        </p>
                    </div>
                </motion.div>

                {/* Habit Tracker */}
                <div className="space-y-4">
                    <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
                        Daily Tracking
                    </h2>

                    <div className="grid grid-cols-5 gap-1.5">
                        {habits.slice(0, 5).map((habit, i) => (
                            <div key={habit.id} className="group relative">
                                <div className={cn(
                                    "w-full aspect-square rounded-[4px] border transition-colors flex items-center justify-center",
                                    i === 0
                                        ? "bg-accent border-accent text-white"
                                        : "bg-transparent border-border hover:border-accent-light hover:bg-subtle text-transparent hover:text-accent-light"
                                )}>
                                    <CheckCircle2 size={14} />
                                </div>
                                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 text-white text-[10px] py-1 px-2 rounded-[4px] pointer-events-none transition-opacity z-10">
                                    {habit.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Captures */}
                <div className="space-y-4">
                    <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
                        Recent Captures
                    </h2>
                    <div className="space-y-2">
                        {recentCaptures.map(capture => (
                            <div key={capture.id} className="p-3 bg-subtle rounded-card border border-transparent hover:border-border transition-colors text-sm cursor-pointer group">
                                <p className="text-primary line-clamp-2 text-[13px] leading-relaxed group-hover:text-accent transition-colors">{capture.content}</p>
                                <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-[0.05em]">
                                    {capture.category}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
