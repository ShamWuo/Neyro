'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { Flame, Trophy, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { eq, desc, gte } from 'drizzle-orm';
import { db } from '@mobile/database/client';
import { focusSessions, projects } from '@mobile/database/schema';

function useStats() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    // @ts-ignore
    const activeProjects = useNeyroStore((state: any) => state.activeProjects || []);

    useEffect(() => {
        async function fetchStats() {
            try {
                setIsLoading(true);
                const now = Date.now();
                const today = new Date().toISOString().split('T')[0];
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                // Get all sessions
                const allSessions = await db.select().from(focusSessions).orderBy(desc(focusSessions.date));
                
                // Calculate stats
                const todaySessions = allSessions.filter(s => s.date === today);
                const weekSessions = allSessions.filter(s => s.date >= weekAgo);
                
                const totalMinutesToday = todaySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
                const totalMinutesThisWeek = weekSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
                const totalMinutesAllTime = allSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

                // Calculate streak
                const dates = [...new Set(allSessions.map(s => s.date))].sort().reverse();
                let currentStreak = 0;
                let longestStreak = 0;
                let tempStreak = 0;
                
                for (let i = 0; i < dates.length; i++) {
                    const date = new Date(dates[i]);
                    const prevDate = i > 0 ? new Date(dates[i - 1]) : null;
                    const daysDiff = prevDate ? Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    if (i === 0 || daysDiff === 1) {
                        tempStreak++;
                        if (i === 0) currentStreak = tempStreak;
                    } else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                }
                longestStreak = Math.max(longestStreak, tempStreak);

                // Focus by day (last 7 days)
                const focusByDay = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    const daySessions = allSessions.filter(s => s.date === date);
                    const minutes = daySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
                    focusByDay.push({ date, minutes });
                }

                // Most active project
                const projectMinutes: Record<string, number> = {};
                allSessions.forEach(s => {
                    if (s.projectId) {
                        projectMinutes[s.projectId] = (projectMinutes[s.projectId] || 0) + (s.durationMinutes || 0);
                    }
                });
                const mostActiveProjectId = Object.entries(projectMinutes).sort((a, b) => b[1] - a[1])[0]?.[0];
                const mostActiveProject = mostActiveProjectId 
                    ? { project: activeProjects.find((p: any) => p.id === mostActiveProjectId) || { title: 'Unknown' }, minutes: projectMinutes[mostActiveProjectId] }
                    : null;

                const dailyGoal = 30; // 30 minutes default
                const dailyGoalProgress = Math.min((totalMinutesToday / dailyGoal) * 100, 100);

                setStats({
                    currentStreak,
                    longestStreak,
                    totalMinutesToday,
                    totalMinutesThisWeek,
                    totalMinutesAllTime,
                    dailyGoalProgress,
                    focusByDay,
                    mostActiveProject,
                });
            } catch (e) {
                console.error('Failed to fetch stats', e);
                setStats({
                    currentStreak: 0,
                    longestStreak: 0,
                    totalMinutesToday: 0,
                    totalMinutesThisWeek: 0,
                    totalMinutesAllTime: 0,
                    dailyGoalProgress: 0,
                    focusByDay: Array(7).fill(0).map((_, i) => {
                        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        return { date, minutes: 0 };
                    }),
                    mostActiveProject: null,
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, [activeProjects]);

    return { stats, isLoading };
}

function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getShortDayName(dateStr: string): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateStr).getDay()];
}

export default function StatsPage() {
    const { stats, isLoading } = useStats();

    if (isLoading || !stats) {
        return <LoadingState message="Calculating focus stats..." />;
    }

    return (
        <div className="pb-8" style={{ backgroundColor: 'var(--bg-dark)' }}>
            {/* Main Stats */}
            <div className="flex gap-4 mb-4">
                <StatCard
                    icon={<Flame size={28} />}
                    iconColor="var(--color-secondary)"
                    label="Current Streak"
                    value={`${stats.currentStreak}`}
                    subvalue="days"
                />
                <StatCard
                    icon={<Trophy size={28} />}
                    iconColor="var(--color-secondary)"
                    label="Longest Streak"
                    value={`${stats.longestStreak}`}
                    subvalue="days"
                />
            </div>

            <div className="flex gap-4 mb-4">
                <StatCard
                    icon={<CalendarIcon size={28} />}
                    label="Today"
                    value={formatMinutes(stats.totalMinutesToday)}
                />
                <StatCard
                    icon={<Clock size={28} />}
                    label="This Week"
                    value={formatMinutes(stats.totalMinutesThisWeek)}
                />
            </div>

            {/* Weekly Chart */}
            <WeeklyChart data={stats.focusByDay} />

            {/* Total Focus Time */}
            <Card className="mb-4">
                <div className="flex items-center">
                    <Clock size={24} style={{ color: 'var(--color-primary)' }} />
                    <div style={{ marginLeft: 'var(--spacing-md)' }}>
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                            Total Focus Time
                        </p>
                        <p
                            className="font-bold"
                            style={{ fontSize: 'var(--font-xl)', color: 'var(--text)' }}
                        >
                            {formatMinutes(stats.totalMinutesAllTime)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Most Active Project */}
            {stats.mostActiveProject && (
                <Card className="mb-4">
                    <div className="flex items-center mb-2">
                        <Trophy size={20} style={{ color: 'var(--color-secondary)' }} />
                        <p
                            className="font-semibold ml-2"
                            style={{ fontSize: 'var(--font-sm)', color: 'var(--color-secondary)' }}
                        >
                            Most Active Project
                        </p>
                    </div>
                    <p
                        className="font-semibold"
                        style={{ fontSize: 'var(--font-lg)', color: 'var(--text)' }}
                    >
                        {stats.mostActiveProject.project.title}
                    </p>
                    <p
                        className="font-semibold mt-2"
                        style={{ fontSize: 'var(--font-md)', color: 'var(--color-primary)' }}
                    >
                        {formatMinutes(stats.mostActiveProject.minutes)} total
                    </p>
                </Card>
            )}

            {/* Daily Goal Progress */}
            <Card>
                <div className="flex justify-between items-center mb-2">
                    <p
                        className="font-semibold"
                        style={{ fontSize: 'var(--font-md)', color: 'var(--text)' }}
                    >
                        Daily Goal Progress
                    </p>
                    <p
                        className="font-bold"
                        style={{ fontSize: 'var(--font-lg)', color: 'var(--color-primary)' }}
                    >
                        {stats.dailyGoalProgress}%
                    </p>
                </div>
                <div
                    className="rounded-full overflow-hidden"
                    style={{ height: '8px', backgroundColor: 'var(--bg-light)' }}
                >
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: `${Math.min(stats.dailyGoalProgress, 100)}%`,
                            backgroundColor: 'var(--color-primary)',
                        }}
                    />
                </div>
                <p
                    className="text-center mt-2"
                    style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}
                >
                    {stats.totalMinutesToday} / 30 minutes
                </p>
            </Card>
        </div>
    );
}

function StatCard({
    icon,
    iconColor,
    label,
    value,
    subvalue,
}: {
    icon: React.ReactNode;
    iconColor?: string;
    label: string;
    value: string;
    subvalue?: string;
}) {
    return (
        <Card className="flex-1 flex flex-col items-center">
            <div style={{ color: iconColor || 'var(--text)' }}>{icon}</div>
            <p
                className="font-bold mt-2"
                style={{ fontSize: 'var(--font-xxl)', color: 'var(--text)' }}
            >
                {value}
            </p>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: '4px' }}>
                {label}
            </p>
            {subvalue && (
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-very-muted)' }}>
                    {subvalue}
                </p>
            )}
        </Card>
    );
}

function WeeklyChart({ data }: { data: { date: string; minutes: number }[] }) {
    const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

    return (
        <Card className="mb-4">
            <p
                className="font-semibold mb-4"
                style={{ fontSize: 'var(--font-md)', color: 'var(--text)' }}
            >
                Last 7 Days
            </p>
            <div className="flex justify-between" style={{ height: '120px' }}>
                {data.map((day) => (
                    <div key={day.date} className="flex-1 flex flex-col items-center">
                        <div
                            className="flex-1 w-6 rounded flex items-end overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-light)' }}
                        >
                            <div
                                className="w-full rounded"
                                style={{
                                    height: `${(day.minutes / maxMinutes) * 100}%`,
                                    minHeight: day.minutes > 0 ? '4px' : '0',
                                    backgroundColor: day.minutes > 0 ? 'var(--color-primary)' : 'var(--bg-light)',
                                }}
                            />
                        </div>
                        <p
                            className="mt-2"
                            style={{ fontSize: 'var(--font-xs)', color: 'var(--text-very-muted)' }}
                        >
                            {getShortDayName(day.date)}
                        </p>
                        <p
                            className="font-medium"
                            style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}
                        >
                            {day.minutes > 0 ? `${day.minutes}m` : '-'}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
