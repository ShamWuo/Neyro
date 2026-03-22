import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';

type Role = 'student' | 'teacher';
type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export default function OnboardingScreen() {
    const router = useRouter();
    const { refreshProfile, user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form fields
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState<Role>('student');
    const [instrument, setInstrument] = useState('');
    const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
    const [yearsPlayed, setYearsPlayed] = useState('');

    useEffect(() => {
        // Pre-fill display name if available from metadata (e.g. Google Sign In)
        if (user?.user_metadata?.full_name && !displayName) {
            setDisplayName(user.user_metadata.full_name);
        } else if (user?.email && !displayName) {
            setDisplayName(user.email.split('@')[0]);
        }
    }, [user]);

    const handleCompleteOnboarding = async () => {
        if (!displayName.trim()) {
            Alert.alert('Validation Error', 'Please enter a display name.');
            return;
        }

        setLoading(true);
        try {
            if (!user) throw new Error('No user found');

            const { error } = await supabase
                .from('users')
                .update({
                    display_name: displayName,
                    role: role,
                    instrument: instrument,
                    skill_level: skillLevel,
                    years_played: parseInt(yearsPlayed || '0', 10),
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome to Musicax!</Text>
                    <Text style={styles.subtitle}>Let's set up your profile.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>I am a...</Text>
                        <View style={styles.rowContainer}>
                            <TouchableOpacity
                                style={[styles.selectableButton, role === 'student' && styles.selectableButtonActive]}
                                onPress={() => setRole('student')}
                            >
                                <Text style={[styles.selectableText, role === 'student' && styles.selectableTextActive]}>Student</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.selectableButton, role === 'teacher' && styles.selectableButtonActive]}
                                onPress={() => setRole('teacher')}
                            >
                                <Text style={[styles.selectableText, role === 'teacher' && styles.selectableTextActive]}>Teacher</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Display Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your Name"
                            placeholderTextColor={COLORS.textMuted}
                            value={displayName}
                            onChangeText={setDisplayName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Primary Instrument</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Piano, Violin, Guitar..."
                            placeholderTextColor={COLORS.textMuted}
                            value={instrument}
                            onChangeText={setInstrument}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Years Played</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor={COLORS.textMuted}
                            value={yearsPlayed}
                            onChangeText={setYearsPlayed}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Skill Level (How good are you?)</Text>
                        <View style={styles.skillContainer}>
                            {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[styles.selectableButton, skillLevel === level && styles.selectableButtonActive, { marginBottom: 8 }]}
                                    onPress={() => setSkillLevel(level)}
                                >
                                    <Text style={[styles.selectableText, skillLevel === level && styles.selectableTextActive]}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleCompleteOnboarding}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Complete Profile</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
    },
    header: {
        marginBottom: SPACING.xxl,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
    form: {
        gap: SPACING.lg,
    },
    inputGroup: {
        gap: SPACING.sm,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        color: COLORS.textPrimary,
        fontSize: FONT_SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    rowContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    skillContainer: {
        flexDirection: 'column',
    },
    selectableButton: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },
    selectableButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary + '20',
    },
    selectableText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    selectableTextActive: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    buttonDisabled: {
        backgroundColor: COLORS.primary,
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
});
