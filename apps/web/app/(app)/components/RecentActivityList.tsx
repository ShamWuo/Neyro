'use client';

import { useNeyroStore } from '@mobile/store/useNeyroStore';
import { Task } from '@mobile/database/schema';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

export function RecentActivityList() {
    // @ts-ignore
    const tasks = useNeyroStore((state: any) => state.tasks) || [];

    const recentTasks = tasks
        .sort((a: Task, b: Task) => b.updatedAt - a.updatedAt)
        .slice(0, 5);

    return (
        <div className="px-4 pb-24">
            <div className="flex justify-between items-center mb-4 px-2">
                <h2
                    className="font-bold"
                    style={{
                        fontSize: 'var(--font-lg)',
                        color: 'var(--text)',
                    }}
                >
                    Recent Activity
                </h2>
                <button
                    className="font-semibold"
                    style={{
                        fontSize: 'var(--font-sm)',
                        color: 'var(--color-primary)',
                    }}
                >
                    See all
                </button>
            </div>

            {recentTasks.length === 0 ? (
                <div
                    className="p-6 text-center rounded-2xl"
                    style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text-very-muted)',
                    }}
                >
                    No recent activity.
                </div>
            ) : (
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        backgroundColor: 'var(--bg)',
                    }}
                >
                    {recentTasks.map((task: Task, index: number) => (
                        <div key={task.id}>
                            <TaskItem task={task} />
                            {index < recentTasks.length - 1 && (
                                <div
                                    style={{
                                        height: '1px',
                                        backgroundColor: 'var(--border-muted)',
                                        marginLeft: '72px',
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function TaskItem({ task }: { task: Task }) {
    const isCompleted = task.status === 'done';

    return (
        <div className="flex items-center p-4">
            <div
                className="flex items-center justify-center rounded-full"
                style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: isCompleted ? 'rgba(132, 168, 148, 0.2)' : 'var(--bg-light)',
                    marginRight: 'var(--spacing-md)',
                }}
            >
                {isCompleted ? (
                    <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
                ) : (
                    <Circle size={24} style={{ color: 'var(--text-very-muted)' }} />
                )}
            </div>

            <div className="flex-1">
                <p
                    className="font-semibold mb-1 truncate"
                    style={{
                        fontSize: 'var(--font-md)',
                        color: 'var(--text)',
                    }}
                >
                    {task.title}
                </p>
                <p
                    style={{
                        fontSize: 'var(--font-sm)',
                        color: 'var(--text-muted)',
                    }}
                >
                    {isCompleted ? 'Completed' : 'In Progress'} •{' '}
                    {new Date(task.updatedAt).toLocaleDateString()}
                </p>
            </div>

            <ChevronRight size={16} style={{ color: 'var(--text-very-muted)' }} />
        </div>
    );
}
