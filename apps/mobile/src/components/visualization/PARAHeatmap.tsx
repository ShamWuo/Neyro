import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../constants';
import { Project, Area } from '../../database/schema';
import { Ionicons } from '@expo/vector-icons';

interface PARAHeatmapProps {
    projects: Project[];
    areas: Area[];
}

const { width } = Dimensions.get('window');

export const PARAHeatmap = ({ projects, areas }: PARAHeatmapProps) => {
    const { theme } = useTheme();
    const router = useRouter();

    const getHealthColor = (project: Project) => {
        // Mock health logic based on status or recent activity
        // Real logic would check last task completion date
        if (project.status === 'completed') return COLORS.success;
        if (project.status === 'paused') return palette.brown;
        // Random for demo variety if no real metrics
        return COLORS.success;
    };

    const palette = {
        green: '#4caf50',
        yellow: '#ffeb3b',
        brown: '#795548',
        withered: '#9e9e9e'
    };

    // Calculate grid
    const projectNodes = projects.map(p => ({
        ...p,
        size: Math.random() * 40 + 40, // Mock size based on tasks
        health: p.status === 'active' ? 'healthy' : 'withered'
    }));

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>The Forest</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Your ecosystem's health at a glance.
                </Text>
            </View>

            <View style={styles.grid}>
                {projectNodes.map((p, i) => (
                    <TouchableOpacity
                        key={p.id}
                        style={[
                            styles.node,
                            {
                                width: p.size,
                                height: p.size,
                                borderRadius: p.size / 2,
                                backgroundColor: p.health === 'healthy' ? palette.green : palette.withered,
                                opacity: 0.9,
                                ...SHADOWS.md
                            }
                        ]}
                        onPress={() => router.push(`/project/${p.id}` as any)}
                    >
                        <Text
                            style={[
                                styles.nodeText,
                                { fontSize: Math.max(8, p.size / 5) }
                            ]}
                            numberOfLines={1}
                        >
                            {p.title}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* Add Area "Soil" or Containers later */}
            </View>

            <View style={[styles.legend, { backgroundColor: theme.surfaceLight }]}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: palette.green }]} />
                    <Text style={{ color: theme.textMuted, fontSize: 10 }}>Thriving</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: palette.withered }]} />
                    <Text style={{ color: theme.textMuted, fontSize: 10 }}>Dormant</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    header: {
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: FONT_SIZES.sm,
        marginTop: SPACING.xs,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: SPACING.lg,
        width: '100%',
        marginVertical: SPACING.xl,
    },
    node: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    nodeText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    legend: {
        flexDirection: 'row',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        gap: SPACING.lg,
        marginTop: SPACING.xl,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    }
});
