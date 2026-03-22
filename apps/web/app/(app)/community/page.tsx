'use client';

import { useState } from 'react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Users, UserPlus, Search, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CommunityPage() {
    const [connections, setConnections] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');

    // Mock connections - in real app, this would come from Supabase
    const handleAddConnection = () => {
        if (searchEmail.trim()) {
            // In real app, this would call CollaborationService
            setConnections([...connections, {
                id: Date.now().toString(),
                email: searchEmail,
                name: searchEmail.split('@')[0],
            }]);
            setSearchEmail('');
            setShowAddModal(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white">
                        Network
                    </h1>
                    <p className="text-neutral-400">
                        Connect with other users and share resources
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white"
                >
                    <UserPlus size={20} className="mr-2" />
                    Add Connection
                </Button>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Add Connection</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="size-5 text-neutral-400" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                                    <input
                                        type="email"
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary/50"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddConnection()}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowAddModal(false)}
                                    variant="ghost"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddConnection}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                                >
                                    <Send className="size-4 mr-2" />
                                    Send Request
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {connections.length === 0 ? (
                <EmptyState
                    icon={Users}
                    message="No connections yet. Start connecting with other users to collaborate and share."
                    action={{
                        label: 'Add Connection',
                        onClick: () => setShowAddModal(true),
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections.map((connection: any) => (
                        <Card key={connection.id} className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                    {connection.name.charAt(0).toUpperCase()}
                                </div>
                                <p className="font-semibold text-white mb-1">
                                    {connection.name}
                                </p>
                                <p className="text-sm text-neutral-400">
                                    {connection.email}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
