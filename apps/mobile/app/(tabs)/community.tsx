import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../src/constants';

// Mock Data for Premium UI Demo
const NETWORK_UPDATES = [
    { id: '1', name: 'Sarah Drasner', action: 'completed a Deep Work session', time: '2h ago', avatar: null, highlight: true },
    { id: '2', name: 'Alex M.', action: 'reached 500h Focus milestone', time: '4h ago', avatar: null, highlight: false },
    { id: '3', name: 'Team Alpha', action: 'shared a new Project Template', time: '1d ago', avatar: null, highlight: false },
];

const CONNECTIONS = [
    { id: '1', name: 'Sarah Drasner', status: 'Focusing', role: 'Design Lead', avatar: null },
    { id: '2', name: 'Alex M.', status: 'Away', role: 'Engineer', avatar: null },
    { id: '3', name: 'Jenna K.', status: 'Online', role: 'Product', avatar: null },
    { id: '4', name: 'Davide R.', status: 'Offline', role: 'Artist', avatar: null },
];

export default function NetworkScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [filter, setFilter] = useState<'All' | 'Online' | 'Focusing'>('All');

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Network</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Stay in sync with your team.</Text>
            </View>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surfaceLight }]}>
                <Ionicons name="search" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
        </View>
    );

    const renderUpdateCard = ({ item }: { item: typeof NETWORK_UPDATES[0] }) => (
        <View style={[styles.updateCard, { backgroundColor: theme.surface }]}>
            <View style={[styles.avatarSmall, { backgroundColor: item.highlight ? theme.primary : theme.borderMuted }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.updateText, { color: theme.textPrimary }]}>
                    <Text style={{ fontWeight: 'bold' }}>{item.name}</Text> {item.action}
                </Text>
                <Text style={[styles.updateTime, { color: theme.textMuted }]}>{item.time}</Text>
            </View>
        </View>
    );

    const renderConnectionCard = ({ item }: { item: typeof CONNECTIONS[0] }) => (
        <TouchableOpacity style={[styles.connectionCard, { backgroundColor: theme.surface }]}>
            <View>
                <View style={[styles.avatarLarge, { backgroundColor: theme.surfaceLight }]}>
                    <Text style={styles.avatarText}>{item.name[0]}</Text>
                    {item.status === 'Focusing' && (
                        <View style={[styles.statusBadge, { backgroundColor: theme.accent }]}>
                            <Ionicons name="moon" size={10} color="#fff" />
                        </View>
                    )}
                    {item.status === 'Online' && (
                        <View style={[styles.statusBadge, { backgroundColor: theme.success }]} />
                    )}
                </View>
            </View>

            <View style={styles.connectionInfo}>
                <Text style={[styles.connectionName, { color: theme.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.connectionRole, { color: theme.textSecondary }]}>{item.role}</Text>
                <View style={[styles.statusPill, { backgroundColor: theme.background }]}>
                    <Text style={[styles.statusText, { color: theme.textMuted }]}>{item.status}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.textMuted} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {renderHeader()}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Highlights Section */}
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Highlights</Text>
                <View style={[styles.updatesContainer, { borderLeftColor: theme.borderMuted }]}>
                    {NETWORK_UPDATES.map(item => (
                        <View key={item.id} style={{ marginBottom: 12 }}>
                            {renderUpdateCard({ item })}
                        </View>
                    ))}
                </View>

                {/* Connections Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Connections</Text>
                    <TouchableOpacity>
                        <Text style={{ color: theme.primary, fontWeight: '600' }}>See All</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {['All', 'Online', 'Focusing', 'Nearby'].map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterPill,
                                { backgroundColor: filter === f ? theme.primary : theme.surface },
                                filter !== f && { borderWidth: 1, borderColor: theme.borderMuted }
                            ]}
                            onPress={() => setFilter(f as any)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: filter === f ? '#fff' : theme.textSecondary }
                            ]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.grid}>
                    {CONNECTIONS.filter(c => filter === 'All' || c.status === filter).map(item => (
                        <View key={item.id} style={styles.gridItem}>
                            {renderConnectionCard({ item })}
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                <Ionicons name="person-add" size={24} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', letterSpacing: -0.5 },
    headerSubtitle: { fontSize: FONT_SIZES.md, marginTop: 4 },
    iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

    scrollContent: { padding: SPACING.lg },

    sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', marginBottom: SPACING.md },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.md },

    updatesContainer: {
        paddingLeft: SPACING.md,
        borderLeftWidth: 2,
        marginLeft: 8,
    },
    updateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.md,
    },
    avatarSmall: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    updateText: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
    updateTime: { fontSize: FONT_SIZES.xs, marginTop: 4 },

    filterScroll: { marginBottom: SPACING.md },
    filterPill: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: SPACING.sm,
    },
    filterText: { fontWeight: '600', fontSize: FONT_SIZES.sm },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
    gridItem: { width: '47%' }, // 2 columns approx

    connectionCard: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        gap: SPACING.md,
        ...SHADOWS.sm, // Assuming SHADOWS exists in constants
    },
    avatarLarge: {
        width: 60, height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center',
        position: 'relative'
    },
    avatarText: { fontSize: 24, fontWeight: 'bold', color: '#888' },
    statusBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 18, height: 18, borderRadius: 9,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff'
    },
    connectionInfo: { alignItems: 'center', width: '100%' },
    connectionName: { fontWeight: 'bold', fontSize: FONT_SIZES.md, textAlign: 'center' },
    connectionRole: { fontSize: FONT_SIZES.xs, marginBottom: 8, textAlign: 'center' },
    statusPill: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    moreButton: { position: 'absolute', top: 10, right: 10 },

    fab: {
        position: 'absolute', bottom: SPACING.xl, right: SPACING.xl,
        width: 56, height: 56, borderRadius: 28,
        alignItems: 'center', justifyContent: 'center',
        elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
    }
});

