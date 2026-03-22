"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Zap, Compass, Folder, Circle, Bookmark, Archive, LineChart, CheckSquare, Settings } from 'lucide-react';

export function AppSidebar() {
    const pathname = usePathname();

    const navSections = [
        {
            label: "Overview",
            items: [
                { icon: Zap, label: 'Today', href: '/today' },
                { icon: Compass, label: 'Dashboard', href: '/dashboard' },
            ]
        },
        {
            label: "PARA",
            items: [
                { icon: Folder, label: 'Projects', href: '/para/projects' },
                { icon: Circle, label: 'Areas', href: '/para/areas' },
                { icon: Bookmark, label: 'Resources', href: '/para/resources' },
                { icon: Archive, label: 'Archive', href: '/para/archive' },
            ]
        },
        {
            label: "Review",
            items: [
                { icon: LineChart, label: 'Tracking', href: '/tracking' },
                { icon: CheckSquare, label: 'Weekly Review', href: '/review' },
            ]
        }
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-[224px] border-r border-border bg-card hidden lg:flex flex-col">
            {/* Brand */}
            <div className="flex flex-col justify-center px-6 h-20 pt-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-display text-primary tracking-normal">Neyro</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-6 mt-2 overflow-y-auto">
                {navSections.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-[10px] uppercase tracking-[0.08em] text-text-muted mb-1 px-2 font-semibold">
                            {section.label}
                        </h3>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 h-[34px] rounded-[7px] text-[13px] font-medium transition-colors group",
                                            isActive
                                                ? "bg-subtle text-primary"
                                                : "text-secondary hover:bg-hover hover:text-primary"
                                        )}
                                    >
                                        <Icon
                                            size={16}
                                            className={cn(
                                                "transition-colors",
                                                isActive ? "text-accent" : "text-text-muted group-hover:text-secondary"
                                            )}
                                        />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 flex items-center justify-between">
                <div className="px-2 py-1 bg-subtle text-text-muted text-[10px] font-mono tracking-wider rounded-[4px] uppercase border border-border">
                    Demo Mode
                </div>
                <Link
                    href="/settings"
                    className="text-text-muted hover:text-primary transition-colors p-1.5 rounded-full hover:bg-hover"
                    aria-label="Settings"
                >
                    <Settings size={16} />
                </Link>
            </div>
        </aside>
    );
}
