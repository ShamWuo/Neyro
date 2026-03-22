import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { SocialScreen } from '../../src/components/social/SocialScreen';

export default function SocialIndex() {
    const { theme } = useTheme();

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: 'Connections',
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.textPrimary,
                    headerShadowVisible: false,
                }}
            />
            <SocialScreen />
        </>
    );
}
