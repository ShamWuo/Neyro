"use client";

import React from 'react';
import { Bell, Search, User, Zap } from 'lucide-react';
import { useDemoStore } from '@/store/demo-store';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

export function AppTopbar() {
    const setCaptureOpen = useDemoStore(state => state.setCaptureOpen);
    const pathname = usePathname();

    const getTitle = (path: string) => {
        if (path === '/' || path === '/today') return 'Today';
        if (path === '/dashboard') return 'Dashboard';
        if (path.includes('/para/projects')) return 'Projects';
        if (path.includes('/para/areas')) return 'Areas';
        if (path.includes('/para/resources')) return 'Resources';
        if (path.includes('/para/archive')) return 'Archive';
        if (path.includes('/tracking')) return 'Daily Tracking';
        if (path.includes('/review')) return 'Weekly Review';
        if (path.includes('/settings')) return 'Settings';
        
        // Handle dynamic routes like /para/projects/[id]
        const segments = path.split('/').filter(Boolean);
        if (segments.length > 0) {
            const last = segments[segments.length - 1];
            return last.charAt(0).toUpperCase() + last.slice(1).replace('-', ' ');
        }
        
        return 'Neyro';
    };

    const title = getTitle(pathname);

    return (
        <header className="h-[60px] w-full bg-bg-card/90 backdrop-blur-sm border-b border-border sticky top-0 z-30 flex items-center justify-between px-8">
            {/* Left: Dynamic Title */}
            <div className="flex-1 flex items-center">
                <h1 className="text-xl font-sans font-semibold tracking-[-0.02em] text-primary">{title}</h1>
            </div>

            {/* Center: Global Capture Bar */}
            <div className="flex-1 flex justify-center max-w-md hidden md:flex">
                <button
                    onClick={() => setCaptureOpen(true)}
                    className="w-full bg-card border border-border rounded-input px-3 py-1.5 flex items-center gap-2 text-text-placeholder shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-border-strong transition-colors cursor-text group"
                >
                    <Search size={14} className="text-text-muted group-hover:text-secondary transition-colors" />
                    <span className="text-[13px] font-medium">Quick capture...</span>
                    <span className="ml-auto text-[10px] font-mono border border-border rounded-[4px] px-1.5 py-0.5 text-text-muted">Cmd K</span>
                </button>
            </div>

            {/* Right: Accolades & Profile */}
            <div className="flex-1 flex justify-end items-center gap-4">
                <button 
                    onClick={() => toast.info("Momentum reflects your velocity and focus. Detail view coming soon!")}
                    className="px-2.5 py-1 flex items-center gap-1.5 text-[13px] text-primary font-mono tracking-tight hover:bg-hover rounded-button transition-colors cursor-help"
                >
                    <span className="text-text-muted">Momentum</span>
                    <span className="text-primary font-medium">87</span>
                    <span className="text-teal text-[10px]">▲</span>
                </button>

                <button 
                    onClick={() => toast.success("You're all caught up! No new notifications.")}
                    className="relative text-text-secondary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-hover"
                >
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full bg-coral"></span>
                </button>

                <button 
                    onClick={() => toast.info("Profile settings and preferences coming soon.")}
                    className="w-7 h-7 rounded-full bg-subtle text-accent border border-accent-light flex items-center justify-center text-[12px] font-bold hover:bg-accent-light/20 transition-colors"
                >
                    <User size={14} />
                </button>
            </div>
        </header>
    );
}
