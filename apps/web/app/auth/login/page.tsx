'use client';

import { useState } from 'react';
import { supabase } from '@mobile/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <Link href="/" className="inline-flex items-center text-neutral-400 hover:text-white transition-colors mb-4">
                    <span className="mr-2">←</span>
                    Back to Home
                </Link>

                <div className="text-center">
                    <h2 className="text-3xl font-bold">Welcome back</h2>
                    <p className="mt-2 text-neutral-400">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className="text-center text-sm text-neutral-500">
                        Don't have an account? <span className="text-indigo-400 cursor-pointer">Sign up</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
