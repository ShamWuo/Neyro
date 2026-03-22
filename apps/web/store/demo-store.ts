import { create } from 'zustand';

export type PARACategory = 'projects' | 'areas' | 'resources' | 'archive';

export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
}

export interface Project {
    id: string;
    title: string;
    status: 'Active' | 'Stalled' | 'Completed' | 'Archived' | 'Paused';
    progress: number;
    dueDate: string | null;
    tasksCount: number;
    tasks?: Task[];
}

export interface Area {
    id: string;
    name: string;
    score: number;
    insight: string;
}

export interface Capture {
    id: string;
    content: string;
    category: PARACategory | string; // Could be specific area like 'Areas (Relationships)'
    timestamp: Date;
}

export interface Habit {
    id: string;
    name: string;
    completedDays: number; // out of 30
    streak: number;
}

interface DemoState {
    momentumScore: number;
    projects: Project[];
    areas: Area[];
    captures: Capture[];
    habits: Habit[];

    isCaptureOpen: boolean;
    setCaptureOpen: (open: boolean) => void;

    // Actions
    addCapture: (capture: Omit<Capture, 'id' | 'timestamp'>) => void;
    addProject: (project: Omit<Project, 'id' | 'tasksCount'>) => void;
    addArea: (area: Omit<Area, 'id'>) => void;
    markTaskDone: () => void;
    toggleTask: (projectId: string, taskId: string) => void;
    setMomentumScore: (score: number) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
    isCaptureOpen: false,
    setCaptureOpen: (open) => set({ isCaptureOpen: open }),
    momentumScore: 87,
    projects: [
        { 
            id: '1', title: 'Investor Pitch Deck', status: 'Active', progress: 65, dueDate: 'Mar 1', tasksCount: 3,
            tasks: [
                { id: 't1', title: 'Draft traction slides', completed: false },
                { id: 't2', title: 'Review financials with Sarah', completed: true },
                { id: 't3', title: 'Update market size data', completed: false },
            ]
        },
        { 
            id: '2', title: 'Neyro Website Launch', status: 'Active', progress: 40, dueDate: 'Mar 15', tasksCount: 6,
            tasks: [
                { id: 't4', title: 'Finalize copy for landing page', completed: false },
                { id: 't5', title: 'Fix mobile responsiveness issues', completed: false },
            ]
        },
        { id: '3', title: 'Health Routine Overhaul', status: 'Stalled', progress: 20, dueDate: null, tasksCount: 2, tasks: [] },
        { id: '4', title: 'Book: Deep Work Summary', status: 'Active', progress: 80, dueDate: null, tasksCount: 1, tasks: [] },
        { id: '5', title: 'Freelance Client Proposal', status: 'Stalled', progress: 10, dueDate: 'Feb 28', tasksCount: 4, tasks: [] },
        { id: '6', title: 'Learn TypeScript', status: 'Active', progress: 55, dueDate: null, tasksCount: 5, tasks: [] },
        { id: '7', title: 'Move to New Apartment', status: 'Active', progress: 30, dueDate: 'Apr 1', tasksCount: 8, tasks: [] },
    ],
    areas: [
        { id: 'a1', name: 'Health', score: 72, insight: 'Down slightly this week' },
        { id: 'a2', name: 'Career', score: 92, insight: 'Strong — most active area' },
        { id: 'a3', name: 'Finance', score: 61, insight: 'Stable but undertracked' },
        { id: 'a4', name: 'Relationships', score: 38, insight: 'Needs attention — 9 days quiet' },
        { id: 'a5', name: 'Creativity', score: 79, insight: 'Good energy this week' },
        { id: 'a6', name: 'Personal Growth', score: 65, insight: 'Consistent' },
    ],
    captures: [
        { id: 'c1', content: 'Need to prep 3 slides about traction for the pitch', category: 'Projects', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { id: 'c2', content: 'Article on sleep and productivity — save for later', category: 'Resources', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
        { id: 'c3', content: 'Call mom this week, haven\'t spoken in a while', category: 'Areas (Relationships)', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
        { id: 'c4', content: 'Finish the proposal draft before end of week', category: 'Projects', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26) },
        { id: 'c5', content: 'Interesting idea: Neyro could score your week like a game', category: 'Resources', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30) },
        { id: 'c6', content: 'Budget review overdue — check subscriptions', category: 'Areas (Finance)', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) },
        { id: 'c7', content: 'Pick up dry cleaning Tuesday', category: 'Projects', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52) },
        { id: 'c8', content: 'Read: How habits compound over time — James Clear', category: 'Resources', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 60) },
        { id: 'c9', content: 'Weekly review prep: flag the website project as stalled', category: 'Projects', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 65) },
        { id: 'c10', content: 'Felt really low energy today — need to track this', category: 'Areas (Health)', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 70) },
    ],
    habits: [
        { id: 'h1', name: 'Daily capture', completedDays: 28, streak: 5 },
        { id: 'h2', name: 'Morning review', completedDays: 18, streak: 2 },
        { id: 'h3', name: 'Exercise', completedDays: 14, streak: 0 },
        { id: 'h4', name: 'Deep work block', completedDays: 20, streak: 4 },
        { id: 'h5', name: 'Evening check-in', completedDays: 12, streak: 1 },
    ],

    addCapture: (capture) => set((state) => ({
        captures: [{ id: Date.now().toString(), ...capture, timestamp: new Date() }, ...state.captures]
    })),

    addProject: (project) => set((state) => ({
        projects: [
            { 
                id: (state.projects.length + 1).toString(), 
                ...project, 
                tasksCount: 0,
                tasks: [] 
            }, 
            ...state.projects
        ]
    })),

    addArea: (area) => set((state) => ({
        areas: [
            { 
                id: 'a' + (state.areas.length + 1).toString(), 
                ...area 
            }, 
            ...state.areas
        ]
    })),

    markTaskDone: () => set((state) => ({
        momentumScore: state.momentumScore + 2,
    })),

    toggleTask: (projectId, taskId) => set((state) => ({
        projects: state.projects.map(p => 
            p.id === projectId 
                ? { 
                    ...p, 
                    tasks: p.tasks?.map(t => 
                        t.id === taskId ? { ...t, completed: !t.completed } : t
                    ) 
                } 
                : p
        )
    })),

    setMomentumScore: (score) => set({ momentumScore: score }),
}));
