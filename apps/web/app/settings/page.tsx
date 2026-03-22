'use client';

import { useState } from 'react';
import { } from 'framer-motion';
import { User, Bell, Brain, Calendar as CalendarIcon, Download, Shield, Github } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState(true);
    const [dailyGoal, setDailyGoal] = useState(30);

    return (
        <div className="max-w-4xl mx-auto px-8 lg:px-12 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <header className="mb-12">
                <h1 className="text-[40px] font-display font-medium text-primary tracking-tight mb-2">Settings</h1>
                <p className="text-secondary text-[17px]">Manage your account, preferences, and data.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                
                {/* Navigation sidebar for settings if needed, but for now just sections */}
                <div className="md:col-span-1 space-y-2">
                    {['General', 'Focus', 'Appearance', 'Notifications', 'Data'].map((item, i) => (
                        <button
                            key={item}
                            className={cn(
                                "w-full text-left px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all",
                                i === 0 ? "bg-accent/10 text-accent" : "text-text-muted hover:bg-subtle hover:text-primary"
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="md:col-span-2 space-y-10">
                    
                    {/* Account Section */}
                    <section className="space-y-4">
                        <h2 className="text-[13px] uppercase tracking-widest font-bold text-text-muted px-1">Account</h2>
                        <Card>
                            <CardContent className="p-0">
                                <SettingItem 
                                    icon={<User size={18} />}
                                    label="Profile"
                                    description="John Doe • john@example.com"
                                    action={<Button variant="ghost" className="text-accent text-[12px] font-semibold">Edit</Button>}
                                />
                                <div className="h-[1px] bg-border/40 mx-6" />
                                <SettingItem 
                                    icon={<Shield size={18} />}
                                    label="Security"
                                    description="Two-factor authentication is active"
                                    action={<Button variant="ghost" className="text-accent text-[12px] font-semibold">Manage</Button>}
                                />
                            </CardContent>
                        </Card>
                    </section>

                    {/* Preferences Section */}
                    <section className="space-y-4">
                        <h2 className="text-[13px] uppercase tracking-widest font-bold text-text-muted px-1">Preferences</h2>
                        <Card>
                            <CardContent className="p-0">
                                <SettingItem 
                                    icon={<Brain size={18} />}
                                    label="Daily Focus Goal"
                                    description={`${dailyGoal} minutes per day`}
                                    action={
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                value={dailyGoal}
                                                onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                                                className="w-16 h-8 bg-subtle border border-border rounded-lg px-2 text-[13px] text-center focus:outline-none focus:ring-1 focus:ring-accent/50"
                                            />
                                        </div>
                                    }
                                />
                                <div className="h-[1px] bg-border/40 mx-6" />
                                <SettingItem 
                                    icon={<Bell size={18} />}
                                    label="Notifications"
                                    description="Smart alerts for stalled projects"
                                    action={
                                        <button 
                                            onClick={() => setNotifications(!notifications)}
                                            className={cn(
                                                "w-10 h-5 rounded-full relative transition-colors duration-300",
                                                notifications ? "bg-accent" : "bg-border"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                                                notifications ? "right-1" : "left-1"
                                            )} />
                                        </button>
                                    }
                                />
                            </CardContent>
                        </Card>
                    </section>

                    {/* Integrations Section */}
                    <section className="space-y-4">
                        <h2 className="text-[13px] uppercase tracking-widest font-bold text-text-muted px-1">Integrations</h2>
                        <Card>
                            <CardContent className="p-0">
                                <SettingItem 
                                    icon={<CalendarIcon size={18} />}
                                    label="Google Calendar"
                                    description="Syncing 2 calendars"
                                    action={<Button variant="ghost" className="text-text-muted text-[12px] font-semibold">Configured</Button>}
                                />
                                <div className="h-[1px] bg-border/40 mx-6" />
                                <SettingItem 
                                    icon={<Github size={18} />}
                                    label="GitHub"
                                    description="Connecting to 12 repos"
                                    action={<Button variant="ghost" className="text-text-muted text-[12px] font-semibold">Configured</Button>}
                                />
                            </CardContent>
                        </Card>
                    </section>

                    {/* Data Section */}
                    <section className="space-y-4">
                        <h2 className="text-[13px] uppercase tracking-widest font-bold text-text-muted px-1">Data</h2>
                        <Card>
                            <CardContent className="p-0">
                                <SettingItem 
                                    icon={<Download size={18} />}
                                    label="Export Content"
                                    description="Download your PARA structure as JSON"
                                    action={<Button onClick={() => toast.success("Export started")} variant="ghost" className="text-accent text-[12px] font-semibold">Export</Button>}
                                />
                            </CardContent>
                        </Card>
                    </section>

                </div>
            </div>
        </div>
    );
}

function SettingItem({ icon, label, description, action }: { icon: React.ReactNode, label: string, description: string, action: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-6 group hover:bg-subtle/30 transition-colors">
            <div className="flex items-center gap-4">
                <div className="text-text-muted group-hover:text-accent transition-colors">{icon}</div>
                <div>
                    <div className="text-[15px] font-medium text-primary">{label}</div>
                    <div className="text-[13px] text-text-muted">{description}</div>
                </div>
            </div>
            {action}
        </div>
    );
}
