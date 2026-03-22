'use client';

import { useState } from 'react';
import { Card } from '../components/Card';
import { User, Bell, Palette, Brain, Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState(true);
    const [calendarSync, setCalendarSync] = useState(false);
    const [dailyGoal, setDailyGoal] = useState(30);

    const handleExportData = () => {
        // In real app, this would export all user data
        const data = {
            exportedAt: new Date().toISOString(),
            message: 'Data export functionality would be implemented here',
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neyro-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                    Settings
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Manage your account and preferences
                </p>
            </div>

            {/* Account Section */}
            <div>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>
                    Account
                </h2>
                <Card>
                    <SettingRow
                        icon={<User size={20} />}
                        label="Profile"
                        description="Manage your profile information"
                        action={<button style={{ color: 'var(--color-primary)' }}>Edit</button>}
                    />
                    <Divider />
                    <SettingRow
                        icon={<Bell size={20} />}
                        label="Notifications"
                        description="Configure notification preferences"
                        action={<Toggle enabled={notifications} onChange={setNotifications} />}
                    />
                </Card>
            </div>

            {/* Focus Settings */}
            <div>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>
                    Focus
                </h2>
                <Card>
                    <SettingRow
                        icon={<Brain size={20} />}
                        label="Daily Goal"
                        description={`${dailyGoal} minutes per day`}
                        action={
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="5"
                                    max="480"
                                    step="5"
                                    value={dailyGoal}
                                    onChange={(e) => setDailyGoal(parseInt(e.target.value) || 30)}
                                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-primary/50"
                                />
                                <span className="text-sm text-neutral-400">min</span>
                            </div>
                        }
                    />
                    <Divider />
                    <SettingRow
                        icon={<CalendarIcon size={20} />}
                        label="Calendar Integration"
                        description="Sync focus sessions to calendar"
                        action={<Toggle enabled={calendarSync} onChange={setCalendarSync} />}
                    />
                </Card>
            </div>

            {/* Appearance */}
            <div>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>
                    Appearance
                </h2>
                <Card>
                    <SettingRow
                        icon={<Palette size={20} />}
                        label="Theme"
                        description="Dark mode (default)"
                        action={<button style={{ color: 'var(--color-primary)' }}>Change</button>}
                    />
                </Card>
            </div>

            {/* Data */}
            <div>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text)' }}>
                    Data
                </h2>
                <Card>
                    <SettingRow
                        icon={<Download size={20} />}
                        label="Export Data"
                        description="Download all your data"
                        action={
                            <Button
                                onClick={handleExportData}
                                variant="ghost"
                                className="text-primary hover:text-primary/80"
                            >
                                Export
                            </Button>
                        }
                    />
                </Card>
            </div>
        </div>
    );
}

function SettingRow({
    icon,
    label,
    description,
    action,
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    action: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
                <div style={{ color: 'var(--text-muted)' }}>{icon}</div>
                <div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                        {label}
                    </p>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                        {description}
                    </p>
                </div>
            </div>
            {action}
        </div>
    );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`w-12 h-6 rounded-full relative transition-colors ${
                enabled ? 'bg-primary' : 'bg-white/10'
            }`}
        >
            <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                    enabled ? 'right-0.5' : 'left-0.5'
                }`}
            />
        </button>
    );
}

function Divider() {
    return <div style={{ height: '1px', backgroundColor: 'var(--border-muted)', margin: '0' }} />;
}
