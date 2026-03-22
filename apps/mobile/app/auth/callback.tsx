import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        // On web, the hash is usually handled automatically by the Supabase client if configured correctly,
        // but sometimes we need to manually grab it.
        // However, on mobile deep linking, the flow is handled in the signInWithOAuth call itself.
        // This page is mainly hit if the redirect opens in a standard browser tab.

        console.log('Auth Callback Hit with params:', params);

        // If we have a hash in the URL (handled by window.location on web)
        if (typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.substring(1);
            const query = Object.fromEntries(new URLSearchParams(hash));

            if (query.access_token && query.refresh_token) {
                supabase.auth.setSession({
                    access_token: query.access_token,
                    refresh_token: query.refresh_token,
                }).then(({ error }) => {
                    if (!error) {
                        router.replace('/(tabs)');
                    } else {
                        console.error('Session error:', error);
                    }
                });
            }
        } else {
            // Fallback or just redirect home
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 1000);
        }
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Completing Sign In...</Text>
        </View>
    );
}
