import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useNeyroStore } from '../../src/store/useNeyroStore';

import { AppHeader } from '../../src/components/common/AppHeader';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: (props) => <AppHeader {...props} />,
        tabBarStyle: { backgroundColor: theme.surface },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <Ionicons name="file-tray-full" size={size} color={color} />,
        }}
      />

      {/* Simplify: Removed QuickCapture special button for now to test basic clicks */}
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            useNeyroStore.getState().setCaptureVisible(true);
          },
        })}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: 'Network',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />


      {/* Hidden Screens requiring explicit hide */}
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
