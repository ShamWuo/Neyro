import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from '../common';
import { SPACING, FONT_SIZES, LEGACY_COLORS, DEFAULTS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

interface TodayProgressProps {
    minutesToday: number;
    goalMinutes?: number;
}

export const TodayProgress: React.FC<TodayProgressProps> = ({
    minutesToday,
    goalMinutes = DEFAULTS.DAILY_GOAL_MINUTES
}) => {
    const { theme } = useTheme();

    return (
        <Card style={styles.todayCard}>
            <Text style={styles.todayLabel}>Today's Practice</Text>
            <Text style={[styles.todayValue, { color: theme.textPrimary }]}>
                {minutesToday} / {goalMinutes} min
            </Text>
        </Card>
    );
};

const styles = StyleSheet.create({
    todayCard: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        padding: SPACING.md,
    },
    todayLabel: {
        fontSize: FONT_SIZES.sm,
        color: LEGACY_COLORS.textSecondary,
    },
    todayValue: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        marginTop: SPACING.xs,
    },
});
