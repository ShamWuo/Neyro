'use client';

import { Lightbulb, Folder, Moon, MoreHorizontal } from 'lucide-react';

interface ActionRowProps {
    onQuickCapture: () => void;
    onNewProject: () => void;
    onFocus: () => void;
}

export function ActionRow({ onQuickCapture, onNewProject, onFocus }: ActionRowProps) {
    return (
        <div className="py-4">
            <div className="flex gap-2 px-6 overflow-x-auto no-scrollbar">
                <ActionButton
                    title="Capture"
                    icon={<Lightbulb size={20} />}
                    onClick={onQuickCapture}
                    accent
                />
                <ActionButton
                    title="New Project"
                    icon={<Folder size={20} />}
                    onClick={onNewProject}
                />
                <ActionButton
                    title="Deep Focus"
                    icon={<Moon size={20} />}
                    onClick={onFocus}
                />
                <button
                    className="flex items-center justify-center rounded-full"
                    style={{
                        width: '44px',
                        height: '44px',
                        backgroundColor: 'var(--bg-light)',
                        color: 'var(--text)',
                    }}
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>
        </div>
    );
}

function ActionButton({
    title,
    icon,
    onClick,
    accent = false,
}: {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    accent?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-opacity hover:opacity-90"
            style={{
                backgroundColor: accent ? 'var(--color-success)' : 'var(--bg-light)',
                color: accent ? '#fff' : 'var(--text)',
                fontSize: 'var(--font-sm)',
            }}
        >
            {icon}
            {title}
        </button>
    );
}
