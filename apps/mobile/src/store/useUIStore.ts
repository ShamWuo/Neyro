import { create } from 'zustand';

interface UIState {
    isCommandPaletteOpen: boolean;
    setCommandPaletteOpen: (isOpen: boolean) => void;
    toggleCommandPalette: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCommandPaletteOpen: false,
    setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
    toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
}));
