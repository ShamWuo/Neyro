import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
// import { SocialConnection } from '../../database/schema'; // Assuming schema exists

// Mock Data for now until DB is populated
const MOCK_CONNECTIONS = [
    { id: '1', name: 'Dr. Sarah', status: 'online', avatar: null, focusMode: false },
    { id: '2', name: 'Alex M.', status: 'offline', avatar: null, focusMode: true },
    { id: '3', name: 'Coach J', status: 'online', avatar: null, focusMode: false },
];

export const SocialScreen = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const [connections, setConnections] = useState(MOCK_CONNECTIONS);

    const renderItem = ({ item }: { item: typeof MOCK_CONNECTIONS[0] }) => (
        <TouchableOpacity
            style={[styles.row, { borderBottomColor: theme.border }]}
            onPress={() => router.push(`/social/${item.id}` as any)}
        >
            <View style={[styles.avatar, { backgroundColor: COLORS.primary + '20' }]}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
                    {item.name.charAt(0)}
                </Text>
                {item.status === 'online' && <View style={styles.onlineBadge} />}
            </View>

            <View style={styles.info}>
                <Text style={[styles.name, { color: theme.textPrimary }]}>{item.name}</Text>
                {item.focusMode && (
                    <View style={styles.focusBadge}>
                        <Ionicons name="moon" size={10} color={COLORS.accent} />
                        <Text style={styles.focusText}>Focus Mode</Text>
                    </View>
                )}
            </View>

            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={connections}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <TouchableOpacity style={[styles.fab, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="person-add" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.success,
        borderWidth: 2,
        borderColor: 'white',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    focusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    focusText: {
        fontSize: 10,
        color: COLORS.accent,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    }
});
