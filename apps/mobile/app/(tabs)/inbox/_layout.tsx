import { Stack } from 'expo-router';

export default function InboxLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="projects" />
            <Stack.Screen name="areas" />
            <Stack.Screen name="resources" />
            <Stack.Screen name="archive" />
        </Stack>
    );
}
