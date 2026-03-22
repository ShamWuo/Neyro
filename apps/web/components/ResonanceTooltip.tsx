'use client';

import { useState } from 'react';

export function ResonanceTooltip() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-flex items-center">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="ml-2 p-1.5 rounded-full hover:bg-primary/20 bg-primary/10 transition-colors group border border-primary/30"
                aria-label="What is Resonance?"
                title="Click to learn about Resonance Score"
            >
                <span className="size-4 text-primary group-hover:text-orange-400 transition-colors">ℹ️</span>
            </button>

            <>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div
                            className="absolute left-0 top-full mt-2 w-80 bg-[#1C1C1E] border border-white/10 rounded-xl p-4 shadow-2xl z-50"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h4 className="font-bold text-white text-sm">Resonance Score</h4>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <span>❌</span>
                                </button>
                            </div>
                            <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                                <strong className="text-white">Resonance</strong> (0-100%) measures how well your system is organized and maintained. Higher scores indicate:
                            </p>
                            <ul className="text-xs text-neutral-400 space-y-1.5 mb-3">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Low inbox count (processed regularly)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Active projects with clear progress</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Regular focus sessions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Completed weekly reviews</span>
                                </li>
                            </ul>
                            <div className="pt-3 border-t border-white/5">
                                <p className="text-xs font-semibold text-primary">How to improve:</p>
                                <p className="text-xs text-neutral-400 mt-1">
                                    Process your inbox daily, complete focus sessions, and do weekly reviews to maintain high resonance.
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </>
        </div>
    );
}
