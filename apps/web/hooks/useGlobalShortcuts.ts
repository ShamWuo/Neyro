'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/demo-store';

export function useGlobalShortcuts() {
    const router = useRouter();
    const setCaptureOpen = useDemoStore(state => state.setCaptureOpen);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea unless it's a specific global override
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                if (!e.metaKey && !e.ctrlKey) return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;

            // Quick Capture: Cmd/Ctrl + K or N
            if (modKey && (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'n')) {
                e.preventDefault();
                setCaptureOpen(true);
                return;
            }

            // Go to Today (Home): Cmd/Ctrl + H
            if (modKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                router.push('/');
                return;
            }

            // Go to Dashboard: Cmd/Ctrl + D
            if (modKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                router.push('/dashboard');
                return;
            }

            // Go to Projects: Cmd/Ctrl + P
            if (modKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                router.push('/para/projects');
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router, setCaptureOpen]);
}
