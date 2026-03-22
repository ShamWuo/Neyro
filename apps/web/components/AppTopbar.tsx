"use client";

import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useDemoStore } from '@/store/demo-store';

export function AppTopbar({ title = "Neyro" }: { title?: string }) {
    const setCaptureOpen = useDemoStore(state => state.setCaptureOpen);

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
                <div className="px-2.5 py-1 flex items-center gap-1.5 text-[13px] text-primary font-mono tracking-tight">
                    <span className="text-text-muted">Momentum</span>
                    <span className="text-primary font-medium">87</span>
                    <span className="text-teal text-[10px]">▲</span>
                </div>

                <button className="relative text-text-secondary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-hover">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-[6px] h-[6px] rounded-full bg-coral"></span>
                </button>

                <div className="w-7 h-7 rounded-full bg-subtle text-accent border border-accent-light flex items-center justify-center text-[12px] font-bold">
                    A
                </div>
            </div>
        </header>
    );
}
