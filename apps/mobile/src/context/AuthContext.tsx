import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { db } from '../database/client';
import { users, User as LocalUser } from '../database/schema';
import { eq } from 'drizzle-orm';

type AuthContextType = {
    session: Session | null;
    user: SupabaseUser | null;
    profile: LocalUser | null;
    loading: boolean;
    isPro: boolean;
    refreshProfile: () => Promise<void>;
    updateProfile: (updates: Partial<LocalUser>) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    isPro: false,
    refreshProfile: async () => { },
    updateProfile: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<LocalUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser: SupabaseUser) => {
        try {
            // Fetch from local SQLite DB
            const results = await db.select().from(users).where(eq(users.id, authUser.id));
            const existingProfile = results[0];

            if (existingProfile) {
                setProfile(existingProfile);
            } else {
                // If profile doesn't exist in local DB, create it
                // This handles the "Offline First" philosophy where we need a local copy
                console.log('Profile not found in local DB, creating new profile for:', authUser.id);

                const newProfile: typeof users.$inferInsert = {
                    id: authUser.id,
                    email: authUser.email || `user_${authUser.id}@placeholder.com`,
                    displayName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                    avatarUrl: authUser.user_metadata?.avatar_url || null,
                    subscriptionTier: 'free',
                    aiUsageCount: 0,
                    createdAt: Date.now(),
                    lastSeenAt: Date.now(),
                };

                await db.insert(users).values(newProfile);

                // Fetch again to ensure we have the stored version
                const newResults = await db.select().from(users).where(eq(users.id, authUser.id));
                setProfile(newResults[0] || null);
            }
        } catch (e) {
            console.error('Exception fetching profile:', e);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<LocalUser>) => {
        if (!user) return;
        try {
            await db.update(users)
                .set({ ...updates })
                .where(eq(users.id, user.id));

            await fetchProfile(user);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
    };

    const isPro = profile?.subscriptionTier === 'musician' || profile?.subscriptionTier === 'virtuoso'; // Keeping compatibility with schema string values but could be simplified if we change logic

    const value = {
        session,
        user,
        profile,
        loading,
        isPro,
        refreshProfile: async () => {
            if (user) await fetchProfile(user);
        },
        updateProfile,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
