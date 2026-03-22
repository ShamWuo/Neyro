'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { Resource } from '@mobile/database/schema';
import {
    Search,
    Filter,
    Sparkles,
    Archive,
    Link as LinkIcon,
    FileText,
    Image as ImageIcon,
    Mic,
    MoreHorizontal,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    Library
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Mock AI Tags usage for now since DB might be empty
const getResourceTags = (r: any): string[] => {
    if (r.aiTags) {
        try {
            return JSON.parse(r.aiTags);
        } catch (e) { return []; }
    }
    // Fallback logic for demo/transition if no tags
    const title = (r.title || '').toLowerCase();
    if (title.includes('design') || title.includes('ui') || title.includes('ux')) return ['Design'];
    if (title.includes('code') || title.includes('dev') || title.includes('api')) return ['Development'];
    if (title.includes('music') || title.includes('guitar')) return ['Music'];
    return ['Unsorted'];
};

export default function ResourcesPage() {
    // @ts-ignore
    const resources = useNeyroStore((state: any) => state.resources) as any[];
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    // @ts-ignore
    const addResource = useNeyroStore((state: any) => state.addResource);
    // @ts-ignore
    const deleteResource = useNeyroStore((state: any) => state.deleteResource);
    // @ts-ignore
    const addTask = useNeyroStore((state: any) => state.addTask);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'link' | 'audio' | 'image' | 'pdf'>('all');
    const [showArchiveSuggestions, setShowArchiveSuggestions] = useState(true);
    const [isCleanupMode, setIsCleanupMode] = useState(false);

    // Create Modal States
    const [isCreating, setIsCreating] = useState(false);
    const [newItemUrl, setNewItemUrl] = useState('');
    const [newItemTitle, setNewItemTitle] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    // 1. Filter by Type & Search
    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            if (r.isArchived) return false; // Hide archived by default

            const matchesSearch = (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.summary && r.summary.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType = activeTab === 'all' || r.type === activeTab || (activeTab === 'pdf' && r.type === 'note'); // simplified mapping
            
            if (isCleanupMode) {
                const threshold = Date.now() - (30 * 24 * 60 * 60 * 1000);
                return matchesSearch && matchesType && r.updatedAt < threshold;
            }

            return matchesSearch && matchesType;
        });
    }, [resources, searchQuery, activeTab, isCleanupMode]);

    // 2. Group by Topic Cluster
    const clusters = useMemo(() => {
        const groups: Record<string, any[]> = {};

        filteredResources.forEach(r => {
            const tags = getResourceTags(r);
            const primaryTag = tags[0] || 'Unsorted';

            if (!groups[primaryTag]) groups[primaryTag] = [];
            groups[primaryTag].push(r);
        });

        return groups;
    }, [filteredResources]);

    // 3. Identify Archive Suggestions (Old items)
    const archiveSuggestions = useMemo(() => {
        const threshold = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
        return resources.filter(r => !r.isArchived && r.updatedAt < threshold).slice(0, 3);
    }, [resources]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        // Simple creation for now - in real app would invoke AI scraper for URL
        await addResource(newItemTitle, false, null, 'link', newItemUrl);
        setNewItemTitle('');
        setNewItemUrl('');
        setIsCreating(false);
    };

    const handleMakeActionable = async (resource: any) => {
        // Create a task linked to this resource
        const taskTitle = `Review: ${resource.title}`;
        await addTask(taskTitle, 'inbox', 'project'); // Defaulting to inbox/project for simplicity
        // In a real implementation this would open a modal to pick the project
        alert(`Task created: "${taskTitle}"`);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'audio': return <Mic className="w-4 h-4 text-purple-400" />;
            case 'image': return <ImageIcon className="w-4 h-4 text-pink-400" />;
            case 'pdf': return <FileText className="w-4 h-4 text-orange-400" />;
            case 'link':
            default: return <LinkIcon className="w-4 h-4 text-blue-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex-none p-8 pb-0 space-y-6">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <Library className="w-8 h-8 text-neutral-400" />
                            Knowledge Vault
                        </h1>
                        <p className="text-neutral-400 mt-2">
                            Global repository for your interests, research, and captured content.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_15px_rgba(255,106,0,0.3)]"
                    >
                        + Add Resource
                    </Button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, summary, or tag..."
                            className="w-full bg-neutral-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>

                    <div className="flex bg-neutral-900/50 p-1 rounded-lg border border-white/5">
                        {['all', 'link', 'audio', 'image', 'pdf'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                                    activeTab === tab
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* Archive Suggestions */}
                {showArchiveSuggestions && archiveSuggestions.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Clean up your Vault?</h3>
                                <p className="text-neutral-400 text-xs">
                                    We found {archiveSuggestions.length} items you haven't touched in a while.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowArchiveSuggestions(false)}>Dismiss</Button>
                            <Button 
                                size="sm" 
                                onClick={() => {
                                    setIsCleanupMode(true);
                                    setActiveTab('all');
                                    setSearchQuery('');
                                }} 
                                className={cn(
                                    "text-white border border-white/5",
                                    isCleanupMode ? "bg-purple-500/40" : "bg-white/10 hover:bg-white/20"
                                )}
                            >
                                {isCleanupMode ? "Viewing Candidates" : "Review Candidates"}
                            </Button>
                            {isCleanupMode && (
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => setIsCleanupMode(false)}
                                    className="text-white/60 hover:text-white"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Topic Clusters */}
                {Object.entries(clusters).map(([topic, items]) => (
                    <div key={topic} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-bold text-white max-w-max bg-gradient-to-r from-neutral-800 to-transparent px-3 py-1 rounded-full border border-white/5">
                                {topic}
                            </h2>
                            <div className="h-px bg-white/5 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="group flex flex-col bg-neutral-900/30 hover:bg-neutral-900/60 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                                        </Button>
                                    </div>

                                    {/* Smart Summary */}
                                    {item.summary ? (
                                        <div className="bg-white/5 rounded-lg p-2 mb-3">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Sparkles className="w-3 h-3 text-secondary" />
                                                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Smart Summary</span>
                                            </div>
                                            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                                                {item.summary}
                                            </p>
                                        </div>
                                    ) : null}

                                    {/* Action Footer */}
                                    <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-2">
                                            {item.sourceUrl && (
                                                <a
                                                    href={item.sourceUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
                                                >
                                                    <LinkIcon className="w-3 h-3" />
                                                </a>
                                            )}
                                            <button className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1" title="Share with team">
                                                <MoreHorizontal className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleMakeActionable(item)}
                                            className="ml-auto text-[10px] font-medium text-primary hover:text-orange-400 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md transition-colors"
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                            Make Actionable
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Add to Vault</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newItemTitle}
                                    onChange={(e) => setNewItemTitle(e.target.value)}
                                    placeholder="e.g. Design Principles 2024"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">URL (Optional)</label>
                                <input
                                    type="text"
                                    value={newItemUrl}
                                    onChange={(e) => setNewItemUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="bg-transparent hover:bg-white/5 text-neutral-400"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!newItemTitle.trim()}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    Save to Vault
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
