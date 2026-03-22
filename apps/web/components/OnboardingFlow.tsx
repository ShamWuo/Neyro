'use client';

import { useState, useSyncExternalStore } from 'react';
import { 
    Sparkles, 
    Inbox, 
    Folder, 
    Zap, 
    CheckCircle2, 
    ArrowRight, 
    X,
    Rocket,
    Target
} from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { useNeyroStore, NeyroState } from '@mobile/store/useNeyroStore';
import { DemoDataService } from '@/services/demoDataService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type OnboardingStep = 'welcome' | 'capture' | 'process' | 'project' | 'focus' | 'review' | 'complete';

interface OnboardingFlowProps {
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export function OnboardingFlow({ isOpen, onComplete, onSkip }: OnboardingFlowProps) {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
    const router = useRouter();
    
    const loadData = useNeyroStore((state: NeyroState) => state.loadData);

    const hasSeenOnboarding = useSyncExternalStore(
        () => () => {},
        () => typeof window !== 'undefined' ? localStorage.getItem('neyro_onboarding_seen') === 'true' : true,
        () => true
    );

    const handleNext = () => {
        const steps: OnboardingStep[] = ['welcome', 'capture', 'process', 'project', 'focus', 'review', 'complete'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('neyro_onboarding_seen', 'true');
        }
        onComplete();
    };

    const handleGenerateDemo = async () => {
        await DemoDataService.generateDemoData({
            includeProjects: true,
            includeAreas: true,
            includeResources: true,
            includeInboxItems: true,
        });
        await loadData();
        toast.success('Demo data generated!');
    };

    if (!isOpen || hasSeenOnboarding) return null;

    const steps = [
        {
            id: 'welcome' as OnboardingStep,
            title: 'Welcome to Neyro',
            description: 'Your AI-powered productivity system built on PARA and GTD',
            icon: Sparkles,
            content: (
                <div className="space-y-4">
                    <p className="text-[#82330c]">
                        Neyro helps you organize your life into an action-ready structure. Let&apos;s walk through the core workflow.
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={handleGenerateDemo} className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                            Generate Demo Data
                        </Button>
                        <Button onClick={onSkip} variant="ghost" className="flex-1">
                            Skip Tour
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: 'capture' as OnboardingStep,
            title: '1. Capture Everything',
            description: 'Quick Capture (⌘K) - Dump thoughts instantly',
            icon: Inbox,
            content: (
                <div className="space-y-4">
                    <p className="text-[#82330c]">
                        Use Quick Capture to instantly save any thought, task, or idea. Press <kbd className="px-2 py-1 bg-[#ffdea5]/30 rounded text-xs text-[#82330c]">⌘K</kbd> or click the floating button.
                    </p>
                    <div className="bg-[#ffdea5]/20 rounded-lg p-4 border border-[#ffdea5]">
                        <p className="text-sm text-[#82330c] mb-2">Try it now:</p>
                        <Button 
                            onClick={() => {
                                // @ts-expect-error - setCaptureVisible is a custom state method for demo purposes
                                useNeyroStore.getState().setCaptureVisible(true);
                            }}
                            className="w-full bg-primary/20 hover:bg-primary/30 text-primary"
                        >
                            Open Quick Capture
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            id: 'process' as OnboardingStep,
            title: '2. Process Your Inbox',
            description: 'Review and decide on each item',
            icon: Target,
            content: (
                <div className="space-y-4">
                    <p className="text-[#82330c]">
                        Your inbox is where clarity happens. Review items, see time insights, and get AI-powered schedules.
                    </p>
                    <Button 
                        onClick={() => {
                            router.push('/inbox');
                            handleNext();
                        }}
                        className="w-full bg-primary/20 hover:bg-primary/30 text-primary"
                    >
                        Go to Inbox →
                    </Button>
                </div>
            ),
        },
        {
            id: 'project' as OnboardingStep,
            title: '3. Create Projects',
            description: 'Turn ideas into actionable projects',
            icon: Folder,
            content: (
                <div className="space-y-4">
                    <p className="text-[#82330c]">
                        Projects are goals with deadlines. Link inbox items to projects or create new ones.
                    </p>
                    <Button 
                        onClick={() => {
                            router.push('/projects');
                            handleNext();
                        }}
                        className="w-full bg-primary/20 hover:bg-primary/30 text-primary"
                    >
                        View Projects →
                    </Button>
                </div>
            ),
        },
        {
            id: 'focus' as OnboardingStep,
            title: '4. Start Focus Blocks',
            description: 'Deep work sessions with timer',
            icon: Zap,
            content: (
                <div className="space-y-4">
                    <p className="text-[#82330c]">
                        Focus Mode helps you do deep work. Select a project or task and start a timed session.
                    </p>
                    <Button 
                        onClick={() => {
                            router.push('/focus');
                            handleNext();
                        }}
                        className="w-full bg-primary/20 hover:bg-primary/30 text-primary"
                    >
                        Start Focus Session →
                    </Button>
                </div>
            ),
        },
        {
            id: 'review' as OnboardingStep,
            title: '5. Weekly Review',
            description: 'Maintain your system weekly',
            icon: CheckCircle2,
            content: (
                <div className="space-y-4">
                    <p className="text-[#82330c]">
                        Weekly reviews keep your system clean. Archive completed projects, review areas, and plan the week ahead.
                    </p>
                    <Button 
                        onClick={() => {
                            router.push('/weekly-review');
                            handleNext();
                        }}
                        className="w-full bg-primary/20 hover:bg-primary/30 text-primary"
                    >
                        Start Weekly Review →
                    </Button>
                </div>
            ),
        },
        {
            id: 'complete' as OnboardingStep,
            title: "You&apos;re All Set!",
            description: 'Start using Neyro to organize your life',
            icon: Rocket,
            content: (
                <div className="space-y-4">
                    <p className="text-[#82330c]">
                        You&apos;ve learned the core workflow: <strong>Capture → Process → Focus → Review</strong>
                    </p>
                    <div className="bg-[#ffdea5]/20 rounded-lg p-4 border border-[#ffdea5] space-y-2">
                        <p className="text-sm font-semibold text-[#461704] mb-2">Quick Tips:</p>
                        <ul className="text-xs text-[#82330c] space-y-1">
                            <li>• Press <kbd className="px-1.5 py-0.5 bg-[#ffdea5]/30 rounded text-[10px] text-[#82330c]">⌘K</kbd> for Quick Capture</li>
                            <li>• Press <kbd className="px-1.5 py-0.5 bg-[#ffdea5]/30 rounded text-[10px] text-[#82330c]">⌘F</kbd> to start Focus</li>
                            <li>• Press <kbd className="px-1.5 py-0.5 bg-[#ffdea5]/30 rounded text-[10px] text-[#82330c]">⌘⇧?</kbd> for shortcuts</li>
                            <li>• Process inbox daily for best results</li>
                        </ul>
                    </div>
                </div>
            ),
        },
    ];

    const currentStepData = steps.find(s => s.id === currentStep);
    const Icon = currentStepData?.icon || Sparkles;
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    const progress = ((stepIndex + 1) / steps.length) * 100;

    return (
        <>
            {isOpen && !hasSeenOnboarding && (
                <>
                    <div
                        className="fixed inset-0 bg-[#461704]/40 backdrop-blur-sm z-[100]"
                        onClick={onSkip}
                    />
                    <div
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#ffdea5] rounded-2xl p-8 max-w-lg w-full mx-4 z-[101]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-[#82330c] uppercase tracking-wider">
                                    Step {stepIndex + 1} of {steps.length}
                                </span>
                                <button
                                    onClick={onSkip}
                                    className="p-1 hover:bg-[#ffdea5]/30 rounded transition-colors"
                                >
                                    <X className="size-4 text-[#82330c]" />
                                </button>
                            </div>
                            <div className="h-1.5 bg-[#ffdea5]/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-center mb-6">
                            <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                <Icon className="size-8 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#461704] mb-2">
                                {currentStepData?.title}
                            </h3>
                            <p className="text-[#82330c]">
                                {currentStepData?.description}
                            </p>
                        </div>

                        <div className="mb-6">
                            {currentStepData?.content}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <Button
                                onClick={() => {
                                    const steps: OnboardingStep[] = ['welcome', 'capture', 'process', 'project', 'focus', 'review', 'complete'];
                                    const currentIndex = steps.indexOf(currentStep);
                                    if (currentIndex > 0) {
                                        setCurrentStep(steps[currentIndex - 1]);
                                    }
                                }}
                                variant="ghost"
                                disabled={currentStep === 'welcome'}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-2">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "size-2 rounded-full transition-all",
                                            i <= stepIndex ? "bg-primary" : "bg-[#ffdea5]"
                                        )}
                                    />
                                ))}
                            </div>
                            <Button
                                onClick={currentStep === 'complete' ? handleComplete : handleNext}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                {currentStep === 'complete' ? 'Get Started' : 'Next'}
                                <ArrowRight className="size-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
