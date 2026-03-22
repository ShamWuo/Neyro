'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Clock, Filter, Calendar } from 'lucide-react';
import { desc } from 'drizzle-orm';
import { db } from '@mobile/database/client';
import { focusSessions, projects } from '@mobile/database/schema';
import { useNeyroStore } from '@mobile/store/useNeyroStore';

type FilterType = 'all' | 'today' | 'week' | 'month';

export default function HistoryPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);

    useEffect(() => {
        async function fetchSessions() {
            try {
                setIsLoading(true);
                const allSessions = await db
                    .select({
                        session: focusSessions,
                        project: projects,
                    })
                    .from(focusSessions)
                    .leftJoin(projects, eq(focusSessions.projectId, projects.id))
                    .orderBy(desc(focusSessions.date), desc(focusSessions.completedAt));

                const now = Date.now();
                const today = new Date().toISOString().split('T')[0];
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                let filtered = allSessions.map((row: any) => ({
                    id: row.session.id,
                    projectId: row.session.projectId,
                    project: row.project,
                    duration: row.session.durationMinutes,
                    date: row.session.date,
                    notes: row.session.notes,
                    focusArea: row.session.focusArea,
                    completedAt: row.session.completedAt,
                }));

                if (filter === 'today') {
                    filtered = filtered.filter(s => s.date === today);
                } else if (filter === 'week') {
                    filtered = filtered.filter(s => s.date >= weekAgo);
                } else if (filter === 'month') {
                    filtered = filtered.filter(s => s.date >= monthAgo);
                }

                setSessions(filtered);
            } catch (e) {
                console.error('Failed to fetch sessions', e);
                setSessions([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSessions();
    }, [filter, activeProjects]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white">
                        History
                    </h1>
                    <p className="text-neutral-400">
                        Review past focus sessions and completed tasks
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                    {(['all', 'today', 'week', 'month'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                                filter === f
                                    ? 'bg-primary text-white'
                                    : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <Clock className="size-12 text-neutral-500 mx-auto mb-4 animate-spin" />
                    <p className="text-neutral-400">Loading sessions...</p>
                </div>
            ) : sessions.length === 0 ? (
                <EmptyState
                    icon={Clock}
                    message="No focus sessions yet. Start your first session to see your history here."
                />
            ) : (
                <div className="space-y-3">
                    {sessions.map((session: any) => (
                        <Card key={session.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <Clock className="size-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">
                                            {session.project?.title || session.focusArea || 'General Focus'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-sm text-neutral-400">
                                                {session.duration} minutes
                                            </p>
                                            <span className="text-neutral-600">•</span>
                                            <div className="flex items-center gap-1 text-sm text-neutral-400">
                                                <Calendar className="size-3" />
                                                {new Date(session.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {session.notes && (
                                            <p className="text-xs text-neutral-500 mt-1">{session.notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
