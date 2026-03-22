import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../common';
import { SPACING, FONT_SIZES, LEGACY_COLORS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

interface TimerStatsProps {
    currentStreak: number;
    dailyGoalProgress: number;
}

export const TimerStats: React.FC<TimerStatsProps> = ({ currentStreak, dailyGoalProgress }) => {
    const { theme } = useTheme();

    return (
        <View style={styles.statsRow}>
            <Card style={styles.statCard}>
                <Ionicons name="flame" size={24} color={LEGACY_COLORS.accent} />
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
            </Card>

            <Card style={styles.statCard}>
                <View style={styles.progressRing}>
                    <Text style={styles.progressText}>{dailyGoalProgress}%</Text>
                </View>
                <Text style={styles.statLabel}>Daily Goal</Text>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.md,
    },
    statValue: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        marginTop: SPACING.xs,
    },
    statLabel: {
        fontSize: FONT_SIZES.sm,
        color: LEGACY_COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    progressRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: LEGACY_COLORS.primary, // Could use theme.primary if available in context, keeping legacy for now for accent colors
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: LEGACY_COLORS.primary,
    },
});
