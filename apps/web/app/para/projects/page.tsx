'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoStore, Project } from '@/store/demo-store';
import { Folder, Search, Filter, Plus, Calendar, CheckSquare, X, Hash, Target, Circle, Bookmark, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';

export default function ProjectsPage() {
    const { projects } = useDemoStore();
    const [search, setSearch] = useState('');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="h-full flex flex-col md:flex-row relative animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards">

            {/* Main List */}
            <div className={cn("flex-1 px-8 lg:px-12 py-8 space-y-8 transition-all duration-300", selectedProject ? "md:max-w-[calc(100%-400px)]" : "")}>

                {/* Header & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[32px] font-display text-primary tracking-normal mb-1">Projects</h1>
                        <p className="text-[15px] text-secondary">Things with a finish line.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 h-9 bg-card border border-border rounded-input text-[13px] text-primary placeholder:text-text-placeholder w-48 focus:outline-none focus:border-border-strong transition-colors"
                            />
                        </div>
                        <Button variant="secondary" size="icon">
                            <Filter size={14} />
                        </Button>
                        <Button className="gap-2 text-[13px]">
                            <Plus size={14} /> New Project
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredProjects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedProject(project)}
                        >
                            <Card
                                hoverEffect
                                className={cn(
                                    "cursor-pointer h-full flex flex-col",
                                    selectedProject?.id === project.id ? "border-accent ring-1 ring-accent/20 bg-accent-light/5" : ""
                                )}
                            >
                                <CardContent className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="text-secondary">
                                            <Folder size={18} />
                                        </div>
                                        <Badge category={
                                            project.status === 'Active' ? 'projects' :
                                                project.status === 'Stalled' ? 'resources' : 'default'
                                        }>
                                            {project.status}
                                        </Badge>
                                    </div>

                                    <h3 className="text-[15px] font-medium text-primary mb-3 leading-tight pr-4">{project.title}</h3>

                                    <div className="flex items-center gap-4 text-[12px] font-medium text-text-muted mb-6">
                                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {project.dueDate || 'No Date'}</span>
                                        <span className="flex items-center gap-1.5"><CheckSquare size={12} /> {project.tasksCount} tasks</span>
                                    </div>

                                    <div className="space-y-2 mt-auto">
                                        <div className="flex justify-between text-[11px] font-mono">
                                            <span className="text-secondary">{project.progress}% completed</span>
                                        </div>
                                        <Progress value={project.progress} indicatorColor="bg-accent" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-20">
                        <Folder className="mx-auto text-border-strong mb-4" size={32} strokeWidth={1.5} />
                        <h3 className="text-[15px] font-medium text-primary">No projects found</h3>
                        <p className="text-[13px] text-secondary mt-1">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>

            {/* Smart Detail Panel */}
            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: '400px' }}
                        exit={{ opacity: 0, x: 20, width: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="hidden md:block shrink-0 bg-card border-l border-border overflow-y-auto h-[calc(100vh-3.5rem)] sticky top-0 custom-scrollbar"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="text-accent">
                                    <Folder size={20} />
                                </div>
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="p-1 hover:bg-hover text-text-muted hover:text-primary rounded-button transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge category={
                                        selectedProject.status === 'Active' ? 'projects' :
                                            selectedProject.status === 'Stalled' ? 'resources' : 'default'
                                    }>
                                        {selectedProject.status}
                                    </Badge>
                                    <span className="text-[11px] text-text-muted font-mono flex items-center gap-1">
                                        <Hash size={10} /> PRJ-{selectedProject.id}
                                    </span>
                                </div>
                                <h2 className="text-[28px] font-display text-primary leading-tight tracking-normal">
                                    {selectedProject.title}
                                </h2>
                            </div>

                            {/* AI Summary / Context */}
                            <div className="bg-subtle border border-border p-5 rounded-card mb-8 aspect-auto relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-light rounded-t-card" />
                                <div className="flex items-center gap-2 mb-2.5 text-[11px] font-semibold text-accent uppercase tracking-[0.06em]">
                                    <Sparkles size={12} /> Neyro Intelligence
                                </div>
                                <p className="text-[13px] text-secondary leading-relaxed">
                                    This project is moving along well, but you have 2 tasks that are blocking progress. Consider delegating the "Create Wireframes" task to free up your bandwidth.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Tasks Area */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
                                        <span className="flex items-center gap-2">
                                            <CheckSquare size={14} /> Up Next
                                        </span>
                                        <button className="text-text-muted hover:text-primary transition-colors"><Plus size={14} /></button>
                                    </div>
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(task => (
                                            <div key={task} className="flex items-start gap-3 py-2 border-b border-border/50 group cursor-pointer last:border-0">
                                                <button className="mt-0.5 text-border-strong hover:text-accent transition-colors shrink-0">
                                                    <Circle size={14} />
                                                </button>
                                                <span className="text-[13px] text-primary group-hover:text-accent transition-colors leading-relaxed">
                                                    Draft section {task} for the {selectedProject.title} document and review with team
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resource Links */}
                                <div>
                                    <div className="flex items-center justify-between mb-4 text-[11px] font-semibold text-text-muted uppercase tracking-[0.06em]">
                                        <span className="flex items-center gap-2">
                                            <Bookmark size={14} /> Connected Resources
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-card border border-border rounded-card flex gap-3 cursor-pointer hover:border-border-strong transition-colors">
                                            <div className="text-text-muted shrink-0 mt-0.5">
                                                <Target size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-medium text-primary">Figma Design System setup requirements</p>
                                                <p className="text-[11px] text-text-muted mt-1">Note • Added 2 days ago</p>
                                            </div>
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
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        className="fixed inset-0 z-50 bg-bg-card md:hidden p-6 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[24px] font-display text-primary">{selectedProject.title}</h2>
                            <button onClick={() => setSelectedProject(null)} className="p-2 border border-border rounded-button"><X size={16} /></button>
                        </div>
                        <div className="text-secondary text-[13px]">Mobile view simplified.</div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
