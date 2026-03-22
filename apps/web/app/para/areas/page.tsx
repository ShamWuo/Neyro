'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore, Area } from '@/store/demo-store';
import { FolderOpen, Search, Filter, Plus, Activity, X, ChevronRight, Hash, Sparkles, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AreasPage() {
    const { areas, addArea, addProject } = useDemoStore();
    const [search, setSearch] = useState('');
    const [selectedArea, setSelectedArea] = useState<Area | null>(null);
    const [isNewAreaModalOpen, setIsNewAreaModalOpen] = useState(false);
    const [newAreaName, setNewAreaName] = useState('');
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');

    const filteredAreas = areas.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="h-full flex flex-col md:flex-row relative animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards">

            {/* Main List */}
            <div className={cn("flex-1 px-8 lg:px-12 py-8 space-y-8 transition-all duration-300", selectedArea ? "md:max-w-[calc(100%-420px)]" : "")}>

                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[32px] font-display text-primary tracking-normal mb-1">Areas</h1>
                        <p className="text-[15px] text-secondary">Ongoing responsibilities and standards to maintain.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search areas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 h-9 bg-card border border-border rounded-input text-[13px] text-primary placeholder:text-text-placeholder w-48 focus:outline-none focus:border-border-strong transition-colors"
                            />
                        </div>
                        <Button variant="secondary" size="icon">
                            <Filter size={14} />
                        </Button>
                        <Button 
                            className="gap-2 text-[13px]"
                            onClick={() => setIsNewAreaModalOpen(true)}
                        >
                            <Plus size={14} /> New Area
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredAreas.map((area, i) => (
                        <motion.div
                            key={area.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedArea(area)}
                        >
                            <Card
                                hoverEffect
                                className={cn(
                                    "cursor-pointer h-full flex flex-col",
                                    selectedArea?.id === area.id ? "border-accent ring-1 ring-accent/20 bg-accent-light/5" : ""
                                )}
                            >
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="text-secondary group-hover:text-accent transition-colors">
                                            <FolderOpen size={20} />
                                        </div>

                                        {/* Health Score Minimal Badge */}
                                        <div className={cn(
                                            "flex flex-col items-end px-2.5 py-1 rounded-card border shadow-sm",
                                            area.score >= 80 ? "bg-teal-light/20 border-teal/20 text-teal" :
                                                area.score >= 50 ? "bg-amber-light/20 border-amber/20 text-amber" :
                                                    "bg-coral-light/20 border-coral/20 text-coral"
                                        )}>
                                            <span className="font-display text-[15px] leading-none">{area.score}</span>
                                            <span className="text-[9px] uppercase tracking-[0.06em] opacity-70 mt-0.5">Health</span>
                                        </div>
                                    </div>

                                    <h3 className="text-[17px] font-medium text-primary mb-2 line-clamp-1">{area.name}</h3>
                                    <p className="text-[13px] text-secondary leading-relaxed">This Area&apos;s score has been stable. Consider refactoring its Projects for better focus.</p>

                                    <div className="mt-8 flex justify-between items-center text-accent text-[12px] font-semibold opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all tracking-[0.02em]">
                                        View Details <ChevronRight size={14} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredAreas.length === 0 && (
                    <div className="text-center py-20">
                        <FolderOpen className="mx-auto text-border-strong mb-4" size={32} strokeWidth={1.5} />
                        <h3 className="text-[15px] font-medium text-primary">No areas found</h3>
                        <p className="text-[13px] text-secondary mt-1">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>

            {/* Smart Detail Panel */}
            <AnimatePresence>
                {selectedArea && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: '420px' }}
                        exit={{ opacity: 0, x: 20, width: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="hidden md:block shrink-0 bg-card border-l border-border h-[calc(100vh-3.5rem)] overflow-y-auto sticky top-0 custom-scrollbar"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="text-accent">
                                    <FolderOpen size={20} />
                                </div>
                                <button
                                    onClick={() => setSelectedArea(null)}
                                    className="p-1 hover:bg-hover text-text-muted hover:text-primary rounded-button transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[11px] text-text-muted font-mono bg-subtle border border-border px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Hash size={10} /> AREA-{selectedArea.id.replace('a', '')}
                                    </span>
                                </div>
                                <h2 className="text-[28px] font-display text-primary leading-tight flex items-center justify-between tracking-normal">
                                    <span className="line-clamp-2 pr-4">{selectedArea.name}</span>
                                    <span className={cn(
                                        "text-[20px] shrink-0 font-sans font-mono",
                                        selectedArea.score >= 80 ? "text-teal" : selectedArea.score >= 50 ? "text-amber" : "text-coral"
                                    )}>{selectedArea.score}%</span>
                                </h2>
                            </div>

                            {/* AI Health Assessment */}
                            <div className="bg-subtle border border-border p-5 rounded-card mb-8 relative overflow-hidden text-primary">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal to-[#55E5C9] rounded-t-card" />
                                <div className="relative z-10 flex items-center gap-2 mb-2.5 text-[11px] font-semibold text-teal uppercase tracking-[0.06em]">
                                    <Sparkles size={12} /> Health Analysis
                                </div>
                                <p className="relative z-10 text-[13px] text-secondary leading-relaxed">
                                    {selectedArea.score < 50
                                        ? "This area relies heavily on external routines that haven't been active. Focus on scheduling one 30-minute block this week to regain momentum."
                                        : "You are maintaining this area consistently. Habits are tracking well, though captures have decreased slightly compared to last month."
                                    }
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Related Projects */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 text-[11px] font-semibold text-text-muted tracking-[0.06em] uppercase">
                                        <span className="flex items-center gap-2">
                                            <Folder size={14} /> Child Projects
                                        </span>
                                        <button 
                                            onClick={() => setIsNewProjectModalOpen(true)}
                                            className="text-text-muted hover:text-primary transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {/* Filter projects by area if we had areaId on projects, for now just show a sample or all */}
                                        <div className="p-4 bg-card border border-border rounded-card group hover:border-border-strong transition-all cursor-pointer shadow-sm">
                                            <div className="flex justify-between mb-2.5">
                                                <p className="text-[13px] text-primary font-medium group-hover:text-accent transition-colors">
                                                    Annual Checkup & Bloodwork
                                                </p>
                                                <span className="text-[9px] font-bold text-amber bg-amber-light/20 border border-amber/10 px-2 py-0.5 rounded-full flex items-center tracking-wider">STALLED</span>
                                            </div>
                                            <div className="w-full bg-border-default/50 rounded-full h-1 mt-2">
                                                <div className="bg-amber h-full rounded-full" style={{ width: '20%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracked Metrics/Standards */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 text-[11px] font-semibold text-text-muted tracking-[0.06em] uppercase">
                                        <span className="flex items-center gap-2">
                                            <Activity size={14} /> Standards
                                        </span>
                                    </div>
                                    <div className="space-y-3 bg-card p-4 rounded-card border border-border">
                                        <div className="flex justify-between items-center pb-3 border-b border-border/50 text-[13px]">
                                            <span className="font-medium text-primary">Weekly Review Completion</span>
                                            <span className="font-mono text-[12px] text-teal">100%</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-border/50 text-[13px]">
                                            <span className="font-medium text-primary">Deep Work Blocks</span>
                                            <span className="font-mono text-[12px] text-primary">12 / 15</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="font-medium text-primary">Daily Captures</span>
                                            <span className="font-mono text-[12px] text-amber">Trending Down</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Panel version */}
            <AnimatePresence>
                {selectedArea && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        className="fixed inset-0 z-50 bg-bg-card md:hidden p-6 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[24px] font-display text-primary">{selectedArea.name}</h2>
                            <button onClick={() => setSelectedArea(null)} className="p-2 border border-border rounded-button"><X size={16} /></button>
                        </div>
                        <div className="text-secondary text-[13px]">Mobile view simplified.</div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* New Area Modal */}
            <AnimatePresence>
                {isNewAreaModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNewAreaModalOpen(false)}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-card border border-border rounded-modal shadow-modal overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h2 className="text-lg font-display text-primary">New Area</h2>
                                <button onClick={() => setIsNewAreaModalOpen(false)} className="text-text-muted hover:text-primary transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Area Name</label>
                                    <input 
                                        type="text" 
                                        value={newAreaName}
                                        onChange={(e) => setNewAreaName(e.target.value)}
                                        placeholder="e.g. Physical Health"
                                        className="w-full h-10 px-3 bg-subtle border border-border rounded-input text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <p className="text-[12px] text-text-muted italic">Areas represent ongoing responsibilities. New areas start with a base health score of 100%.</p>
                            </div>
                            <div className="p-6 pt-0">
                                <Button 
                                    className="w-full" 
                                    disabled={!newAreaName.trim()}
                                    onClick={() => {
                                        addArea({
                                            name: newAreaName,
                                            score: 100,
                                            insight: "New area established. Maintain consistency to keep health high."
                                        });
                                        setIsNewAreaModalOpen(false);
                                        setNewAreaName('');
                                    }}
                                >
                                    Create Area
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* New Project Modal (scoped to area) */}
            <AnimatePresence>
                {isNewProjectModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNewProjectModalOpen(false)}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-card border border-border rounded-modal shadow-modal overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h2 className="text-lg font-display text-primary">New Project in {selectedArea?.name}</h2>
                                <button onClick={() => setIsNewProjectModalOpen(false)} className="text-text-muted hover:text-primary transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Project Title</label>
                                    <input 
                                        type="text" 
                                        value={newProjectTitle}
                                        onChange={(e) => setNewProjectTitle(e.target.value)}
                                        placeholder="e.g. Q3 Health Strategy"
                                        className="w-full h-10 px-3 bg-subtle border border-border rounded-input text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>
                            <div className="p-6 pt-0">
                                <Button 
                                    className="w-full" 
                                    disabled={!newProjectTitle.trim()}
                                    onClick={() => {
                                        addProject({
                                            title: newProjectTitle,
                                            status: 'Active',
                                            progress: 0,
                                            dueDate: null
                                        });
                                        setIsNewProjectModalOpen(false);
                                        setNewProjectTitle('');
                                    }}
                                >
                                    Create Project
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
