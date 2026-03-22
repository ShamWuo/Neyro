'use client';

import { motion } from 'framer-motion';
import { useDemoStore } from '@/store/demo-store';
import { Activity, Clock, Folder, Circle, Bookmark, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { projects, areas, captures } = useDemoStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate aggregated stats
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const avgAreaScore = areas.length ? Math.round(areas.reduce((acc, a) => acc + a.score, 0) / areas.length) : 0;
    
    // Dynamic counts from captures/store
    const resourceCount = captures.filter(c => c.category === 'Resources').length;
    const archiveCount = captures.filter(c => c.category === 'Archive').length;

    if (!mounted) {
        return <div className="p-8 text-secondary animate-pulse">Loading dashboard...</div>;
    }

    return (
        <div className="max-w-[1000px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards pb-12">

            {/* Header */}
            <div className="space-y-2">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[32px] font-display text-primary tracking-normal"
                >
                    Overview
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-secondary text-[15px]"
                >
                    A high-level view of your life's operational status.
                </motion.p>
            </div>

            {/* PARA 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <StatsCard
                    title="Projects"
                    icon={<Folder size={18} />}
                    value={activeProjects.toString()}
                    sub={`${completedProjects} completed recently`}
                    delay={0.1}
                    paraTint="projects"
                    onClick={() => router.push('/para/projects')}
                />

                <StatsCard
                    title="Areas"
                    icon={<Circle size={18} />}
                    value={areas.length.toString()}
                    sub={`Avg Health: ${avgAreaScore}%`}
                    delay={0.15}
                    paraTint="areas"
                    onClick={() => router.push('/para/areas')}
                />

                <StatsCard
                    title="Resources"
                    icon={<Bookmark size={18} />}
                    value={resourceCount.toString()}
                    sub="+3 this week"
                    delay={0.2}
                    paraTint="resources"
                    onClick={() => router.push('/para/resources')}
                />

                <StatsCard
                    title="Archive"
                    icon={<Archive size={18} />}
                    value={archiveCount.toString()}
                    sub="Items safely stored"
                    delay={0.25}
                    paraTint="archive"
                    onClick={() => router.push('/para/archive')}
                />
            </div>

            <hr className="border-border" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mt-8">

                {/* Area Health Radar / Bars */}
                <div className="space-y-6">
                    <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em] flex items-center gap-2">
                        <Activity size={14} /> Area Health
                    </h2>

                    <div className="space-y-6">
                        {areas.map((area, i) => (
                            <div key={area.id} className="space-y-2.5">
                                <div className="flex justify-between text-[13px] items-center">
                                    <span className="font-medium text-primary">{area.name}</span>
                                    <span className="font-mono text-secondary text-[11px]">{area.score}%</span>
                                </div>
                                <Progress
                                    value={area.score}
                                    className="h-1 bg-border-default/50"
                                    indicatorColor={
                                        area.score >= 80 ? "bg-teal" : area.score >= 50 ? "bg-amber" : "bg-coral"
                                    }
                                />
                                <p className="text-[12px] text-secondary leading-relaxed">{area.insight}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="space-y-6">
                    <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em] flex items-center gap-2">
                        <Clock size={14} /> Recent Activity
                    </h2>

                    <div className="space-y-1">
                        {captures.slice(0, 5).map((capture, i) => {
                            const diffMs = Math.abs(capture.timestamp.getTime() - Date.now());
                            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                            const timeAgo = diffDays > 0 ? `${diffDays}d ago` : 'Today';

                            return (
                                <div key={capture.id} className="flex gap-4 group py-3 px-3 -mx-3 hover:bg-hover rounded-card transition-colors cursor-pointer border border-transparent hover:border-border/50">
                                    <div className="mt-1 shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-border-strong group-hover:bg-accent transition-colors" />
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <p className="text-primary text-[13px] font-medium leading-relaxed group-hover:text-accent transition-colors">
                                            {capture.content}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.06em]">
                                                {capture.category.replace('Areas (', '').replace(')', '')}
                                            </span>
                                            <span className="text-[11px] font-mono text-text-placeholder">{timeAgo}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatsCard({ title, icon, value, sub, delay, paraTint, onClick }: { title: string, icon: React.ReactNode, value: string, sub: string, delay: number, paraTint: "projects" | "areas" | "resources" | "archive", onClick?: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            onClick={onClick}
        >
            <Card hoverEffect paraTint={paraTint} className="h-full flex flex-col cursor-pointer bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-text-muted font-semibold tracking-[0.06em] uppercase text-[11px] mb-6">
                        <span className="text-secondary">{icon}</span> {title}
                    </div>
                    <div>
                        <span className="text-[32px] font-display text-primary tracking-normal">{value}</span>
                        <p className="text-[13px] text-secondary mt-1">{sub}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
