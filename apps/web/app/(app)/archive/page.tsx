'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { Archive, RotateCcw, Trash2, Search, Filter, FolderClosed, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Project, Resource } from '@mobile/database/schema';

type ArchiveTab = 'projects' | 'resources';

export default function ArchivePage() {
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    // @ts-ignore
    // @ts-ignore
    const completedProjects = useNeyroStore((state: any) => state.completedProjects) || [];
    // @ts-ignore
    const pausedProjects = useNeyroStore((state: any) => state.pausedProjects) || [];
    // @ts-ignore
    const resources = useNeyroStore((state: any) => state.resources) || [];
    // @ts-ignore
    const updateProject = useNeyroStore((state: any) => state.updateProject);
    // @ts-ignore
    const updateResource = useNeyroStore((state: any) => state.updateResource);
    // @ts-ignore
    const deleteProject = useNeyroStore((state: any) => state.deleteProject);
    // @ts-ignore
    const deleteResource = useNeyroStore((state: any) => state.deleteResource);

    const [activeTab, setActiveTab] = useState<ArchiveTab>('projects');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    // Filter Data
    const archivedProjects = useMemo(() => {
        return [...completedProjects, ...pausedProjects].filter((p: Project) =>
            p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [completedProjects, pausedProjects, searchQuery]);

    const archivedResources = useMemo(() => {
        return resources.filter((r: Resource) =>
            r.isArchived && r.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [resources, searchQuery]);

    // Handlers
    const handleRestoreProject = async (id: string) => {
        await updateProject(id, { status: 'active', completedAt: null, updatedAt: Date.now() });
    };

    const handleRestoreResource = async (id: string) => {
        await updateResource(id, { isArchived: false });
    };

    const handleDeleteProject = async (id: string) => {
        if (confirm('Are you sure you want to permanently delete this project?')) {
            const success = await deleteProject(id);
            if (success) {
                toast.success('Project permanently deleted.');
            } else {
                toast.error('Failed to delete project. It may already be gone.');
            }
        }
    };

    const handleDeleteResource = async (id: string) => {
        if (confirm('Are you sure you want to permanently delete this resource?')) {
            await deleteResource(id);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-neutral-400 tracking-tight flex items-center gap-3">
                        <Archive className="size-8" />
                        Cold Storage
                    </h1>
                    <p className="text-neutral-500 mt-2 max-w-xl">
                        A place for completed work and historical references.
                        Keep your main workspace clean and focused on the present.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search archive..."
                            className="w-full bg-neutral-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-neutral-700 transition-all font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* AI Cleanup Suggestion (Mock) */}
            <div className="bg-gradient-to-r from-neutral-900 to-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Filter size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-300">System Cleanup</h3>
                        <p className="text-xs text-neutral-500">AI suggests archiving 3 unused resources to reduce clutter.</p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    onClick={() => {
                        setActiveTab('resources');
                        setSearchQuery('suggested:archivable');
                        toast.info("Showing resources suggested for archiving.");
                    }}
                >
                    Review
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-indigo-500/20">
                <button
                    onClick={() => setActiveTab('projects')}
                    className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-wider transition-colors",
                        activeTab === 'projects' ? "text-indigo-400 border-b-2 border-indigo-400" : "text-neutral-600 hover:text-neutral-400"
                    )}
                >
                    Project Graveyard
                </button>
                <button
                    onClick={() => setActiveTab('resources')}
                    className={cn(
                        "pb-4 text-sm font-bold uppercase tracking-wider transition-colors",
                        activeTab === 'resources' ? "text-indigo-400 border-b-2 border-indigo-400" : "text-neutral-600 hover:text-neutral-400"
                    )}
                >
                    Reference Library
                </button>
            </div>

            {/* Content & List View */}
            <div className="space-y-4">
                {activeTab === 'projects' ? (
                    archivedProjects.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                            <p className="text-neutral-600">No projects in the graveyard yet.</p>
                        </div>
                    ) : (
                        archivedProjects.map((project: Project) => (
                            <div key={project.id} className="group items-center grid grid-cols-[1fr_auto] gap-4 p-5 bg-neutral-900/40 border border-white/5 rounded-xl hover:bg-neutral-900/60 transition-all">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-neutral-400 group-hover:text-neutral-200 transition-colors line-through decoration-neutral-700">{project.title}</h3>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                                            project.status === 'completed' ? "bg-green-900/20 border-green-800 text-green-700" : "bg-yellow-900/20 border-yellow-800 text-yellow-700"
                                        )}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-600 font-mono mb-2 max-w-2xl truncate">{project.description || "No description"}</p>
                                    <div className="flex items-center gap-4 text-xs text-neutral-600">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 size={12} />
                                            <span>Outcome: {project.outcome || "Not specified"}</span>
                                        </div>
                                        <span>•</span>
                                        <span>Completed: {project.completedAt ? new Date(project.completedAt).toLocaleDateString() : 'Unknown'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <Button onClick={() => handleRestoreProject(project.id)} variant="ghost" size="sm" title="Resurrect Project" className="hover:text-amber-400">
                                        <RotateCcw size={16} />
                                    </Button>
                                    <Button onClick={() => handleDeleteProject(project.id)} variant="ghost" size="sm" title="Delete Forever" className="hover:text-red-400">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    // Resources Tab
                    archivedResources.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                            <p className="text-neutral-600">No archived resources.</p>
                        </div>
                    ) : (
                        archivedResources.map((resource: Resource) => (
                            <div key={resource.id} className="group items-center grid grid-cols-[auto_1fr_auto] gap-4 p-4 bg-neutral-900/40 border border-white/5 rounded-xl hover:bg-neutral-900/60 transition-all">
                                <div className="size-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500">
                                    {resource.type === 'link' ? '🔗' : resource.type === 'pdf' ? '📄' : resource.type === 'image' ? '🖼️' : '📝'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-neutral-400 group-hover:text-neutral-200 truncate">{resource.title}</h3>
                                    <p className="text-xs text-neutral-600 truncate">{resource.summary || resource.sourceUrl || "No summary"}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <Button onClick={() => handleRestoreResource(resource.id)} variant="ghost" size="sm" title="Restore to Library">
                                        <RotateCcw size={16} />
                                    </Button>
                                    <Button onClick={() => handleDeleteResource(resource.id)} variant="ghost" size="sm" title="Delete Forever" className="hover:text-red-400">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
