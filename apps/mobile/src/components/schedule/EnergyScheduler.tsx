import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

// Note: In a real implementation, we'd use a dual-thumb slider or time picker

export const EnergyScheduler = () => {
    const { theme } = useTheme();
    const [primeTime, setPrimeTime] = useState({ start: 9, end: 12 }); // 9 AM - 12 PM

    const adjustTime = (type: 'start' | 'end', delta: number) => {
        setPrimeTime(prev => {
            const newVal = prev[type] + delta;
            // Simple bound checks (0-24)
            if (newVal < 0 || newVal > 24) return prev;
            if (type === 'start' && newVal >= prev.end) return prev;
            if (type === 'end' && newVal <= prev.start) return prev;
            return { ...prev, [type]: newVal };
        });
    };

    const formatHour = (h: number) => {
        const p = h >= 12 ? 'PM' : 'AM';
        const v = h % 12 || 12;
        return `${v}:00 ${p}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={styles.header}>
                <Ionicons name="sunny" size={20} color={COLORS.primary} />
                <Text style={[styles.title, { color: theme.textPrimary }]}>Biological Prime Time</Text>
            </View>

            <Text style={[styles.description, { color: theme.textSecondary }]}>
                Neyro will schedule high-focus tasks during these hours.
            </Text>

            <View style={styles.timeControl}>
                <View style={styles.timeBlock}>
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>STARTS</Text>
                    <View style={styles.row}>
                        <TouchableOpacity onPress={() => adjustTime('start', -1)}>
                            <Ionicons name="remove-circle-outline" size={24} color={theme.textMuted} />
                        </TouchableOpacity>
                        <Text style={[styles.timeDisplay, { color: theme.textPrimary }]}>
                            {formatHour(primeTime.start)}
                        </Text>
                        <TouchableOpacity onPress={() => adjustTime('start', 1)}>
                            <Ionicons name="add-circle-outline" size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Ionicons name="arrow-forward" size={20} color={theme.textMuted} style={{ marginTop: 16 }} />

                <View style={styles.timeBlock}>
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>ENDS</Text>
                    <View style={styles.row}>
                        <TouchableOpacity onPress={() => adjustTime('end', -1)}>
                            <Ionicons name="remove-circle-outline" size={24} color={theme.textMuted} />
                        </TouchableOpacity>
                        <Text style={[styles.timeDisplay, { color: theme.textPrimary }]}>
                            {formatHour(primeTime.end)}
                        </Text>
                        <TouchableOpacity onPress={() => adjustTime('end', 1)}>
                            <Ionicons name="add-circle-outline" size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={[styles.visualizer, { height: 40, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }]}>
                {Array.from({ length: 24 }).map((_, i) => {
                    const isPrime = i >= primeTime.start && i < primeTime.end;
                    const height = isPrime ? 30 : 10;
                    const opacity = isPrime ? 1 : 0.3;
                    return (
                        <View
                            key={i}
                            style={{
                                flex: 1,
                                backgroundColor: COLORS.primary,
                                height: `${(height / 40) * 100}%`,
                                opacity,
                                borderTopLeftRadius: 2,
                                borderTopRightRadius: 2
                            }}
                        />
                    );
                })}
            </View>
            <Text style={{ textAlign: 'center', fontSize: 10, color: theme.textMuted, marginTop: 4 }}>
                24 Hour Energy Curve
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        marginVertical: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: 8,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    description: {
        fontSize: FONT_SIZES.sm,
        marginBottom: SPACING.lg,
    },
    timeControl: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    timeBlock: {
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    timeDisplay: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    visualizer: {
        marginTop: SPACING.sm,
        marginBottom: SPACING.sm,
    }
});
