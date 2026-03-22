import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants';
import { performGoogleSignIn } from '../../src/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function LoginScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { refreshProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const checkProfileAndRedirect = async (userId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('users')
                .select('instrument')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    router.replace('/auth/onboarding');
                    return;
                }
                throw error;
            }

            if (profile && profile.instrument) {
                await refreshProfile();
                router.replace('/(tabs)');
            } else {
                router.replace('/auth/onboarding');
            }
        } catch (error) {
            console.error('Profile check error:', error);
            router.replace('/auth/onboarding');
        }
    };

    async function signInWithEmail() {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else if (data.user) {
            await checkProfileAndRedirect(data.user.id);
        }
        setLoading(false);
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.content}>
                <View style={[styles.card, { backgroundColor: theme.surface, ...theme.shadows.md }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome Back</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to continue your journey</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary }]}
                                placeholder="name@example.com"
                                placeholderTextColor={theme.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary }]}
                                placeholder="••••••••"
                                placeholderTextColor={theme.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: COLORS.primary, ...theme.shadows.sm }, loading && { opacity: 0.7 }]}
                            onPress={signInWithEmail}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                            <Text style={[styles.dividerText, { color: theme.textMuted }]}>OR</Text>
                            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                        </View>

                        <TouchableOpacity
                            style={[styles.googleButton, { backgroundColor: theme.surfaceLight, ...theme.shadows.sm }]}
                            onPress={async () => {
                                setLoading(true);
                                try {
                                    const success = await performGoogleSignIn();
                                    if (success) {
                                        const { data: { user } } = await supabase.auth.getUser();
                                        if (user) {
                                            await checkProfileAndRedirect(user.id);
                                        }
                                    }
                                } catch (error) {
                                    Alert.alert('Error', 'Google Sign In failed');
                                }
                                setLoading(false);
                            }}
                            disabled={loading}
                        >
                            <Ionicons name="logo-google" size={20} color={theme.textPrimary} style={{ marginRight: SPACING.sm }} />
                            <Text style={[styles.googleButtonText, { color: theme.textPrimary }]}>Sign in with Google</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
                            <Link href="/signup" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.link, { color: COLORS.primary }]}>Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
        justifyContent: 'center',
    },
    card: {
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
    },
    header: {
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 28, // Exceptional UI: Larger title
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
    },
    form: {
        gap: SPACING.lg,
    },
    inputGroup: {
        gap: SPACING.xs,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        marginLeft: 4,
    },
    input: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg, // Rounded inputs
        fontSize: FONT_SIZES.md,
        // No border
    },
    button: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.full, // Pill buttons
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    buttonText: {
        color: '#fff',
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    googleButton: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    googleButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.xs,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: SPACING.md,
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.md,
    },
    footerText: {
        fontSize: FONT_SIZES.md,
    },
    link: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
});
