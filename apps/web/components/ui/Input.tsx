import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-9 w-full rounded-input border border-border bg-card px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-placeholder focus-visible:outline-none focus-visible:ring-0 focus-visible:border-accent focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                "flex min-h-[80px] w-full rounded-input border border-border bg-card px-3 py-2 text-sm shadow-sm placeholder:text-text-placeholder focus-visible:outline-none focus-visible:ring-0 focus-visible:border-accent focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = "Textarea";
