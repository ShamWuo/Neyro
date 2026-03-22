'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export function Card({ children, className = '', style, onClick }: CardProps) {
    return (
        <div
            className={`surface rounded-xl p-4 ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
            style={{
                backgroundColor: 'var(--bg)',
                borderRadius: 'var(--radius-xl)',
                ...style,
            }}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
