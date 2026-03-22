import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants';
import { performGoogleSignIn } from '../../src/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function SignupScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { refreshProfile } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Error', error.message);
            setLoading(false);
        } else {
            Alert.alert('Success', 'Account created! Please verify your email if required.');
            router.replace('/auth/onboarding');
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, { backgroundColor: theme.surface, ...theme.shadows.md }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Join Neyro</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Start your productive journey</Text>
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

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary }]}
                                placeholder="••••••••"
                                placeholderTextColor={theme.textMuted}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: COLORS.primary, ...theme.shadows.sm }, loading && { opacity: 0.7 }]}
                            onPress={signUpWithEmail}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Sign Up</Text>
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
                                            const { data: profile } = await supabase
                                                .from('users')
                                                .select('role, instrument')
                                                .eq('id', user.id)
                                                .single();

                                            if (profile && profile.instrument) {
                                                await refreshProfile();
                                                router.replace('/(tabs)');
                                            } else {
                                                router.replace('/auth/onboarding');
                                            }
                                        } else {
                                            router.replace('/(tabs)');
                                        }
                                    }
                                } catch (error) {
                                    Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred during Google Sign In');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                        >
                            <Ionicons name="logo-google" size={20} color={theme.textPrimary} style={{ marginRight: SPACING.sm }} />
                            <Text style={[styles.googleButtonText, { color: theme.textPrimary }]}>Sign up with Google</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text style={[styles.link, { color: COLORS.primary }]}>Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.md,
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
        fontSize: 28,
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
        borderRadius: BORDER_RADIUS.lg,
        fontSize: FONT_SIZES.md,
    },
    button: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
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
        marginTop: SPACING.sm,
    },
    googleButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.sm,
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
        marginTop: SPACING.xl,
    },
    footerText: {
        fontSize: FONT_SIZES.md,
    },
    link: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
});
