import React from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { ConnectionDetail } from '../../src/components/social/ConnectionDetail';

// Mock lookup - in real app would use ID to fetch from DB
const MOCK_NAMES: Record<string, string> = {
    '1': 'Dr. Sarah',
    '2': 'Alex M.',
    '3': 'Coach J'
};

export default function ConnectionDetailRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();

    const name = (id && MOCK_NAMES[id]) ? MOCK_NAMES[id] : 'Connection';

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: '',
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.textPrimary,
                    headerShadowVisible: false,
                }}
            />
            <ConnectionDetail
                connectionId={id as string}
                name={name}
            />
        </>
    );
}
