import React, { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, AppState, Alert, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { initializeDatabase } from '../src/database/client';
import { COLORS } from '../src/constants';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { CommandPalette } from '../src/components/CommandPalette';
import { QuickCaptureModal } from '../src/components/QuickCaptureModal';
import { useNeyroStore } from '../src/store/useNeyroStore';
import { CollaborationService } from '../src/services/collaborationService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// TODO: Initialize Sentry here once installed
// initSentry();


// Create a client
const queryClient = new QueryClient();

function RootLayoutContent() {
  const { session, loading, user } = useAuth(); // Destructure user explicitly
  const segments = useSegments();
  const router = useRouter();
  const [dbReady, setDbReady] = useState(false);
  const { captureVisible, setCaptureVisible } = useNeyroStore();

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        setDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbReady(true);
      }
    }
    init();
  }, []);

  // Collaboration Listeners
  useEffect(() => {
    if (!user) return;

    // Listen for Focus Commands
    const unsubCommands = CollaborationService.subscribeToCommands(user.id, (payload) => {
      Alert.alert(
        "Focus Mode Activated",
        `Your partner has initiated a ${payload.duration} minute focus session.`,
        [
          { text: "Start Now", onPress: () => router.push({ pathname: '/focus', params: { duration: payload.duration } } as any) }
        ]
      );
    });

    return () => {
      unsubCommands();
    };
  }, [user]);

  useEffect(() => {
    if (loading || !dbReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to the login page if trying to access protected routes without a session
      router.replace('/(auth)/login');
    } else if (session) {
      // Auto-sync on load
      const { SyncService } = require('../src/services/SyncService');
      SyncService.sync().catch((err: any) => console.error('Auto-sync failed:', err));
    }
  }, [session, loading, dbReady, segments]);

  // Sync on App Foreground
  useEffect(() => {
    if (!session) return;

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        const { SyncService } = require('../src/services/SyncService');
        SyncService.sync().catch((err: any) => console.error('Foreground sync failed:', err));
      }
    });

    return () => {
      subscription.remove();
    };
  }, [session]);

  const onLayoutRootView = useCallback(async () => {
    if (!loading && dbReady) {
      await SplashScreen.hideAsync();
    }
  }, [loading, dbReady]);

  const { theme } = useTheme();

  if (loading || !dbReady) {
    return null; // Render nothing while waiting for splash screen
  }

  const isWeb = Platform.OS === 'web';

  return (
    <View style={{ flex: 1, backgroundColor: isWeb ? '#000' : theme.background }} onLayout={onLayoutRootView}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <View style={[
        { flex: 1 },
        isWeb && {
          maxWidth: 500,
          width: '100%',
          alignSelf: 'center',
          backgroundColor: theme.background,
          // Add shadow or border for aesthetic on large screens
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          overflow: 'hidden'
        }
      ]}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.surface,
            },
            headerTintColor: theme.textPrimary,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: theme.background,
            },
          }}
        >
          {/* We can't attach on Layout to Stack directly easily without a wrapper, 
              but since we return null above if not ready, the first render of Stack means we are ready.
           */}
          <Stack.Screen name="focus" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(auth)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="review"
            options={{
              presentation: 'modal',
              title: 'Weekly Review',
              headerStyle: { backgroundColor: theme.surface },
              headerTintColor: theme.textPrimary,
            }}
          />
        </Stack>
        <QuickCaptureModal
          visible={captureVisible}
          onClose={() => setCaptureVisible(false)}
        />
        {/* <CommandPalette /> */}
      </View>
    </View>
  );
}



export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <ThemeProvider>
              <RootLayoutContent />
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
