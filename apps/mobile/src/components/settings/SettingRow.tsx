import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, COLORS } from '../../constants'; // Static COLORS for icon default (or use primary)
import { useTheme } from '../../context/ThemeContext';

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onPress?: () => void;
    destructive?: boolean;
}

export function SettingRow({ icon, label, value, onPress, destructive }: SettingRowProps) {
    const { theme } = useTheme();

    return (
        <Pressable
            style={({ pressed }) => [
                styles.row,
                pressed && { opacity: 0.7 }
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.surfaceLight }]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={destructive ? COLORS.error : COLORS.primary}
                />
            </View>
            <View style={styles.content}>
                <Text style={[styles.label, { color: destructive ? COLORS.error : theme.textPrimary }]}>{label}</Text>
                {value ? <Text style={[styles.value, { color: theme.textSecondary }]}>{value}</Text> : null}
            </View>
            {onPress && (
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    label: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
    },
    value: {
        fontSize: FONT_SIZES.md,
    },
});
