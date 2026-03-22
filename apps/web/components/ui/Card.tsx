import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
    paraTint?: 'projects' | 'areas' | 'resources' | 'archive' | 'none';
}

export function Card({
    className,
    hoverEffect = false,
    paraTint = 'none',
    children,
    ...props
}: CardProps) {
    const baseStyles = "bg-card border border-border rounded-card shadow-card transition-all duration-200";

    const hoverStyles = hoverEffect
        ? "hover:border-border-strong hover:shadow-hover hover:-translate-y-[2px]"
        : "";

    const tints = {
        projects: "border-t-[3px] border-t-accent bg-accent-light/20",
        areas: "border-t-[3px] border-t-teal bg-teal-light/20",
        resources: "border-t-[3px] border-t-amber bg-amber-light/20",
        archive: "border-t-[3px] border-t-text-secondary bg-[#F4F4F5]/50",
        none: ""
    }

    return (
        <div
            className={cn(baseStyles, hoverStyles, tints[paraTint], className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-5 pb-3", className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-5 pt-0", className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-5 pt-3 border-t border-border mt-auto", className)} {...props}>{children}</div>;
}
