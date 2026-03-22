'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import Link from 'next/link';
import {
    ArrowLeft,
    Activity,
    Layers, // For Areas
    Loader2,
    Plus,
    CheckCircle2,
    Calendar,
    Trash2,
    Shield,
    Sparkles,
    FileText,
    FolderClosed,
    Pin,
    Zap,
    ChevronRight,
    Search,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Area, Project, Resource, Task, Note } from '@mobile/database/schema';

// Helper to get all descendant area IDs for Pulse aggregation
const getDescendantIds = (areaId: string, allAreas: Area[]): string[] => {
    const children = allAreas.filter(a => a.parentId === areaId);
    const childIds = children.map(c => c.id);
    return childIds.reduce((acc, childId) => {
        return [...acc, ...getDescendantIds(childId, allAreas)];
    }, childIds);
};

// Simple Rule-Based AI Insight Generator
const getAreaInsight = (area: Area, projects: Project[], tasks: Task[], subAreas: Area[]) => {
    const health = area.healthScore || 0;
    const projectCount = projects.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;

    if (health < 2) return {
        text: `This area is critically under-maintained (Health: ${health}/5). Risk of neglect is high.`,
        action: "Urgent Audit"
    };
    if (projects.length === 0 && subAreas.length > 0) return {
        text: `You have ${subAreas.length} categories but 0 active projects here. You might be in "maintenance mode" without progress.`,
        action: "Start Project"
    };
    if (completedTasks > 5 && health > 3) return {
        text: "Great momentum! You've completed significant rituals recently. Consider raising your standards.",
        action: "Raise Standards"
    };
    if (!area.lastReviewedAt) return {
        text: "You have never formally audited this area. Define your standard of performance now.",
        action: "Initial Audit"
    };

    // Default
    return {
        text: "This area is stable. Check your sub-categories to ensure nothing is slipping through the cracks.",
        action: "Check Sub-Areas"
    };
};

export default function AreaDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    // @ts-ignore
    const areas = useNeyroStore((state: any) => state.areas || []);
    // @ts-ignore
    const tasks = useNeyroStore((state: any) => state.tasks || []);
    // @ts-ignore
    const notes = useNeyroStore((state: any) => state.notes || []);
    // @ts-ignore
    const resources = useNeyroStore((state: any) => state.resources || []);
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);

    // Actions
    // @ts-ignore
    const addTask = useNeyroStore((state: any) => state.addTask);
    // @ts-ignore
    const toggleTask = useNeyroStore((state: any) => state.toggleTask);
    // @ts-ignore
    const deleteTask = useNeyroStore((state: any) => state.deleteTask);
    // @ts-ignore
    const deleteArea = useNeyroStore((state: any) => state.deleteArea);
    // @ts-ignore
    const addArea = useNeyroStore((state: any) => state.addArea); // For sub-areas
    // @ts-ignore
    const addProject = useNeyroStore((state: any) => state.addProject);
    // @ts-ignore
    const addResource = useNeyroStore((state: any) => state.addResource); // For pinned resources
    // @ts-ignore
    const updateAreaScore = useNeyroStore((state: any) => state.updateAreaScore);

    const [area, setArea] = useState<Area | null>(null);
    const [subAreaTitle, setSubAreaTitle] = useState('');
    const [isCreatingSubArea, setIsCreatingSubArea] = useState(false);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [isAddingResource, setIsAddingResource] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (id && areas.length > 0) {
            const found = areas.find((a: any) => a.id === id);
            setArea(found || null);
        }
    }, [id, areas]);

    // Data Derivation
    const descendantIds = useMemo(() => area ? getDescendantIds(area.id, areas) : [], [area, areas]);
    const scopeIds = useMemo(() => area ? [area.id, ...descendantIds] : [], [area, descendantIds]);

    const subAreas = areas.filter((a: Area) => a.parentId === id);
    const linkedProjects = activeProjects.filter((p: Project) => p.areaId === id);
    const pinnedResources = resources.filter((r: Resource) => r.areaId === id);

    // "Pulse Feed" - Items relevant to this area OR its children
    const pulseTasks = tasks.filter((t: Task) => t.parentId && scopeIds.includes(t.parentId) && t.parentType === 'area')
        .sort((a: Task, b: Task) => b.updatedAt - a.updatedAt)
        .slice(0, 10);

    const pulseProjects = activeProjects.filter((p: Project) => p.areaId && scopeIds.includes(p.areaId))
        .sort((a: Project, b: Project) => b.updatedAt - a.updatedAt)
        .slice(0, 5);

    // AI Insight logic
    const aiInsight = area ? getAreaInsight(area, linkedProjects, pulseTasks, subAreas) : { text: "Analyzing...", action: "Wait" };

    // Handlers
    const handleAddSubArea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subAreaTitle.trim()) return;
        await addArea(subAreaTitle.trim(), '📂', id); // Pass parentId
        setSubAreaTitle('');
        setIsCreatingSubArea(false);
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectTitle.trim()) return;
        await addProject(newProjectTitle.trim(), '', '', id);
        setNewProjectTitle('');
        setIsCreatingProject(false);
    };

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resourceTitle.trim()) return;
        // addResource signature: title, isFolder, parentId, type, sourceUrl, areaId
        await addResource(resourceTitle.trim(), false, null, 'link', null, id);
        setResourceTitle('');
        setIsAddingResource(false);
    };

    const handleDeleteArea = async () => {
        if (confirm('Are you sure you want to delete this Area?')) {
            await deleteArea(id);
            router.push('/areas');
        }
    };

    const handleGeneratePlan = () => {
        alert(`Neyro Agent: Triggering '${aiInsight.action}' workflow... (This would generate specific tasks in the future)`);
        // Future: Call AI, get tasks, insert into tasks list
    };

    if (!area) return <div className="flex h-screen items-center justify-center bg-[#020204]"><Loader2 className="animate-spin text-neutral-500" /></div>;

    const healthScore = area.healthScore || 0;
    const getHealthColor = (score: number) => {
        if (score >= 4) return 'bg-green-500 shadow-[0_0_20px_rgba(74,222,128,0.4)]';
        if (score >= 2) return 'bg-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]';
        return 'bg-red-500 shadow-[0_0_20px_rgba(248,113,113,0.4)]';
    };

    return (
        <div className="flex flex-col h-full max-w-7xl mx-auto space-y-8 pb-24 px-2">

            {/* 1. Header & Navigation */}
            <div className="flex flex-col gap-4">
                <Link href="/areas" className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium w-fit">
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="size-24 rounded-3xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center text-5xl shadow-2xl relative z-10">
                                {/* @ts-ignore */}
                                {area.emoji || '🏔️'}
                            </div>
                            <div className={cn("absolute -bottom-1 -right-1 size-7 rounded-full border-4 border-[#020204] z-20", getHealthColor(healthScore))} />
                            {/* Ambient Glow */}
                            <div className={cn("absolute inset-0 blur-3xl opacity-20 rounded-full", getHealthColor(healthScore))} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-2">{area.title}</h1>
                            <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium tracking-wide uppercase">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                                    <Activity size={12} className="text-indigo-400" />
                                    Life Area
                                </span>
                                <span>•</span>
                                <span>{subAreas.length} Categories</span>
                                <span>•</span>
                                <span>{linkedProjects.length} Active Projects</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={() => updateAreaScore(id, Math.min(5, (healthScore || 0) + 1))} variant="ghost" className="text-neutral-400 hover:text-white">
                            <Shield className="mr-2" size={16} /> Audit
                        </Button>
                        <Button onClick={handleDeleteArea} variant="ghost" className="text-neutral-600 hover:text-red-400">
                            <Trash2 size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. AI Drill Down (Actionable Plan) */}
            <div className="bg-gradient-to-r from-indigo-900/10 to-purple-900/10 border border-indigo-500/10 rounded-2xl p-0.5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-[#0a0a0a]/90 backdrop-blur-sm rounded-[14px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mt-1">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="text-indigo-200 font-bold text-sm mb-1 flex items-center gap-2">
                                Recommended Action Plan
                                <span className="text-[10px] text-indigo-400/60 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">AI Agent</span>
                            </h3>
                            <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
                                {aiInsight.text}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleGeneratePlan} size="sm" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg shadow-indigo-500/20 whitespace-nowrap">
                        <Zap size={14} className="mr-2" />
                        Generate Tasks
                    </Button>
                </div>
            </div>

            {/* 3. Sub-Areas (Unlimited Nesting) */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Layers size={14} /> Sub-Categories
                    </h3>
                    <button onClick={() => setIsCreatingSubArea(true)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                        <Plus size={14} /> New Category
                    </button>
                </div>

                {isCreatingSubArea && (
                    <form onSubmit={handleAddSubArea} className="mb-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-2 max-w-md">
                            <input
                                autoFocus
                                value={subAreaTitle}
                                onChange={e => setSubAreaTitle(e.target.value)}
                                placeholder="E.g. Nutrition, Strength Training..."
                                className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <Button type="submit" size="sm" disabled={!subAreaTitle.trim()}>Add</Button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {subAreas.map((sub: Area) => (
                        <Link key={sub.id} href={`/areas/${sub.id}`}>
                            <div className="group h-full p-4 bg-[#141414] border border-white/5 rounded-2xl hover:bg-[#1a1a1a] hover:border-white/10 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 bg-white/5 blur-xl rounded-full translate-x-4 -translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="size-10 rounded-xl bg-[#222] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                                    {/* @ts-ignore */}
                                    {sub.emoji || '📂'}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors truncate w-full px-2">{sub.title}</h4>
                                    <span className="text-[10px] text-neutral-600 block mt-1">{sub.healthScore || 0}/5 Health</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {subAreas.length === 0 && !isCreatingSubArea && (
                        <div className="col-span-2 md:col-span-1 border border-dashed border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 text-neutral-600 hover:text-neutral-500 transition-colors cursor-pointer" onClick={() => setIsCreatingSubArea(true)}>
                            <FolderClosed size={24} className="opacity-50" />
                            <span className="text-xs font-medium">Add Sub-Category</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

                {/* 4. Left Col: Projects & Pulse */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Active Projects */}
                    <section>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Target className="text-orange-400" size={18} />
                                Active Projects
                            </h3>
                            <button onClick={() => setIsCreatingProject(true)} className="text-xs bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-3 py-1.5 rounded-lg border border-orange-500/20 transition-colors font-medium flex items-center gap-1">
                                <Plus size={14} /> New Project
                            </button>
                        </div>

                        {isCreatingProject && (
                            <form onSubmit={handleAddProject} className="mb-4 bg-[#141414] p-4 rounded-xl border border-white/5 animate-in fade-in">
                                <input
                                    autoFocus
                                    className="w-full bg-transparent border-none text-white text-lg font-bold focus:outline-none mb-4"
                                    placeholder="Project Name..."
                                    value={newProjectTitle}
                                    onChange={e => setNewProjectTitle(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreatingProject(false)}>Cancel</Button>
                                    <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-500 text-white">Create Project</Button>
                                </div>
                            </form>
                        )}

                        <div className="grid gap-3">
                            {linkedProjects.map((project: Project) => (
                                <Link key={project.id} href={`/projects/${project.id}`}>
                                    <div className="group bg-[#141414] border border-white/5 p-4 rounded-xl hover:border-orange-500/30 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-lg">
                                                {/* @ts-ignore */}
                                                {project.emoji || '🚀'}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold group-hover:text-orange-400 transition-colors">{project.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                                                    <span>{project.outcome || 'No outcome defined'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-neutral-700 group-hover:text-orange-400 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                            {linkedProjects.length === 0 && !isCreatingProject && (
                                <div className="p-8 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                                    <p className="text-neutral-500 text-sm">No active projects. Start something new?</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Area Pulse Feed */}
                    <section>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 px-1">
                            <Zap className="text-yellow-400" size={18} />
                            Area Pulse
                            <span className="text-[10px] font-normal text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">Recent Activity</span>
                        </h3>

                        <div className="relative border-l border-white/10 ml-3 space-y-0 pb-2">
                            {/* Mock Aggregated Feed Items */}
                            {pulseProjects.map((p: Project) => (
                                <div key={'pulse-p-' + p.id} className="relative pl-8 pb-8 last:pb-0 group">
                                    <div className="absolute -left-[5px] top-1 size-2.5 rounded-full bg-[#1a1a1a] border border-orange-500 group-hover:scale-125 transition-transform" />
                                    <div className="bg-[#141414] p-4 rounded-xl border border-white/5 hover:bg-[#1a1a1a] transition-colors">
                                        <div className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                            <Activity size={10} /> Project Update
                                        </div>
                                        <div className="text-white text-sm font-medium">Updated "{p.title}"</div>
                                        <div className="text-xs text-neutral-500 mt-2">
                                            {p.status === 'active' ? 'Moving forward with momentum.' : 'Paused for review.'}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {pulseTasks.map((t: Task) => (
                                <div key={'pulse-t-' + t.id} className="relative pl-8 pb-8 last:pb-0 group">
                                    <div className="absolute -left-[5px] top-1 size-2.5 rounded-full bg-[#1a1a1a] border border-green-500 group-hover:scale-125 transition-transform" />
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-neutral-300 line-through decoration-neutral-600">{t.title}</span>
                                        <span className="text-xs text-neutral-600 bg-white/5 px-2 py-0.5 rounded">Task Completed</span>
                                    </div>
                                </div>
                            ))}

                            {pulseProjects.length === 0 && pulseTasks.length === 0 && (
                                <div className="pl-8 text-sm text-neutral-600 italic">No recent activity recorded in this area.</div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 5. Right Col: Knowledge Vault (Pinning) */}
                <div className="space-y-6">
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-neutral-200 flex items-center gap-2 text-sm">
                                <Pin className="text-blue-400" size={16} />
                                Pinned Resources
                            </h3>
                            <button onClick={() => setIsAddingResource(true)} className="text-xs text-blue-400 hover:text-blue-300 hover:underline">Add</button>
                        </div>

                        {isAddingResource && (
                            <form onSubmit={handleAddResource} className="mb-4">
                                <div className="flex gap-1">
                                    <input
                                        autoFocus
                                        value={resourceTitle}
                                        onChange={e => setResourceTitle(e.target.value)}
                                        placeholder="Paste URL or Title..."
                                        className="w-full bg-neutral-900/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <Button type="submit" size="sm" className="h-auto py-1 px-2 text-xs">Pin</Button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {pinnedResources.map((r: Resource) => (
                                <div key={r.id} className="group flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                                    <div className="mt-0.5 size-6 rounded bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 group-hover:text-white">
                                        {r.type === 'link' ? '🔗' : '📄'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-neutral-300 group-hover:text-blue-400 transition-colors truncate">{r.title}</div>
                                        <div className="text-[10px] text-neutral-600 mt-1 truncate">{r.summary || r.sourceUrl || "No details"}</div>
                                    </div>
                                </div>
                            ))}
                            {pinnedResources.length === 0 && !isAddingResource && (
                                <div className="text-center py-8 px-4 text-xs text-neutral-600 bg-white/[0.02] rounded-xl border border-dashed border-white/5">
                                    Pin important docs, links, or notes here for quick access.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
