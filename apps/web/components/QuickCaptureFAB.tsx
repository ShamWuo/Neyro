'use client';

import { Plus } from 'lucide-react';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { usePathname } from 'next/navigation';

export function QuickCaptureFAB() {
    const pathname = usePathname();
    // @ts-ignore
    const setCaptureVisible = useNeyroStore((state: any) => state.setCaptureVisible);

    // Hide on landing/auth pages
    const isAppPage = pathname?.startsWith('/') && !pathname?.startsWith('/auth') && !pathname?.startsWith('/landing');
    if (!isAppPage) return null;

    return (
        <button
            onClick={() => setCaptureVisible(true)}
            className="hidden lg:flex fixed bottom-6 right-6 z-50 size-16 bg-[#ff6b00] hover:bg-[#ff840a] text-white rounded-full shadow-2xl shadow-[#ff6b00]/30 items-center justify-center transition-all group ring-4 ring-[#ff6b00]/20"
            title="Quick Capture (Cmd/Ctrl + K)"
        >
            <Plus className="size-7 group-hover:rotate-90 transition-transform" />
            <span className="absolute -top-1 -right-1 size-4 bg-[#ffa132] rounded-full border-2 border-white animate-pulse" />
        </button>
    );
}
