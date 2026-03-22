'use client';

import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className="flex h-64 items-center justify-center flex-col gap-3">
            <Loader2 className="animate-spin" style={{ color: 'var(--color-primary)' }} size={32} />
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>{message}</p>
        </div>
    );
}
