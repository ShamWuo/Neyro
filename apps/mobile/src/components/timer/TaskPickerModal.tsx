import React from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Task } from '../../database/schema';
import type { Project } from '../../types';
import { formatTimer } from '../../utils/formatters';

interface TaskPickerModalProps {
    visible: boolean;
    projects: Project[];
    tasks?: Task[];
    durationSeconds: number;
    onSelectProject: (projectId: string) => void;
    onSelectTask: (taskId: string) => void;
    onCancel: () => void;
}

export function TaskPickerModal({
    visible,
    projects,
    tasks = [],
    durationSeconds,
    onSelectProject,
    onSelectTask,
    onCancel,
}: TaskPickerModalProps) {
    const [expandedProject, setExpandedProject] = React.useState<string | null>(null);

    const toggleProject = (projectId: string) => {
        setExpandedProject(expandedProject === projectId ? null : projectId);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onCancel}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>{durationSeconds > 0 ? 'Save Focus Session' : 'Select Focus'}</Text>
                        {durationSeconds > 0 && <Text style={styles.duration}>{formatTimer(durationSeconds)}</Text>}
                    </View>
                </View>

                <Text style={styles.subtitle}>{durationSeconds > 0 ? 'What did you work on?' : 'What are you working on?'}</Text>

                {projects.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="list-outline" size={48} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>No active projects</Text>
                        <Text style={styles.emptySubtext}>Create a project first to track focus.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={projects}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            const projectTasks = tasks.filter(t => t.parentType === 'project' && t.parentId === item.id && !t.isCompleted);
                            const isExpanded = expandedProject === item.id;

                            return (
                                <View>
                                    <TouchableOpacity
                                        style={styles.item}
                                        onPress={() => onSelectProject(item.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.icon, { backgroundColor: COLORS.primary + '20' }]}>
                                            <Ionicons name="briefcase" size={20} color={COLORS.primary} />
                                        </View>
                                        <View style={styles.info}>
                                            <Text style={styles.itemTitle}>{item.title}</Text>
                                            {item.deadline && (
                                                <Text style={styles.itemSubtitle}>Due: {item.deadline}</Text>
                                            )}
                                        </View>
                                        {projectTasks.length > 0 && (
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    toggleProject(item.id);
                                                }}
                                                style={{ padding: 8 }}
                                            >
                                                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textMuted} />
                                            </TouchableOpacity>
                                        )}
                                        {!projectTasks.length && (
                                            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                                        )}
                                    </TouchableOpacity>

                                    {isExpanded && projectTasks.map(task => (
                                        <TouchableOpacity
                                            key={task.id}
                                            style={styles.subItem}
                                            onPress={() => onSelectTask(task.id)}
                                        >
                                            <Ionicons name="checkbox-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                                            <Text style={styles.subItemTitle}>{task.title}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        style={styles.list}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    closeButton: {
        padding: SPACING.sm,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
        marginRight: 40,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    duration: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '700',
        color: COLORS.primary,
        marginTop: SPACING.xs,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginVertical: SPACING.md,
    },
    list: {
        flex: 1,
        paddingHorizontal: SPACING.md,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    info: {
        flex: 1,
    },
    itemTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    itemSubtitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    subItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        paddingLeft: SPACING.xl * 2,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    subItemTitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
    },
    separator: {
        height: SPACING.sm,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    emptyText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
});
