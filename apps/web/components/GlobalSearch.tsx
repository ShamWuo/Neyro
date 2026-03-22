'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { cn } from '@/lib/utils';

export function GlobalSearch({ className }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // @ts-expect-error - Selective store access
    const projects = useNeyroStore((state: any) => state.activeProjects || []);
    // @ts-expect-error - Selective store access
    const inbox = useNeyroStore((state: any) => state.inbox || []);
    // @ts-expect-error - Selective store access
    const areas = useNeyroStore((state: any) => state.areas || []);
    // @ts-expect-error - Selective store access
    const resources = useNeyroStore((state: any) => state.resources || []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;
            
            // Cmd/Ctrl + Shift + K to open search (different from Quick Capture)
            if (modKey && e.shiftKey && e.key.toLowerCase() === 'k') {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    return;
                }
                e.preventDefault();
                setIsOpen(true);
            }
            
            // Or Cmd/Ctrl + P for search (like VS Code)
            if (modKey && e.key.toLowerCase() === 'p' && !e.shiftKey) {
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    return;
                }
                e.preventDefault();
                setIsOpen(true);
            }
            
            // Escape to close
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                setQuery('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const results = useMemo(() => {
        if (!query.trim()) return [];

        const searchResults: any[] = [];
        const lowerQuery = query.toLowerCase();

        // Search projects
        projects.forEach((p: any) => {
            if (p.title?.toLowerCase().includes(lowerQuery) || 
                p.description?.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    type: 'project',
                    id: p.id,
                    title: p.title,
                    subtitle: p.description,
                    href: `/para/projects?id=${p.id}`,
                });
            }
        });

        // Search inbox items
        inbox.forEach((item: any) => {
            if (item.content?.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    type: 'inbox',
                    id: item.id,
                    title: item.content,
                    subtitle: `Inbox ${item.type || 'item'}`,
                    href: '/para/inbox',
                });
            }
        });

        // Search areas
        areas.forEach((a: any) => {
            if (a.title?.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    type: 'area',
                    id: a.id,
                    title: a.title,
                    subtitle: 'Area of Focus',
                    href: `/para/areas?id=${a.id}`,
                });
            }
        });

        // Search resources
        resources.forEach((r: any) => {
            if (r.title?.toLowerCase().includes(lowerQuery) ||
                r.summary?.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    type: 'resource',
                    id: r.id,
                    title: r.title,
                    subtitle: r.summary || 'Resource',
                    href: '/para/resources',
                });
            }
        });

        return searchResults.slice(0, 8);
    }, [query, projects, inbox, areas, resources]);

    const handleSelect = (result: any) => {
        router.push(result.href);
        setIsOpen(false);
        setQuery('');
    };

    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    return (
        <div className={className}>
            {/* Search Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#ffdea5] rounded-lg text-[#82330c] hover:text-[#461704] hover:bg-[#ffdea5]/30 transition-all group"
                title="Search (Cmd/Ctrl + P or Shift+K)"
            >
                <span className="size-4 group-hover:text-[#ff6b00] transition-colors">🔍</span>
                <span className="hidden md:inline text-sm">Search</span>
                <kbd className="hidden lg:inline-flex px-1.5 py-0.5 bg-[#ffdea5]/30 rounded text-xs font-mono text-[#82330c]">
                    {isMac ? '⌘' : 'Ctrl'}P
                </kbd>
            </button>

            {/* Search Modal */}
            <>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={() => setIsOpen(false)}
                        />
                        <div
                            className="fixed left-1/2 top-20 -translate-x-1/2 bg-white border border-[#ffdea5] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 z-50 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 p-4 border-b border-[#ffdea5]">
                            <span>🔍</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search projects, inbox, areas, resources..."
                                className="flex-1 bg-transparent text-[#461704] placeholder-[#a13c0b]/60 focus:outline-none"
                            />
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-[#ffdea5]/30 rounded transition-colors"
                            >
                                <span>❌</span>
                            </button>
                        </div>

                            {/* Results */}
                            <div className="max-h-96 overflow-y-auto">
                                {query.trim() && results.length === 0 ? (
                                    <div className="p-8 text-center text-[#82330c] bg-white">
                                        <p>No results found</p>
                                    </div>
                                ) : query.trim() ? (
                                    <div className="p-2 bg-white">
                                        {results.map((result: any) => (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => handleSelect(result)}
                                                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-[#ffdea5]/20 transition-colors text-left group"
                                            >
                                                <div className={cn(
                                                    "size-8 rounded-lg flex items-center justify-center shrink-0",
                                                    result.type === 'project' && "bg-blue-500/10 text-blue-600",
                                                    result.type === 'inbox' && "bg-[#ff6b00]/10 text-[#ff6b00]",
                                                    result.type === 'area' && "bg-purple-500/10 text-purple-600",
                                                    result.type === 'resource' && "bg-green-500/10 text-green-600",
                                                )}>
                                                    {result.type === 'project' && '📁'}
                                                    {result.type === 'inbox' && '📥'}
                                                    {result.type === 'area' && '🏔️'}
                                                    {result.type === 'resource' && '📚'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[#461704] group-hover:text-[#ff6b00] transition-colors truncate">
                                                        {result.title}
                                                    </p>
                                                    <p className="text-xs text-[#82330c] truncate">
                                                        {result.subtitle}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-[#82330c] bg-white">
                                        <p className="text-sm">Start typing to search...</p>
                                        <p className="text-xs mt-2 text-[#a13c0b]">
                                            Search across projects, inbox items, areas, and resources
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </>
        </div>
    );
}
