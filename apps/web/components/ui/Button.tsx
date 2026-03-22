"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-transform transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none tracking-normal";

    const variants = {
        primary: "bg-accent text-white rounded-button hover:bg-accent-dark hover:scale-[0.99]",
        secondary: "bg-transparent border border-border text-primary hover:bg-subtle hover:border-border-strong rounded-button",
        ghost: "bg-transparent text-secondary hover:bg-subtle hover:text-primary rounded-button",
        destructive: "bg-transparent text-coral border border-[#FFD4D4] hover:bg-coral-light rounded-button",
    };

    const sizes = {
        sm: "h-7 px-3 text-[11px]",
        md: "h-9 px-4 text-[13px] font-semibold",
        lg: "h-11 px-6 text-[14px] font-semibold",
        icon: "h-9 w-9 text-base"
    };

    return (
        <button
            ref={ref}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
        </button>
    );
});
Button.displayName = "Button";
