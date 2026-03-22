import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
// Note: In a real app we'd fetch/save these to the database or store
// For now using local state to demonstrate the UI

export const AutoSortSettings = () => {
    const { theme } = useTheme();
    const [isEnabled, setIsEnabled] = useState(false);
    const [threshold, setThreshold] = useState(0.9);

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                    <Ionicons name="flash" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>Smart Auto-Sort</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        Automatically file high-confidence items without review.
                    </Text>
                </View>
                <Switch
                    value={isEnabled}
                    onValueChange={setIsEnabled}
                    trackColor={{ false: theme.border, true: COLORS.primary }}
                    thumbColor={Platform.OS === 'ios' ? '#fff' : isEnabled ? '#fff' : '#f4f3f4'}
                />
            </View>

            {isEnabled && (
                <View style={styles.controls}>
                    <View style={styles.sliderHeader}>
                        <Text style={[styles.label, { color: theme.textPrimary }]}>Confidence Threshold</Text>
                        <Text style={[styles.value, { color: COLORS.primary }]}>{(threshold * 100).toFixed(0)}%</Text>
                    </View>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0.7}
                        maximumValue={1.0}
                        step={0.05}
                        value={threshold}
                        onValueChange={setThreshold}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor={theme.border}
                        thumbTintColor={COLORS.primary}
                    />
                    <Text style={[styles.hint, { color: theme.textMuted }]}>
                        {threshold < 0.8
                            ? "Aggressive: Will sort most items, might make mistakes."
                            : threshold > 0.95
                                ? "Conservative: Only files when absolutely certain."
                                : "Balanced: The sweet spot for most users."}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    headerText: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginBottom: 2,
    },
    description: {
        fontSize: FONT_SIZES.xs,
    },
    controls: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '500',
    },
    value: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
    },
    hint: {
        fontSize: FONT_SIZES.xs,
        fontStyle: 'italic',
        marginTop: SPACING.xs,
    }
});
