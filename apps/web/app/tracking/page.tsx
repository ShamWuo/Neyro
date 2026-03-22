'use client';

import { motion } from 'framer-motion';
import { useDemoStore } from '@/store/demo-store';
import { Target, Activity, Flame, Calendar, BatteryCharging } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export default function TrackingPage() {
    const { habits, momentumScore } = useDemoStore();

    // Mock data for the energy chart
    const energyData = [40, 60, 55, 80, 95, 85, 90, 75, 60, 85, 90, 100, 80, 70];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards px-8 lg:px-12 py-8">

            {/* Header */}
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[32px] font-display text-primary tracking-normal flex items-center gap-3 mb-1"
                >
                    <Target className="text-accent" size={24} /> Tracking
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-secondary text-[15px]"
                >
                    Quantify your life and spot the trends that matter.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Habits & Streaks) */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <div className="p-6 pb-4 border-b border-border/50">
                            <h3 className="text-[11px] uppercase tracking-[0.06em] text-text-muted flex items-center gap-2">
                                <Flame size={14} className="text-amber" /> Active Streaks
                            </h3>
                        </div>
                        <CardContent className="pt-4 space-y-4">
                            {habits.sort((a, b) => b.streak - a.streak).map((habit, i) => (
                                <motion.div
                                    key={habit.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex justify-between items-center group cursor-pointer"
                                >
                                    <div>
                                        <div className="text-[13px] text-primary font-medium group-hover:text-accent transition-colors">{habit.name}</div>
                                        <div className="text-[11px] text-text-muted mt-0.5">{habit.completedDays} days total</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-amber">
                                        <div className="text-[18px] font-mono font-bold tabular-nums leading-none tracking-tight">{habit.streak}</div>
                                        <Flame size={16} className={cn("transition-all duration-300", habit.streak > 0 ? "fill-amber/20" : "text-border opacity-50")} />
                                    </div>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-subtle border-border-strong text-primary overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-light" />
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-6">
                                <Activity size={20} className="text-accent" />
                                <div className="text-[10px] font-bold text-accent uppercase tracking-widest bg-accent-light/10 px-2 py-1 rounded">Score</div>
                            </div>
                            <div className="text-[48px] font-display text-primary leading-none tracking-tight mb-2">{momentumScore}</div>
                            <div className="text-[13px] font-medium text-secondary mb-6">Momentum Score</div>
                            <div className="text-[12px] bg-subtle border border-border p-3 rounded-card text-primary leading-relaxed">
                                Your momentum is consistently high this week. Capitalize on this by tackling your &apos;Stalled&apos; projects.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Charts & Trends) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Energy Chart */}
                    <Card>
                        <div className="p-6 pb-6 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] uppercase tracking-[0.06em] text-text-muted flex items-center gap-2">
                                    <BatteryCharging size={14} className="text-teal" /> Energy Levels (14 Days)
                                </h3>
                                <div className="flex items-center gap-4 text-[11px] font-medium text-text-muted">
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-teal"></div> High</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber"></div> Medium</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-coral"></div> Low</span>
                                </div>
                            </div>
                        </div>

                        <CardContent className="pt-8">
                            {/* Minimal Bar Chart */}
                            <div className="h-40 flex items-end justify-between gap-1 sm:gap-2">
                                {energyData.map((val, i) => (
                                    <div key={i} className="w-full flex flex-col items-center gap-3 group">
                                        <div className="w-full relative h-[140px] flex flex-col justify-end bg-subtle rounded-t-[4px] overflow-hidden">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${val}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                                                className={cn(
                                                    "w-full rounded-t-[4px] transition-colors border-t border-white/20",
                                                    val >= 80 ? "bg-teal" : val >= 60 ? "bg-amber" : "bg-coral"
                                                )}
                                            >
                                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-mono",
                                            i >= 7 ? "text-primary" : "text-text-muted"
                                        )}>{days[i]}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weekly Matrix */}
                    <Card>
                        <div className="p-6 pb-4 border-b border-border/50">
                            <h3 className="text-[11px] uppercase tracking-[0.06em] text-text-muted flex items-center gap-2">
                                <Calendar size={14} /> Habit Matrix (12px Grid)
                            </h3>
                        </div>
                        <CardContent className="pt-4 overflow-x-auto">
                            <table className="w-full text-[13px] text-center">
                                <thead>
                                    <tr className="text-text-muted font-medium text-[11px] border-b border-border/30">
                                        <th className="text-left pb-3 font-normal w-[40%]">Habit</th>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <th key={day} className="pb-3 font-normal">{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {habits.map((habit, i) => (
                                        <motion.tr
                                            key={habit.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 + 0.3 }}
                                            className="border-b border-border/30 last:border-0 hover:bg-hover transition-colors"
                                        >
                                            <td className="text-left py-3 font-medium text-primary line-clamp-1 pr-4">{habit.name}</td>
                                            {/* Simulate checking matrix for demo */}
                                            {Array(7).fill(0).map((_, j) => {
                                                // Deterministic "randomness" for demo based on habit index and day index
                                                // This ensures the same result on server and client
                                                const isCompleted = ((i * 3) + (j * 7)) % 10 < 7;
                                                const isFuture = j > 3; // After Thursday is future
                                                return (
                                                    <td key={j} className="py-3">
                                                        <div className="w-full flex justify-center">
                                                            {isFuture ? (
                                                                <div className="w-3 h-3 rounded-[3px] border border-border bg-transparent"></div>
                                                            ) : isCompleted ? (
                                                                <div className="w-3 h-3 rounded-[3px] bg-teal border border-teal flex items-center justify-center">
                                                                </div>
                                                            ) : (
                                                                <div className="w-3 h-3 rounded-[3px] border border-border bg-subtle text-text-muted">
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <div className="w-[3px] h-[3px] rounded-full bg-border-strong" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
