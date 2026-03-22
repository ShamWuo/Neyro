import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/constants';
import { useNeyroStore } from '../../../src/store/useNeyroStore';
import { Ionicons } from '@expo/vector-icons';

export default function AreasScreen() {
    const { theme } = useTheme();
    const areas = useNeyroStore(state => state.areas);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={areas}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ gap: SPACING.md }}
                contentContainerStyle={{ padding: SPACING.md }}
                renderItem={({ item }) => (
                    <View style={[
                        styles.card,
                        {
                            backgroundColor: theme.surface,
                            shadowColor: theme.shadows.sm.shadowColor,
                            shadowOffset: theme.shadows.sm.shadowOffset,
                            shadowOpacity: theme.shadows.sm.shadowOpacity,
                            shadowRadius: theme.shadows.sm.shadowRadius,
                            elevation: theme.shadows.sm.elevation,
                        }
                    ]}>
                        <View style={[styles.iconPlaceholder, { backgroundColor: theme.surfaceLight }]}>
                            {/* Placeholder icon logic based on title later */}
                            <Ionicons name="grid" size={24} color={COLORS.accent} />
                        </View>

                        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>

                        <View style={{ flex: 1 }} />

                        {/* Dynamic Health Score */}
                        {(() => {
                            // For now, use stored healthScore if available
                            // In production, this would call calculateAreaHealth(item.id)
                            const score = item.healthScore ?? 0;

                            if (score === 0) {
                                return (
                                    <Text style={{ fontSize: 11, color: theme.textMuted, fontStyle: 'italic' }}>
                                        Not yet reviewed
                                    </Text>
                                );
                            }

                            const healthColor = score >= 4 ? '#10b981' : score === 3 ? '#3b82f6' : score === 2 ? '#f59e0b' : '#ef4444';
                            const healthIcon = score >= 4 ? 'heart' : score === 3 ? 'pulse' : score === 2 ? 'alert-circle' : 'warning';

                            return (
                                <>
                                    <View style={[
                                        styles.scoreBadge,
                                        { backgroundColor: healthColor + '15' }
                                    ]}>
                                        <Ionicons
                                            name={healthIcon}
                                            size={12}
                                            color={healthColor}
                                        />
                                        <Text style={{
                                            color: healthColor,
                                            fontSize: 12,
                                            fontWeight: '700',
                                            marginLeft: 4,
                                        }}>
                                            {score}/5
                                        </Text>
                                    </View>

                                    {/* Neglect Indicator */}
                                    {score <= 2 && (
                                        <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="alert-circle" size={10} color={COLORS.error} />
                                            <Text style={{ fontSize: 9, color: COLORS.error, marginLeft: 3 }}>
                                                Needs attention
                                            </Text>
                                        </View>
                                    )}
                                </>
                            );
                        })()}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 100 }}>
                        <Ionicons name="layers-outline" size={64} color={theme.textMuted} />
                        <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 20 }}>
                            No areas defined (Health, Finance, Home, etc.)
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        minHeight: 140,
        marginBottom: SPACING.sm,
        // No border
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    }
});
