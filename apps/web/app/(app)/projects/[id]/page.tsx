'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { Project } from '@mobile/database/schema';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    MoreVertical,
    Loader2,
    Rocket,
    Target,
    ListTodo,
    ChevronLeft,
    Plus,
    Trash2,
    Users,
    Activity,
    Brain,
    Sparkles,
    FileText,
    Link as LinkIcon,
    Zap,
    Archive
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { PredictiveAnalyticsService } from '@mobile/services/predictiveAnalyticsService';
import { toast } from 'sonner';

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Store Hooks
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-ignore
    const pausedProjects = useNeyroStore((state: any) => state.pausedProjects || []);
    // @ts-ignore
    const tasks = useNeyroStore((state: any) => state.tasks || []);
    // @ts-ignore
    const notes = useNeyroStore((state: any) => state.notes || []);
    // @ts-ignore
    const addTask = useNeyroStore((state: any) => state.addTask);
    // @ts-ignore
    const toggleTask = useNeyroStore((state: any) => state.toggleTask);
    // @ts-ignore
    const deleteTask = useNeyroStore((state: any) => state.deleteTask);
    // @ts-ignore
    const saveNote = useNeyroStore((state: any) => state.saveNote);
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);
    // @ts-ignore
    const isLoading = useNeyroStore((state: any) => state.isLoading);
    // @ts-ignore
    const updateProject = useNeyroStore((state: any) => state.updateProject);
    // @ts-ignore
    const deleteProject = useNeyroStore((state: any) => state.deleteProject);

    // State
    const [project, setProject] = useState<Project | null>(null);
    const [velocity, setVelocity] = useState<{ velocity: number; trend: string } | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [scratchpadOpen, setScratchpadOpen] = useState(false);
    const [scratchpadContent, setScratchpadContent] = useState('');

    // Derived Data
    const projectTasks = tasks.filter((t: any) => t.parentId === id && t.parentType === 'project');
    const incompleteTasks = projectTasks.filter((t: any) => !t.isCompleted);
    const completedTasks = projectTasks.filter((t: any) => t.isCompleted);
    const completedCount = completedTasks.length;
    const progress = projectTasks.length > 0 ? completedCount / projectTasks.length : 0;

    // "Next Action" is the topmost incomplete task
    const nextAction = incompleteTasks.length > 0 ? incompleteTasks[0] : null;

    const projectNotes = notes.filter((n: any) => n.parentId === id && n.parentType === 'project');
    const projectScratchpad = projectNotes.find((n: any) => n.title === 'Project Scratchpad' || n.title === 'Project Note');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (id) {
            const found = [...activeProjects, ...pausedProjects].find(p => p.id === id);
            if (found) {
                setProject(found);
            }
        }
    }, [id, activeProjects, pausedProjects]);

    useEffect(() => {
        if (projectScratchpad) {
            setScratchpadContent(projectScratchpad.content || '');
        }
    }, [projectScratchpad]);

    useEffect(() => {
        const loadVelocity = async () => {
            if (id) {
                const data = await PredictiveAnalyticsService.calculateProjectVelocity(id);
                setVelocity(data);
            }
        };
        loadVelocity();
    }, [id]);

    const handleAddTask = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newTaskTitle.trim() || !id) return;
        await addTask(newTaskTitle.trim(), id, 'project');
        setNewTaskTitle('');
    };

    const handleSaveScratchpad = async () => {
        if (!id) return;
        await saveNote(id, 'project', scratchpadContent, 'Project Scratchpad');
    };

    const handleAction = async (action: 'complete' | 'pause' | 'active' | 'delete') => {
        if (!project) return;

        if (action === 'delete') {
            if (confirm('Are you sure you want to delete this project?')) {
                const success = await deleteProject(project.id);
                if (success) {
                    toast.success('Project deleted successfully.');
                    router.push('/projects');
                } else {
                    toast.error('Failed to delete project.');
                }
            }
        } else if (action === 'complete') {
            await updateProject(project.id, { status: 'completed', completedAt: Date.now() });
            toast.success('Project completed and moved to archive.');
            router.push('/projects');
        } else if (action === 'pause') {
            await updateProject(project.id, { status: 'paused' });
            toast.info('Project paused.');
            router.push('/projects');
        } else if (action === 'active') {
            await updateProject(project.id, { status: 'active' });
            toast.success('Project has been resumed.');
        }
    };

    if (isLoading && !project) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (!project && !isLoading) return <div className="text-center py-20 text-neutral-400">Project not found</div>;
    // @ts-ignore
    if (!project) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Nav & Header */}
            <div className="space-y-4">
                <Link
                    href="/projects"
                    className="inline-flex items-center text-neutral-500 hover:text-white transition-colors group text-sm font-medium"
                >
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Projects
                </Link>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-2xl">
                            {/* @ts-ignore */}
                            {project.emoji || '🚀'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{project.title}</h1>
                            <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                                <span className={cn("px-2 py-0.5 rounded uppercase tracking-wider",
                                    project.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-neutral-400'
                                )}>
                                    {project.status}
                                </span>
                                {project.deadline && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} className={new Date(project.deadline) < new Date() ? "text-red-400" : ""} />
                                        <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <ListTodo size={12} />
                                    <span>{completedCount}/{projectTasks.length} Tasks</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mock Collaborators */}
                        <div className="flex -space-x-2 mr-4">
                            <div className="size-8 rounded-full border-2 border-[#020204] bg-neutral-700 flex items-center justify-center text-xs text-white" title="You">me</div>
                            <div className="size-8 rounded-full border-2 border-[#020204] bg-indigo-500 flex items-center justify-center text-xs text-white" title="Alex">AC</div>
                        </div>

                        {project.status === 'active' && (
                            <>
                                <Button onClick={() => handleAction('pause')} size="sm" variant="ghost" className="text-neutral-400 hover:text-white border border-white/10 hover:bg-white/5">Pause</Button>
                                <Button onClick={() => handleAction('complete')} size="sm" className="bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white border border-green-600/20">Complete</Button>
                            </>
                        )}
                        {project.status === 'paused' && (
                            <Button onClick={() => handleAction('active')} size="sm" className="bg-primary/20 text-primary hover:bg-primary hover:text-white border-none">Resume</Button>
                        )}
                        <Button onClick={() => handleAction('delete')} size="sm" variant="ghost" className="text-neutral-500 hover:text-red-400 hover:bg-red-400/10"><Trash2 size={16} /></Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: ACTION & TASKS */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Next Action Hero Card */}
                    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-[#0f0a14] to-[#0f0a14] border border-primary/20 p-8 shadow-[0_0_30px_-10px_rgba(255,106,0,0.15)]">
                        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-primary/20 transition-all duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs mb-4">
                                <Zap className="w-4 h-4 animate-pulse" />
                                Next Action
                            </div>

                            {nextAction ? (
                                <div>
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => toggleTask(nextAction.id)}
                                            className="mt-1 size-8 rounded-xl border-2 border-primary/50 hover:bg-primary hover:border-primary flex items-center justify-center transition-all group/check"
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-transparent group-hover/check:text-white transition-colors" />
                                        </button>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white leading-tight mb-2">{nextAction.title}</h3>
                                            <p className="text-neutral-400 text-sm">
                                                Based on GTD, this is the most critical step to move <strong>{project.title}</strong> forward.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
                                    <p className="text-neutral-400 text-sm">No tasks pending. Add a new action to keep momentum.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <ListTodo size={20} className="text-neutral-400" />
                                Project Tasks
                            </h3>
                            <span className="text-xs text-neutral-500 font-mono">
                                {Math.round(progress * 100)}% Done
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
                                style={{ width: `${progress * 100}%` }}
                            />
                        </div>

                        <div className="bg-[#0f0a14] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                            {/* Add Task */}
                            <form onSubmit={handleAddTask} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors focus-within:bg-white/5">
                                <Plus className="text-neutral-500" />
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Add a new task..."
                                    className="flex-1 bg-transparent focus:outline-none text-white placeholder:text-neutral-600"
                                />
                                <Button type="submit" disabled={!newTaskTitle.trim()} size="sm" className="h-8">Add</Button>
                            </form>

                            {/* Incomplete Tasks (Skipping first one if displayed as Next Action) */}
                            {incompleteTasks.slice(nextAction ? 1 : 0).map((task: any) => (
                                <div key={task.id} className="group flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className="size-5 rounded-md border border-neutral-600 hover:border-primary flex items-center justify-center"
                                    >
                                        {/* unchecked */}
                                    </button>
                                    <span className="text-neutral-300 font-medium flex-1">{task.title}</span>
                                    <button onClick={() => deleteTask(task.id)} className="text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Completed Tasks */}
                            {completedTasks.length > 0 && (
                                <div className="bg-black/20">
                                    <div className="px-4 py-2 text-xs font-bold text-neutral-600 uppercase tracking-wider">Completed</div>
                                    {completedTasks.map((task: any) => (
                                        <div key={task.id} className="group flex items-center gap-4 p-4 hover:bg-white/5 transition-colors opacity-50">
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className="size-5 rounded-md bg-primary border border-primary flex items-center justify-center text-white"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <span className="text-neutral-400 line-through flex-1">{task.title}</span>
                                            <button onClick={() => deleteTask(task.id)} className="text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: KNOWLEDGE & COLLAB */}
                <div className="space-y-8">

                    {/* Project Brain / Scratchpad */}
                    <div className="bg-[#0f0a14] border border-white/5 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Brain className="text-indigo-400" size={18} />
                                Project Brain
                            </h3>
                            <button onClick={handleSaveScratchpad} className="text-xs text-primary hover:underline">Save Note</button>
                        </div>
                        <textarea
                            value={scratchpadContent}
                            onChange={(e) => setScratchpadContent(e.target.value)}
                            onBlur={handleSaveScratchpad}
                            className="w-full bg-white/5 rounded-xl border border-white/5 p-4 text-sm text-neutral-300 min-h-[150px] focus:outline-none focus:border-white/10 resize-none mb-4"
                            placeholder="Type notes, links, or ideas here..."
                        />

                        {/* Linked Resources List (Mock + Real) */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Resources</div>

                            {projectNotes.length > 0 && projectNotes.filter((n: any) => n.title !== 'Project Scratchpad').map((note: any) => (
                                <div key={note.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer group transition-colors">
                                    <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <FileText size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{note.title}</div>
                                        <div className="text-[10px] text-neutral-500">Note • {new Date(note.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}

                            <button onClick={async () => {
                                const title = prompt("Enter Resource Title:");
                                if (title) {
                                    await saveNote(id!, 'project', '', title);
                                    // @ts-ignore
                                    useNeyroStore.getState().loadData();
                                }
                            }} className="w-full py-2 border border-dashed border-white/10 rounded-xl text-xs text-neutral-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
                                <Plus size={14} />
                                Link Area or Resource
                            </button>
                        </div>
                    </div>

                    {/* Activity Feed (Mock) */}
                    <div className="pl-2">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm">
                            <Activity className="text-neutral-500" size={16} />
                            Activity Feed
                        </h3>
                        <div className="space-y-6 relative border-l border-white/10 ml-2 pl-6 pb-2">
                            {/* Item 1 */}
                            <div className="relative">
                                <div className="absolute -left-[31px] bg-[#020204] text-primary rounded-full p-1 border border-white/10">
                                    <Sparkles size={12} />
                                </div>
                                <div className="text-sm text-neutral-300">
                                    <span className="text-primary font-bold">AI Helper</span> auto-sorted 2 links from Inbox to <span className="text-white font-medium">Resources</span>.
                                </div>
                                <div className="text-[10px] text-neutral-600 mt-1">2 hours ago</div>
                            </div>
                            {/* Item 2 */}
                            <div className="relative">
                                <div className="absolute -left-[31px] bg-[#020204] text-indigo-400 rounded-full p-1 border border-white/10">
                                    <Users size={12} />
                                </div>
                                <div className="text-sm text-neutral-300">
                                    <span className="text-indigo-400 font-bold">Alex (You)</span> completed 3 tasks.
                                </div>
                                <div className="text-[10px] text-neutral-600 mt-1">5 hours ago</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
