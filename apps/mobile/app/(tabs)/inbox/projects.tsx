import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../src/constants';
import { useNeyroStore } from '../../../src/store/useNeyroStore';
import { Ionicons } from '@expo/vector-icons';
import { Project } from '../../../src/database/schema';
import { useRouter } from 'expo-router';
import { calculateProjectHealth, getHealthColor } from '../../../src/utils/projectHealth';

export default function ProjectsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    // Mock data for now, would come from store
    const activeProjects: Project[] = useNeyroStore(state => state.activeProjects);
    const addProject = useNeyroStore(state => state.addProject);

    const MAX_PROJECTS = 7;
    const count = activeProjects.length;

    const handleCreateProject = () => {
        if (count >= MAX_PROJECTS) {
            Alert.alert(
                'Cognitive Limit Reached',
                'You have reached the limit of 7 active projects. Please complete or pause a project before starting a new one.',
                [{ text: 'OK', style: 'cancel' }]
            );
            return;
        }

        Alert.prompt(
            'New Project',
            'What would you like to accomplish?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Create',
                    onPress: (title?: string) => {
                        if (title && title.trim()) {
                            addProject(title);
                        }
                    }
                }
            ],
            'plain-text'
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>Active Projects</Text>
                    <Text style={{ color: theme.textSecondary }}>Focus on what matters.</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => (router as any).push('/focus')}
                        style={[styles.badge, { backgroundColor: theme.surfaceLight, flexDirection: 'row', alignItems: 'center', gap: 4 }]}
                    >
                        <Ionicons name="timer-outline" size={16} color={COLORS.primary} />
                        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Focus</Text>
                    </TouchableOpacity>
                    <View style={[styles.badge, { backgroundColor: theme.surfaceLight }]}>
                        <Text style={[
                            styles.counter,
                            { color: count > MAX_PROJECTS ? COLORS.error : COLORS.primary }
                        ]}>
                            {count}/{MAX_PROJECTS}
                        </Text>
                    </View>
                </View>
            </View>

            {count > MAX_PROJECTS && (
                <View style={[styles.warningInfo, { backgroundColor: COLORS.error + '15' }]}>
                    <Ionicons name="warning" size={20} color={COLORS.error} />
                    <Text style={[styles.warningText, { color: COLORS.error }]}>
                        Cognitive overload. Pause {count - MAX_PROJECTS} project{count - MAX_PROJECTS > 1 ? 's' : ''}.
                    </Text>
                </View>
            )}

            <FlatList
                data={activeProjects}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => {
                    const health = calculateProjectHealth(item.updatedAt, item.deadline, item.completedAt);

                    return (
                        <Pressable
                            onPress={() => router.push(`/project/${item.id}` as any)}
                            style={({ pressed }) => [
                                styles.projectCard,
                                {
                                    backgroundColor: theme.surface,
                                    // Exceptional UI: Shadow instead of border
                                    shadowColor: theme.shadows.md.shadowColor,
                                    shadowOffset: theme.shadows.md.shadowOffset,
                                    shadowOpacity: theme.shadows.md.shadowOpacity,
                                    shadowRadius: theme.shadows.md.shadowRadius,
                                    elevation: theme.shadows.md.elevation,
                                    transform: [{ scale: pressed ? 0.99 : 1 }],
                                    // De-emphasize stale projects
                                    opacity: health.isStale ? 0.6 : 1
                                }
                            ]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.projectTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                            </View>
                            {item.outcome && (
                                <Text style={[styles.outcome, { color: theme.textSecondary }]}>{item.outcome}</Text>
                            )}

                            {/* Project Health Indicator */}
                            {(() => {
                                const health = calculateProjectHealth(item.updatedAt, item.deadline, item.completedAt);
                                const healthColor = getHealthColor(health.healthScore);

                                return (
                                    <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <View style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: healthColor,
                                                marginRight: 8
                                            }} />
                                            <Text style={{ fontSize: 12, color: theme.textMuted, flex: 1 }}>
                                                {health.message}
                                            </Text>
                                        </View>
                                        {health.isStale && (
                                            <View style={[styles.statusTag, { backgroundColor: COLORS.error + '15', borderWidth: 0 }]}>
                                                <Ionicons name="alert-circle" size={12} color={COLORS.error} style={{ marginRight: 4 }} />
                                                <Text style={{ color: COLORS.error, fontSize: 11, fontWeight: '600' }}>STALE</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })()}
                        </Pressable>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="briefcase-outline" size={64} color={theme.textMuted} />
                        <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 20 }}>
                            No active projects. Start something!
                        </Text>
                    </View>
                }
            />

            <Pressable
                style={[styles.fab, { backgroundColor: COLORS.primary, shadowColor: COLORS.primary }]}
                onPress={handleCreateProject}
            >
                <Ionicons name="add" size={28} color="white" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
    },
    counter: {
        fontSize: 16,
        fontWeight: '700',
    },
    projectCard: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.md,
        // No border
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xs,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },
    outcome: {
        fontSize: 14,
        marginBottom: SPACING.md,
        lineHeight: 20,
    },
    statusTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    warningInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
        gap: 8,
    },
    warningText: {
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        opacity: 0.7,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    }
});
