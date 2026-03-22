import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    category?: 'projects' | 'areas' | 'resources' | 'archive' | 'default';
}

export function Badge({ className, category = 'default', children, ...props }: BadgeProps) {
    const variants = {
        projects: "bg-accent-light text-accent-dark",
        areas: "bg-teal-light text-[#00876A]",
        resources: "bg-amber-light text-[#B45309]",
        archive: "bg-[#F4F4F5] text-text-secondary",
        default: "bg-[#F4F4F5] text-text-primary"
    };

    return (
        <span
            className={cn(
                "inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.04em] rounded-[4px] px-[7px] py-[2px]",
                variants[category],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
