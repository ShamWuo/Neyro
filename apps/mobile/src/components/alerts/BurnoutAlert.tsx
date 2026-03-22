import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

interface BurnoutAlertProps {
    riskScore: number; // 0-100
    suggestions: string[];
    onDismiss: () => void;
}

export const BurnoutAlert = ({ riskScore, suggestions, onDismiss }: BurnoutAlertProps) => {
    const { theme } = useTheme();

    if (riskScore < 50) return null; // Don't show if low risk

    const isCritical = riskScore > 80;
    const color = isCritical ? COLORS.error : COLORS.warning;
    const icon = isCritical ? 'flame' : 'battery-half';
    const title = isCritical ? 'Burnout Risk: Critical' : 'Energy Levels Dipping';

    return (
        <View style={[styles.container, { backgroundColor: color + '15', borderColor: color }]}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={icon} size={24} color={color} style={{ marginRight: 10 }} />
                    <Text style={[styles.title, { color: color }]}>{title}</Text>
                </View>
                <TouchableOpacity onPress={onDismiss}>
                    <Ionicons name="close" size={20} color={color} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.message, { color: theme.textSecondary }]}>
                {isCritical
                    ? "You've been working late hours for 3 days in a row. Efficiency decreases by 40% after 9 PM."
                    : "You're consistently missing breaks. Consider scheduling a recharge session."
                }
            </Text>

            {suggestions.length > 0 && (
                <View style={styles.suggestions}>
                    <Text style={[styles.suggestionLabel, { color: theme.textMuted }]}>SUGGESTION:</Text>
                    <Text style={[styles.suggestionText, { color: theme.textPrimary }]}>{suggestions[0]}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: SPACING.md,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    message: {
        fontSize: FONT_SIZES.sm,
        lineHeight: 20,
        marginBottom: SPACING.md,
    },
    suggestions: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    suggestionLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginRight: 8,
    },
    suggestionText: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    }
});
