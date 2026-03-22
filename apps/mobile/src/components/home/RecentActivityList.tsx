import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNeyroStore } from '../../store/useNeyroStore'; // Assuming we have access to tasks
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
import { Task } from '../../database/schema';

export const RecentActivityList = () => {
    const { theme } = useTheme();
    const { tasks } = useNeyroStore(); // Ensure tasks are pulled from store

    // Mock data if tasks empty, or just filter existing tasks
    // Sort by recent
    const recentTasks = tasks
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5); // Take top 5

    const renderItem = ({ item }: { item: Task }) => {
        const isCompleted = item.status === 'done';

        return (
            <View style={styles.itemContainer}>
                <View style={[styles.iconBox, { backgroundColor: isCompleted ? COLORS.success + '20' : theme.surfaceLight }]}>
                    <Ionicons
                        name={isCompleted ? "checkmark-circle" : "radio-button-off"}
                        size={24}
                        color={isCompleted ? COLORS.success : theme.textMuted}
                    />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {isCompleted ? "Completed" : "In Progress"} • {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.right}>
                    {/* "Amount" equivalent - maybe energy score or just an arrow */}
                    <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Activity</Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAll, { color: COLORS.primary[500] }]}>See all</Text>
                </TouchableOpacity>
            </View>

            {recentTasks.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
                    <Text style={{ color: theme.textMuted }}>No recent activity.</Text>
                </View>
            ) : (
                <View style={[styles.list, { backgroundColor: theme.surface }]}>
                    {recentTasks.map(task => (
                        <React.Fragment key={task.id}>
                            {renderItem({ item: task })}
                            {/* Separator */}
                            <View style={[styles.separator, { backgroundColor: theme.borderMuted }]} />
                        </React.Fragment>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 100, // Extra padding for tab bar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    seeAll: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    list: {
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: FONT_SIZES.sm,
    },
    right: {
        justifyContent: 'center',
    },
    separator: {
        height: 1,
        marginLeft: 72, // Align with text
    },
    emptyState: {
        padding: SPACING.lg,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.xl,
    }
});
