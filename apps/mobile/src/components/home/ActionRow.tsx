import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

interface ActionButtonProps {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accent?: boolean;
}

export const ActionRow = ({ onQuickCapture, onFocus, onNewProject }: { onQuickCapture: () => void, onFocus: () => void, onNewProject: () => void }) => {
    const { theme } = useTheme();

    const ActionButton = ({ title, icon, onPress, accent }: ActionButtonProps) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.btn,
                {
                    backgroundColor: accent ? COLORS.success : theme.surfaceLight,
                }
            ]}
        >
            <Ionicons
                name={icon}
                size={20}
                color={accent ? '#fff' : theme.textPrimary}
            />
            <Text style={[
                styles.btnText,
                { color: accent ? '#fff' : theme.textPrimary }
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ActionButton title="Capture" icon="bulb-outline" onPress={onQuickCapture} accent />
                <ActionButton title="New Project" icon="folder-open-outline" onPress={onNewProject} />
                <ActionButton title="Deep Focus" icon="moon" onPress={onFocus} />
                <TouchableOpacity style={[styles.moreBtn, { backgroundColor: theme.surfaceLight }]}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// Note: Titles "Send", "Add money", "Request" are placeholders to match Wise UI request.
// Mapped to: Quick Capture (Send), New Project (Add), Focus (Request) for now.

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.md,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: BORDER_RADIUS.full,
        gap: 8,
    },
    btnText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    moreBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
