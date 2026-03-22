'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore } from '@/store/demo-store';
import { Inbox as InboxIcon, Search, Filter, Calendar, Clock, Sparkles, Brain, Zap, Target } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { toast } from 'sonner';

export default function InboxPage() {
    const { captures } = useDemoStore();
    const [search, setSearch] = useState('');
    const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
    const [showAISchedule, setShowAISchedule] = useState(false);

    const filteredCaptures = captures.filter(c => c.content.toLowerCase().includes(search.toLowerCase()));

    const generateAISchedule = () => {
        setIsGeneratingSchedule(true);
        setTimeout(() => {
            setIsGeneratingSchedule(false);
            setShowAISchedule(true);
            toast.success("Optimal schedule generated!");
        }, 1500);
    };

    return (
        <div className="h-full flex flex-col md:flex-row relative animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards px-8 lg:px-12 py-8 space-y-8">
            
            <div className="flex-1 space-y-8">
                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[32px] font-display text-primary tracking-normal mb-1 flex items-center gap-3">
                            <InboxIcon className="text-accent" size={28} /> Inbox
                        </h1>
                        <p className="text-[15px] text-secondary">Quick captures waiting for classification.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search inbox..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 h-9 bg-card border border-border rounded-input text-[13px] text-primary placeholder:text-text-placeholder w-48 focus:outline-none focus:border-border-strong transition-colors"
                            />
                        </div>
                        <Button variant="secondary" size="icon">
                            <Filter size={14} />
                        </Button>
                        <Button 
                            variant="primary"
                            className="gap-2 text-[13px] bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
                            onClick={generateAISchedule}
                            disabled={isGeneratingSchedule}
                        >
                            {isGeneratingSchedule ? <Zap size={14} className="animate-pulse" /> : <Sparkles size={14} />}
                            AI Schedule
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inbox Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredCaptures.length > 0 ? (
                                filteredCaptures.map((capture, i) => (
                                    <motion.div
                                        key={capture.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Card className="group hover:border-accent/40 transition-all">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <p className="text-[15px] text-primary leading-relaxed font-medium">&quot;{capture.content}&quot;</p>
                                                    <Badge category="default" className="text-[10px] uppercase tracking-wider h-5">
                                                        {capture.category}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                                    <div className="flex gap-4">
                                                        <button 
                                                            onClick={() => toast.info("Classification modal coming soon")}
                                                            className="text-[12px] font-semibold text-text-muted hover:text-accent transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Target size={14} /> Classify
                                                        </button>
                                                        <button 
                                                            onClick={() => toast.success("Sent to Archive")}
                                                            className="text-[12px] font-semibold text-text-muted hover:text-coral transition-colors flex items-center gap-1.5"
                                                        >
                                                            <Clock size={14} /> Someday
                                                        </button>
                                                    </div>
                                                    <span className="text-[11px] text-text-muted font-mono">{capture.timestamp.toLocaleDateString()}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                    <InboxIcon size={48} className="text-text-muted" />
                                    <p className="text-secondary">Inbox is clear. You&apos;re fully captured.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* AI Insights & Scheduling */}
                    <div className="space-y-6">
                        <Card className="bg-subtle border-border-strong overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-light" />
                            <CardContent className="p-6">
                                <h3 className="text-[14px] font-bold text-primary mb-4 flex items-center gap-2">
                                    <Brain size={16} className="text-accent" /> Time Insights
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[13px] text-secondary">Total Workload</span>
                                        <span className="text-[15px] font-display font-medium text-primary">~4.5h</span>
                                    </div>
                                    <Progress value={65} className="h-1" />
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="p-3 bg-card border border-border rounded-lg">
                                            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Deep</div>
                                            <div className="text-[18px] font-display text-primary">3h</div>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-lg">
                                            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Shallow</div>
                                            <div className="text-[18px] font-display text-primary">1.5h</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <AnimatePresence>
                            {showAISchedule && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-[12px] uppercase tracking-[0.08em] font-bold text-accent">Optimal Schedule</h3>
                                    {[
                                        { time: '09:00', task: 'Deep Work: Project Alpha', dur: '90m' },
                                        { time: '10:30', task: 'Review: Area Health', dur: '30m' },
                                        { time: '11:00', task: 'Resource: Knowledge Sink', dur: '45m' },
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 border border-border rounded-lg bg-card/50 flex justify-between items-center group hover:border-accent/40 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-8 rounded-full bg-accent/20 group-hover:bg-accent transition-colors" />
                                                <div>
                                                    <div className="text-[13px] text-primary font-medium">{item.task}</div>
                                                    <div className="text-[11px] text-text-muted">{item.time} • {item.dur}</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Calendar size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
