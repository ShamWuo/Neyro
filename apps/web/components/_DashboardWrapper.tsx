'use client';

import React from 'react';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { QuickCaptureFAB } from '@/components/QuickCaptureFAB';
import { QuickCaptureModal } from '@/components/QuickCaptureModal';

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
    useGlobalShortcuts();
    // @ts-ignore
    const captureVisible = useNeyroStore((state: any) => state.captureVisible);
    // @ts-ignore
    const setCaptureVisible = useNeyroStore((state: any) => state.setCaptureVisible);

    return (
        <>
            {children}
            <QuickCaptureFAB />
            <QuickCaptureModal
                isOpen={captureVisible}
                onClose={() => setCaptureVisible(false)}
            />
        </>
    );
}
