'use client';

import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { Archive, Briefcase } from 'lucide-react';

export function StatusCardCarousel() {
    // @ts-ignore
    const inbox = useNeyroStore((state: any) => state.inbox);
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects);

    const inboxCount = inbox?.filter((i: any) => !i.isProcessed).length || 0;
    const projects = activeProjects?.slice(0, 3) || [];

    return (
        <div className="py-4">
            <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                {/* Inbox Card */}
                <StatusCard
                    icon={<Archive size={24} />}
                    title="Inbox"
                    value={inboxCount}
                    subtitle={inboxCount > 0 ? 'You have unprocessed items.' : 'All clear for now.'}
                    iconBg="var(--color-secondary)"
                />

                {/* Project Cards */}
                {projects.map((project: any) => (
                    <StatusCard
                        key={project.id}
                        icon={<Briefcase size={24} />}
                        title={project.title}
                        value="0%"
                        subtitle="Next: Check Project Tasks"
                        iconBg="var(--color-primary)"
                    />
                ))}
            </div>
        </div>
    );
}

function StatusCard({
    icon,
    title,
    value,
    subtitle,
    iconBg,
}: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle: string;
    iconBg: string;
}) {
    return (
        <div
            className="flex-shrink-0 snap-start rounded-2xl p-6 flex flex-col justify-between"
            style={{
                width: 'min(85vw, 350px)',
                height: '180px',
                backgroundColor: 'var(--bg-elevated)',
            }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="flex items-center justify-center rounded-full"
                    style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: iconBg,
                        color: '#fff',
                    }}
                >
                    {icon}
                </div>
                <h3
                    className="font-bold truncate"
                    style={{
                        fontSize: 'var(--font-lg)',
                        color: 'var(--text-primary)',
                    }}
                >
                    {title}
                </h3>
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <p style={{ fontSize: 'var(--font-md)', fontWeight: '500', color: 'var(--text-muted)' }}>
                    {typeof value === 'number' ? 'Items' : 'Done'}
                </p>
                <p
                    className="font-bold mt-1"
                    style={{
                        fontSize: '32px',
                        color: 'var(--text-primary)',
                    }}
                >
                    {value}
                </p>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)' }}>
                {subtitle}
            </p>
        </div>
    );
}
