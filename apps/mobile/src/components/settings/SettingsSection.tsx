import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginBottom: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    card: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
    },
});
