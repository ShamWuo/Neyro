import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession(); // Required for Web usage

export async function performGoogleSignIn() {
    try {
        // 1. Generate Redirect URL
        const redirectUrl = Linking.createURL('');
        console.log('generated redirectUrl (ADD TO SUPABASE):', redirectUrl);

        // 2. Start OAuth Flow
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true,
            },
        });

        if (error) throw error;
        if (!data?.url) throw new Error('No auth URL returned');

        let authUrl = data.url;

        // Fix double slash issue if present
        if (authUrl.includes('.co//auth')) {
            authUrl = authUrl.replace('.co//auth', '.co/auth');
        }

        // 3. Open Browser Session
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

        if (result.type === 'success') {
            const { url } = result;
            const params = extractParamsFromUrl(url);

            if (params.access_token && params.refresh_token) {
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: params.access_token,
                    refresh_token: params.refresh_token,
                });

                if (sessionError) throw sessionError;
                return true;
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            Alert.alert('Google Sign In Error', error.message);
        }
    }
    return false;
}

function extractParamsFromUrl(url: string): { [key: string]: string } {
    const params: { [key: string]: string } = {};

    // Handle both query (?) and hash (#)
    const regex = /[?&#]([^=#]+)=([^&#]*)/g;
    let match;
    while ((match = regex.exec(url))) {
        params[match[1]] = decodeURIComponent(match[2]);
    }
    return params;
}
