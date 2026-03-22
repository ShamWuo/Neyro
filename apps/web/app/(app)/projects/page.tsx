'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import {
    Briefcase,
    Plus,
    Rocket,
    Folder,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function ProjectsPage() {
    const router = useRouter();
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-ignore
    const pausedProjects = useNeyroStore((state: any) => state.pausedProjects || []);
    // @ts-ignore
    const completedProjects = useNeyroStore((state: any) => state.completedProjects || []);
    // @ts-ignore
    const addProject = useNeyroStore((state: any) => state.addProject); // Add addProject hook
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    // @ts-ignore
    const isLoading = useNeyroStore((state: any) => state.isLoading);

    useEffect(() => {
        loadData();
    }, []);

    const allProjects = [...activeProjects, ...pausedProjects, ...completedProjects];

    const [isCreating, setIsCreating] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectTitle.trim()) return;

        await addProject(newProjectTitle);
        setNewProjectTitle('');
        setIsCreating(false);
    };

    if (isLoading && allProjects.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-neutral-400">
                <span className="animate-pulse">Loading projects...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 h-full relative">
            {/* Create Modal Overlay */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0f0a14] border border-white/10 rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Rocket className="text-primary" size={20} />
                            New Project
                        </h2>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Project Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newProjectTitle}
                                    onChange={(e) => setNewProjectTitle(e.target.value)}
                                    placeholder="e.g. Redesign Logo"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="bg-transparent hover:bg-white/5 text-neutral-400 border border-transparent hover:border-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!newProjectTitle.trim()}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    Create Project
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-end justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-white tracking-tight">Projects</h1>
                    <p className="text-neutral-400">
                        Manage your active efforts. You have <span className="text-primary font-bold">{activeProjects.length} active</span> projects.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-[0_0_15px_rgba(255,106,0,0.3)] transition-all"
                >
                    <Plus size={18} />
                    <span>New Project</span>
                </Button>
            </div>

            {/* Auto Warning */}
            {activeProjects.length >= 7 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4 mx-1">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-red-400 font-bold text-sm">Capacity Warning</h4>
                        <p className="text-red-400/80 text-sm mt-1">You have reached the limit of 7 active projects. Consider completing or pausing some projects to maintain focus.</p>
                    </div>
                </div>
            )}

            {/* Active Projects Grid */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Rocket className="text-primary" size={20} />
                    Active Projects
                </h3>

                {activeProjects.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center text-neutral-500 flex flex-col items-center gap-4">
                        <Folder className="size-12 opacity-20" />
                        <p>No active projects. Start something new!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeProjects.map((project: any) => (
                            <ProjectCard key={project.id} project={project} status="active" onClick={() => router.push(`/projects/${project.id}`)} />
                        ))}
                    </div>
                )}
            </section>

            {/* Paused & Completed (if any) */}
            {(pausedProjects.length > 0 || completedProjects.length > 0) && (
                <section className="space-y-4 pt-8 border-t border-white/5">
                    <h3 className="text-lg font-bold text-white/50 flex items-center gap-2">
                        <Clock className="text-white/30" size={20} />
                        Paused & Completed
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        {pausedProjects.map((project: any) => (
                            <ProjectCard key={project.id} project={project} status="paused" onClick={() => router.push(`/projects/${project.id}`)} />
                        ))}
                        {completedProjects.map((project: any) => (
                            <ProjectCard key={project.id} project={project} status="completed" onClick={() => router.push(`/projects/${project.id}`)} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function ProjectCard({ project, status, onClick }: { project: any, status: 'active' | 'paused' | 'completed', onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group glass-panel border border-white/5 rounded-2xl p-5 flex flex-col gap-4 cursor-pointer transition-all hover:-translate-y-1",
                status === 'active' ? "hover:border-primary/30 hover:shadow-[0_0_20px_rgba(255,106,0,0.1)]" : "hover:border-white/10"
            )}
        >
            <div className="flex justify-between items-start">
                <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center text-lg shadow-inner",
                    status === 'active' ? "bg-primary/10 text-primary" : "bg-white/5 text-neutral-500"
                )}>
                    {project.emoji || '📁'}
                </div>
                {status !== 'active' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-neutral-500">
                        {status}
                    </span>
                )}
            </div>

            <div>
                <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{project.title}</h4>
                <p className="text-sm text-neutral-400 line-clamp-2 mt-1 min-h-[40px]">
                    {project.description || "No description provided."}
                </p>
            </div>

            <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
                {project.deadline ? (
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} className={new Date(project.deadline) < new Date() ? "text-red-400" : ""} />
                        <span className={new Date(project.deadline) < new Date() ? "text-red-400" : ""}>
                            {new Date(project.deadline).toLocaleDateString()}
                        </span>
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 opacity-50">
                        <Calendar size={14} />
                        <span>No deadline</span>
                    </span>
                )}

                <span className="flex items-center gap-1 group-hover:text-white transition-colors">
                    <span>View</span>
                    <ArrowRight size={14} />
                </span>
            </div>
        </div>
    );
}
