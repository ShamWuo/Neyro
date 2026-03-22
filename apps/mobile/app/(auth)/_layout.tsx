import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.background,
                },
                headerTintColor: COLORS.textPrimary,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                contentStyle: {
                    backgroundColor: COLORS.background,
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="login"
                options={{
                    title: 'Sign In',
                }}
            />
            <Stack.Screen
                name="signup"
                options={{
                    title: 'Create Account',
                }}
            />
        </Stack>
    );
}
