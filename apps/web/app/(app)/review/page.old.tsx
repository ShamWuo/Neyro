'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { RefreshCw, Inbox, Folder, Layers, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '../components/Card';
import { cn } from '@/lib/utils';
import { Project, Area, InboxItem } from '@mobile/database/schema';

type Step = 'intro' | 'inbox' | 'projects' | 'areas' | 'summary';

export default function ReviewPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('intro');
    const [scores, setScores] = useState<Record<string, number>>({});

    // @ts-ignore
    const inbox = useNeyroStore((state: any) => state.inbox || []);
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-ignore
    const areas = useNeyroStore((state: any) => state.areas || []);
    // @ts-ignore
    const updateProject = useNeyroStore((state: any) => state.updateProject);
    // @ts-ignore
    const updateAreaScore = useNeyroStore((state: any) => state.updateAreaScore);
    // @ts-ignore
    const classifyItem = useNeyroStore((state: any) => state.classifyItem);
    // @ts-ignore
    const loadData = useNeyroStore((state: any) => state.loadData);

    const nextStep = () => {
        switch (step) {
            case 'intro': setStep('inbox'); break;
            case 'inbox': setStep('projects'); break;
            case 'projects': setStep('areas'); break;
            case 'areas': setStep('summary'); break;
            case 'summary': 
                loadData();
                router.push('/');
                break;
        }
    };

    const prevStep = () => {
        switch (step) {
            case 'inbox': setStep('intro'); break;
            case 'projects': setStep('inbox'); break;
            case 'areas': setStep('projects'); break;
            case 'summary': setStep('areas'); break;
        }
    };

    const handleClassify = async (itemId: string, destination: 'project' | 'area' | 'resource' | 'archive') => {
        await classifyItem(itemId, destination);
        loadData();
    };

    const handleScoreChange = async (areaId: string, score: number) => {
        setScores({ ...scores, [areaId]: score });
        await updateAreaScore(areaId, score);
    };

    const handleCompleteProject = async (projectId: string) => {
        await updateProject(projectId, { status: 'completed', completedAt: Date.now() });
        loadData();
    };

    const renderContent = () => {
        switch (step) {
            case 'intro':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                        <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center">
                            <RefreshCw className="size-12 text-primary" />
                        </div>
                        <h2 className="text-4xl font-bold text-white">Weekly Review</h2>
                        <p className="text-neutral-400 text-lg max-w-md">
                            "You can't do everything. But you can do the right things."
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <span className="text-neutral-400">⏱️</span>
                            <span className="text-sm text-neutral-400">~10 mins</span>
                        </div>
                    </div>
                );

            case 'inbox':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Inbox className="size-8 text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Clear Your Inbox</h2>
                                <p className="text-neutral-400">Process {inbox.length} unprocessed items</p>
                            </div>
                        </div>

                        {inbox.length === 0 ? (
                            <Card>
                                <div className="text-center py-8">
                                    <CheckCircle2 className="size-12 text-green-400 mx-auto mb-4" />
                                    <p className="text-white font-semibold">Inbox is clear!</p>
                                    <p className="text-neutral-400 text-sm mt-2">Nothing to process.</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {inbox.map((item: InboxItem) => (
                                    <Card key={item.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-white font-medium mb-2">{item.content}</p>
                                                <p className="text-xs text-neutral-500">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleClassify(item.id, 'project')}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-xs"
                                                >
                                                    Project
                                                </Button>
                                                <Button
                                                    onClick={() => handleClassify(item.id, 'area')}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-xs"
                                                >
                                                    Area
                                                </Button>
                                                <Button
                                                    onClick={() => handleClassify(item.id, 'resource')}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-xs"
                                                >
                                                    Resource
                                                </Button>
                                                <Button
                                                    onClick={() => handleClassify(item.id, 'archive')}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-xs text-red-400"
                                                >
                                                    Archive
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'projects':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Folder className="size-8 text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Review Projects</h2>
                                <p className="text-neutral-400">Mark completed or pause inactive ones</p>
                            </div>
                        </div>

                        {activeProjects.length === 0 ? (
                            <Card>
                                <div className="text-center py-8">
                                    <p className="text-neutral-400">No active projects</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {activeProjects.map((project: Project) => (
                                    <Card key={project.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold mb-1">{project.title}</h3>
                                                {project.description && (
                                                    <p className="text-sm text-neutral-400 mb-2">{project.description}</p>
                                                )}
                                                {project.outcome && (
                                                    <p className="text-xs text-neutral-500">Outcome: {project.outcome}</p>
                                                )}
                                            </div>
                                            <Button
                                                onClick={() => handleCompleteProject(project.id)}
                                                size="sm"
                                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
                                            >
                                                Complete
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'areas':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Layers className="size-8 text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Assess Life Areas</h2>
                                <p className="text-neutral-400">Rate each area from 1-5</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {areas.map((area: Area) => (
                                <Card key={area.id} className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {area.emoji && <span className="text-2xl">{area.emoji}</span>}
                                            <h3 className="text-white font-semibold">{area.title}</h3>
                                        </div>
                                        <div className="text-2xl font-bold text-primary">
                                            {scores[area.id] || area.healthScore || 0}/5
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((score) => (
                                            <button
                                                key={score}
                                                onClick={() => handleScoreChange(area.id, score)}
                                                className={cn(
                                                    "flex-1 py-2 rounded-lg border transition-all font-semibold",
                                                    (scores[area.id] || area.healthScore || 0) >= score
                                                        ? "bg-primary/20 border-primary text-primary"
                                                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                                                )}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );

            case 'summary':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                        <div className="size-24 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="size-12 text-green-400" />
                        </div>
                        <h2 className="text-4xl font-bold text-white">Review Complete!</h2>
                        <p className="text-neutral-400 text-lg max-w-md">
                            You've processed your inbox, reviewed projects, and assessed your life areas.
                            You're ready for the week ahead.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    {['intro', 'inbox', 'projects', 'areas', 'summary'].map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={cn(
                                "size-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                step === s ? "bg-primary text-white" : 
                                ['intro', 'inbox', 'projects', 'areas', 'summary'].indexOf(step) > i 
                                    ? "bg-green-500 text-white" 
                                    : "bg-white/10 text-neutral-400"
                            )}>
                                {i + 1}
                            </div>
                            {i < 4 && (
                                <div className={cn(
                                    "w-12 h-1 mx-1 transition-all",
                                    ['intro', 'inbox', 'projects', 'areas', 'summary'].indexOf(step) > i
                                        ? "bg-green-500"
                                        : "bg-white/10"
                                )} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            {renderContent()}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <Button
                    onClick={prevStep}
                    variant="ghost"
                    disabled={step === 'intro'}
                    className="text-neutral-400"
                >
                    <ArrowLeft className="size-4 mr-2" />
                    Previous
                </Button>
                <Button
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90 text-white"
                >
                    {step === 'summary' ? 'Finish' : 'Next'}
                    <ArrowRight className="size-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
