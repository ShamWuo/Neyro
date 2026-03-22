import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { SPACING, BORDER_RADIUS, FONT_SIZES } from '../../src/constants';
import { Card } from '../../src/components/common/Card';

interface MenuItemProps {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: string;
    description: string;
    color: string;
}

export default function MenuScreen() {
    const { theme } = useTheme();
    const router = useRouter();

    const menuItems: MenuItemProps[] = [
        {
            title: 'Statistics',
            icon: 'bar-chart',
            route: '/(tabs)/stats',
            description: 'View your productivity insights',
            color: theme.textPrimary,
        },
        {
            title: 'History',
            icon: 'time',
            route: '/(tabs)/history',
            description: 'Review past sessions and completed tasks',
            color: theme.textPrimary,
        },
        {
            title: 'Schedule',
            icon: 'calendar',
            route: '/(tabs)/schedule',
            description: 'Plan your days and time blocking',
            color: theme.textPrimary,
        },
        {
            title: 'Community',
            icon: 'people',
            route: '/(tabs)/community',
            description: 'Connect with other users',
            color: theme.textPrimary, // Or specific brand color if desired
        },
        {
            title: 'Archive',
            icon: 'archive',
            route: '/(tabs)/inbox/archive',
            description: 'View completed projects and old items',
            color: theme.textPrimary,
        },
        {
            title: 'Settings',
            icon: 'settings',
            route: '/(tabs)/settings',
            description: 'Manage your account and preferences',
            color: theme.textPrimary,
        },
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.content}
        >
            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.7}
                    >
                        <Card style={styles.card}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.surfaceLight }]}>
                                <Ionicons name={item.icon} size={32} color={item.color} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title}</Text>
                                <Text style={[styles.description, { color: theme.textSecondary }]}>
                                    {item.description}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
    },
    header: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        marginBottom: SPACING.xl,
    },
    grid: {
        gap: SPACING.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        // padding and borderRadius handled by Card component defaults or overridden if needed. 
        // Card default padding is 'medium' (approx 16/SPACING.md or lg). 
        // Let's rely on Card's default padding or pass prop if needed.
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: FONT_SIZES.sm,
    },
});
