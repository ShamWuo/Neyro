import { create } from 'zustand';

interface TimerState {
    status: 'idle' | 'running' | 'paused';
    elapsed: number;
    startTime: number | null;
    selectedProjectId: string | null;
    selectedTaskId: string | null;
    intervalId: NodeJS.Timeout | number | null;

    start: () => void;
    stop: () => void;
    reset: () => void;
    setSelectedProject: (id: string | null) => void;
    setSelectedTask: (id: string | null) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
    status: 'idle',
    elapsed: 0,
    startTime: null,
    selectedProjectId: null,
    selectedTaskId: null,
    intervalId: null,

    start: () => {
        const { status } = get();
        if (status === 'running') return;

        const intervalId = setInterval(() => {
            set((state) => ({ elapsed: state.elapsed + 1 }));
        }, 1000);

        set({
            status: 'running',
            startTime: Date.now(),
            intervalId
        });
    },

    stop: () => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        set({
            status: 'paused',
            startTime: null,
            intervalId: null
        });
    },

    reset: () => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        set({
            status: 'idle',
            elapsed: 0,
            startTime: null,
            intervalId: null,
            selectedProjectId: null,
            selectedTaskId: null
        });
    },

    setSelectedProject: (id) => set({ selectedProjectId: id }),
    setSelectedTask: (id) => set({ selectedTaskId: id }),
}));
