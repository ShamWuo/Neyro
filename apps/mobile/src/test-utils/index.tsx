/// <reference types="jest" />

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

const customRender = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Mock data factories
export const mockPiece = (overrides = {}) => ({
    id: 'test-piece-1',
    title: 'Test Piece',
    composer: 'Test Composer',
    instrument: 'Piano',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isCurrent: false,
    isCompleted: false,
    aiContext: null,
    difficultyRating: 5,
    difficultyStats: null,
    userId: null,
    type: 'piece' as const,
    ...overrides,
});

export const mockSession = (overrides = {}) => ({
    id: 'test-session-1',
    pieceId: 'test-piece-1',
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now(),
    duration: 3600, // 1 hour in seconds
    notes: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
});

export const mockSessionWithPiece = (overrides = {}) => ({
    ...mockSession(),
    piece: mockPiece(),
    ...overrides,
});

// Mock Supabase
export const mockSupabase = {
    auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
            data: { subscription: { unsubscribe: jest.fn() } },
        })),
    },
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
};

// Mock database
export const mockDb = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
