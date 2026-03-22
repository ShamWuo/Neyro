'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import {
    Layers,
    Plus,
    Activity,
    Shield,
    ArrowRight,
    MoreVertical,
    Calendar,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Area } from '@mobile/database/schema';

export default function AreasPage() {
    // @ts-ignore
    const areas = useNeyroStore((state: any) => state.areas) || [];
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    // @ts-ignore
    const addArea = useNeyroStore((state: any) => state.addArea);
    // @ts-ignore
    const isLoading = useNeyroStore((state: any) => state.isLoading);

    const [isCreating, setIsCreating] = useState(false);
    const [newAreaTitle, setNewAreaTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateArea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAreaTitle.trim()) return;
        await addArea(newAreaTitle);
        setNewAreaTitle('');
        setIsCreating(false);
    };

    const filteredAreas = areas.filter((area: Area) => {
        const title = area?.title || '';
        return title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getHealthColor = (score: number) => {
        if (score >= 4) return 'text-green-400 bg-green-400/10';
        if (score >= 2) return 'text-amber-400 bg-amber-400/10';
        return 'text-red-400 bg-red-400/10';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Layers className="w-8 h-8 text-neutral-400" />
                        Areas of Focus
                    </h1>
                    <p className="text-neutral-400 mt-2 max-w-xl">
                        Maintain balance across your life's key responsibilities.
                        Areas have no deadline—they require a standard of performance.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search areas..."
                            className="w-full bg-neutral-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_15px_rgba(255,106,0,0.3)] whitespace-nowrap"
                    >
                        <Plus size={18} className="mr-2" />
                        New Area
                    </Button>
                </div>
            </div>

            {/* Create Area Form */}
            {isCreating && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleCreateArea} className="bg-[#0f0a14] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-end md:items-center shadow-2xl">
                        <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/5">
                            🏔️
                        </div>
                        <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Area Title</label>
                            <input
                                autoFocus
                                type="text"
                                value={newAreaTitle}
                                onChange={(e) => setNewAreaTitle(e.target.value)}
                                placeholder="e.g. Health, Finance, Family..."
                                className="w-full bg-transparent border-b border-white/10 text-xl font-bold text-white focus:outline-none focus:border-primary/50 py-2 placeholder:text-neutral-700"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button type="button" onClick={() => setIsCreating(false)} variant="ghost" className="flex-1 md:flex-none">Cancel</Button>
                            <Button type="submit" disabled={!newAreaTitle.trim()} className="flex-1 md:flex-none">Create Area</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Areas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAreas.length === 0 && !isLoading ? (
                    <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
                        <Shield className="mx-auto text-neutral-600 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-white mb-2">No Areas Define Yet</h3>
                        <p className="text-neutral-500 max-w-md mx-auto mb-6">
                            Areas are the high-level categories of your life. Start by adding things like "Health", "Career", or "Home".
                        </p>
                        <Button onClick={() => setIsCreating(true)} variant="glass">Create Your First Area</Button>
                    </div>
                ) : (
                    filteredAreas.map((area: any) => {
                        const healthScore = area.healthScore || 0;
                        const healthColorClass = getHealthColor(healthScore);

                        return (
                            <Link key={area.id} href={`/areas/${area.id}`}>
                                <div className="group h-full bg-[#0f0a14] hover:bg-[#150f1a] border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="size-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                                            {area.emoji || '🏔️'}
                                        </div>
                                        <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", healthColorClass)}>
                                            <Activity size={12} />
                                            <span>Score: {healthScore}/5</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <h3 className="text-2xl font-bold text-white leading-tight group-hover:text-primary transition-colors">{area.title}</h3>
                                        <p className="text-neutral-500 text-sm">
                                            {area.lastReviewedAt
                                                ? `Last audit: ${new Date(area.lastReviewedAt).toLocaleDateString()}`
                                                : 'No audits yet'}
                                        </p>
                                    </div>

                                    {/* Mock Progress Bars for Balance */}
                                    <div className="space-y-2 mb-6">
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-neutral-600 rounded-full" style={{ width: `${(healthScore / 5) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <span className="text-xs font-medium text-neutral-500 group-hover:text-white transition-colors">View Standards</span>
                                        <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
