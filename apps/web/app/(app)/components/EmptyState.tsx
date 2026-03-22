'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, message, action }: EmptyStateProps) {
    return (
        <div
            className="text-center py-20 border-2 border-dashed rounded-2xl"
            style={{
                borderColor: 'var(--border-muted)',
                color: 'var(--text-very-muted)',
            }}
        >
            {Icon && <Icon size={48} className="mx-auto mb-4" style={{ color: 'var(--text-very-muted)' }} />}
            <p style={{ fontSize: 'var(--font-md)' }}>{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 px-4 py-2 rounded-lg font-semibold transition-all"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: '#fff',
                    }}
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
