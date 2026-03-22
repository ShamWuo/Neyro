'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function KeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;
            
            // Show shortcuts: Cmd/Ctrl + Shift + ?
            if (modKey && e.shiftKey && e.key === '?') {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isOpen]);

    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? '⌘' : 'Ctrl';

    const shortcuts = [
        { keys: [`${modKey}`, 'K'], description: 'Quick Capture' },
        { keys: [`${modKey}`, 'N'], description: 'New Note' },
        { keys: [`${modKey}`, 'I'], description: 'Go to Inbox' },
        { keys: [`${modKey}`, 'F'], description: 'Start Focus' },
        { keys: [`${modKey}`, 'P'], description: 'Go to Projects' },
        { keys: [`${modKey}`, 'H'], description: 'Go to Home' },
        { keys: [`${modKey}`, 'Shift', 'I'], description: 'Fast Process Inbox' },
        { keys: [`${modKey}`, 'Shift', '?'], description: 'Show Shortcuts' },
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors group"
                title="Keyboard Shortcuts (Cmd/Ctrl + Shift + ?)"
            >
                <Keyboard className="size-5 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">Shortcuts</span>
            </button>

            <>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                            onClick={() => setIsOpen(false)}
                        />
                        <div
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 max-w-md w-full z-50"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="size-5 text-neutral-400" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {shortcuts.map((shortcut, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm text-neutral-400">{shortcut.description}</span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, j) => (
                                                <kbd
                                                    key={j}
                                                    className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono text-white"
                                                >
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </>
        </>
    );
}
