import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../../src/constants';
import { useNeyroStore } from '../../../src/store/useNeyroStore';

export default function InboxHubScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { inbox, activeProjects, areas } = useNeyroStore();

    // Navigation Helpers
    const navTo = (path: string) => router.push(path as any);

    const renderStatCard = (title: string, count: number, icon: any, color: string, path: string) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => navTo(path)}
        >
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{title}</Text>
                <Text style={[styles.cardCount, { color: theme.textSecondary }]}>{count} items</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Organization</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Inbox Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>INBOX</Text>
                    {renderStatCard('Inbox', inbox.length, 'file-tray-full', COLORS.primary, '/(tabs)/index')}
                    {/* Note: User wanted PARA in "Inbox" tab. "Inbox" items strictly might be in Home or here. 
                        Let's link to a filtered view or just keep them here later. 
                        For now, linking to Index (Home) where Inbox technically lives currently, 
                        OR we should move the Inbox List *here*. 
                        Let's assume "Inbox" items list moves here eventually.
                    */}
                </View>

                {/* PARA Functionality */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>PARA</Text>

                    {renderStatCard('Projects', activeProjects.length, 'briefcase', COLORS.accent, '/(tabs)/inbox/projects')}

                    {renderStatCard('Areas', areas.length, 'grid', COLORS.warning, '/(tabs)/inbox/areas')}

                    {renderStatCard('Resources', 0, 'library', COLORS.info, '/(tabs)/inbox/resources')}

                    {renderStatCard('Archive', 0, 'archive', theme.textMuted, '/(tabs)/inbox/archive')}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '700',
        marginBottom: SPACING.sm,
        letterSpacing: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginBottom: 2,
    },
    cardCount: {
        fontSize: FONT_SIZES.sm,
    },
});
