import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value, { requireAuthentication: false });
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key, { requireAuthentication: false });
  },
};

const rawSupabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const supabaseUrl = rawSupabaseUrl.replace(/\/+$/, '');
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

console.log('Initialize Supabase Client with URL:', supabaseUrl);  // DEBUG: Check which project is being targeted


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tell Supabase to start auto-refreshing sessions when the app is in the foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
