import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useNeyroStore } from '../../src/store/useNeyroStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import { Project, Task } from '../../src/database/schema';
import { db } from '../../src/database/client';
import { projects, tasks, notes } from '../../src/database/schema';
import { eq } from 'drizzle-orm';
import { TaskPreparationModal } from '../../src/components/tasks/TaskPreparationModal';
import { ShareModal } from '../../src/components/collaboration/ShareModal';
import { AgenticService } from '../../src/services/agenticService';
import { PredictiveAnalyticsService } from '../../src/services/predictiveAnalyticsService';

export default function ProjectDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const router = useRouter();

    // Store
    const activeProjects = useNeyroStore(state => state.activeProjects);
    const pausedProjects = useNeyroStore(state => state.pausedProjects);
    const completedProjects = useNeyroStore(state => state.completedProjects);
    const tasks = useNeyroStore(state => state.tasks);
    const addTask = useNeyroStore(state => state.addTask);
    const updateProject = useNeyroStore(state => state.updateProject);
    const activeNotes = useNeyroStore(state => state.notes);
    const saveNote = useNeyroStore(state => state.saveNote);
    const loadData = useNeyroStore(state => state.loadData);
    const toggleTask = useNeyroStore(state => state.toggleTask);
    const deleteTask = useNeyroStore(state => state.deleteTask);

    // Find Project
    const project =
        activeProjects.find(p => p.id === id) ||
        pausedProjects.find(p => p.id === id) ||
        completedProjects.find(p => p.id === id);

    // Derived Data
    const projectTasks = tasks.filter(t => t.parentId === id && t.parentType === 'project');
    const completedCount = projectTasks.filter(t => t.isCompleted).length;
    const progress = projectTasks.length > 0 ? completedCount / projectTasks.length : 0;

    // Local State
    const [taskTitle, setTaskTitle] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Notes
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [noteContent, setNoteContent] = useState('');

    // Agentic
    const [selectedTaskForPrep, setSelectedTaskForPrep] = useState<Task | null>(null);
    const [prepModalVisible, setPrepModalVisible] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);

    // Predictive
    const [velocity, setVelocity] = useState<{ velocity: number; trend: string } | null>(null);

    React.useEffect(() => {
        if (project?.id) {
            loadVelocity();
        }
    }, [project?.id]);

    const loadVelocity = async () => {
        if (project?.id) {
            const data = await PredictiveAnalyticsService.calculateProjectVelocity(project.id);
            setVelocity(data);
        }
    };

    // Initial Note Load
    const projectNote = activeNotes.find(n => n.parentId === id && n.parentType === 'project');
    useEffect(() => {
        if (projectNote) {
            setNoteContent(projectNote.content || '');
            setShowNoteInput(true);
        }
    }, [projectNote]);

    const handleAddTask = async () => {
        if (!taskTitle.trim() || !id) return;
        await addTask(taskTitle.trim(), id, 'project');
        setTaskTitle('');
    };

    const handleSaveNote = async () => {
        if (!id) return;
        await saveNote(id, 'project', noteContent, 'Project Note');
    };

    const handleSelectDate = async (day: any) => {
        if (id && day.dateString) {
            await updateProject(id as string, { deadline: day.dateString });
            setShowDatePicker(false);
        }
    };

    const handleOpenPrep = (task: Task) => {
        setSelectedTaskForPrep(task);
        setPrepModalVisible(true);
    };

    const handleRunPrep = async () => {
        if (selectedTaskForPrep) {
            // Trigger background service
            await AgenticService.prepareTask(selectedTaskForPrep.id, selectedTaskForPrep.title);
            // Refresh data (in real app, store would react to DB changes)
            loadData();
        }
    };

    if (!project) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.textMuted }}>Project not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderTask = ({ item }: { item: Task }) => (
        <View style={[styles.taskRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => toggleTask(item.id)} style={styles.checkbox}>
                <Ionicons
                    name={item.isCompleted ? "checkbox" : "square-outline"}
                    size={24}
                    color={item.isCompleted ? COLORS.success : theme.textMuted}
                />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[
                    styles.taskTitle,
                    {
                        color: item.isCompleted ? theme.textMuted : theme.textPrimary,
                        textDecorationLine: item.isCompleted ? 'line-through' : 'none'
                    }
                ]}>
                    {item.title}
                </Text>
                {item.dueDate && (
                    <Text style={{ fontSize: 12, color: theme.textSecondary }}>Due: {item.dueDate}</Text>
                )}
            </View>

            {/* Agentic Action Button */}
            {!item.isCompleted && (
                <TouchableOpacity
                    onPress={() => handleOpenPrep(item)}
                    style={{ padding: 4 }}
                >
                    <Ionicons
                        name="sparkles-outline"
                        size={20}
                        color={item.preparationStatus === 'ready' ? COLORS.success : COLORS.primary}
                    />
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color={theme.textMuted} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    headerTitle: 'Project Details',
                    headerTintColor: theme.textPrimary,
                    headerStyle: { backgroundColor: theme.surface }
                }}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>{project.title}</Text>
                    {project.description && (
                        <Text style={[styles.description, { color: theme.textSecondary }]}>{project.description}</Text>
                    )}

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={[styles.statItem, { backgroundColor: theme.surfaceLight }]}>
                            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{projectTasks.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tasks</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: theme.surfaceLight }]}>
                            <Text style={[styles.statValue, { color: COLORS.success }]}>{Math.round(progress * 100)}%</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Done</Text>
                        </View>
                        <View style={[styles.statItem, { backgroundColor: theme.surfaceLight }]}>
                            <Text style={[styles.statValue, { color: COLORS.accent }]}>
                                {velocity ? `${velocity.velocity}/wk` : '-'}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Velocity</Text>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View style={styles.badgeContainer}>
                        <View style={[styles.badge, { backgroundColor: theme.surfaceLight }]}>
                            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                                {project.status.toUpperCase()}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={[styles.badge, { backgroundColor: theme.surfaceLight, marginLeft: 8 }]}
                        >
                            <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Set Deadline'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShareModalVisible(true)}
                            style={[styles.badge, { backgroundColor: theme.surfaceLight, marginLeft: 8 }]}
                        >
                            <Ionicons name="share-outline" size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
                            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        backgroundColor: COLORS.primary,
                                        width: `${progress * 100}%`
                                    }
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: theme.textMuted }]}>
                            {Math.round(progress * 100)}% Complete ({completedCount}/{projectTasks.length})
                        </Text>
                    </View>
                </View>

                {/* Notes Section (Collapsible) */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => setShowNoteInput(!showNoteInput)}
                    >
                        <Text style={[styles.sectionTitle, { color: theme.textMuted, marginBottom: 0 }]}>
                            NOTES & RESOURCES
                        </Text>
                        <Ionicons
                            name={showNoteInput ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={theme.textMuted}
                        />
                    </TouchableOpacity>

                    {showNoteInput && (
                        <View style={[styles.notesContainer, { backgroundColor: theme.surface }]}>
                            <TextInput
                                style={[styles.notesInput, { color: theme.textPrimary }]}
                                multiline
                                placeholder="Jot down ideas, links, or context..."
                                placeholderTextColor={theme.textMuted}
                                value={noteContent}
                                onChangeText={setNoteContent}
                                onBlur={handleSaveNote}
                            />
                            <Text style={[styles.saveHint, { color: theme.textMuted }]}>
                                Auto-saved on exit
                            </Text>
                        </View>
                    )}
                </View>

                {/* Tasks List */}
                <View style={styles.taskList}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>TASKS</Text>
                    {projectTasks.length === 0 ? (
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No tasks yet. Add one below!</Text>
                    ) : (
                        projectTasks.map(task => (
                            <View key={task.id}>
                                {renderTask({ item: task })}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView >

            {/* Input Bar */}
            < KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
            >
                <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.textPrimary }]}
                    placeholder="Add a new task..."
                    placeholderTextColor={theme.textMuted}
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                    onSubmitEditing={handleAddTask}
                />
                <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
                    <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                </TouchableOpacity>
            </KeyboardAvoidingView >

            {/* Date Picker Modal */}
            < Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.calendarContainer, { backgroundColor: theme.surface }]}>
                        <Calendar
                            onDayPress={handleSelectDate}
                            markedDates={project.deadline ? { [project.deadline]: { selected: true, selectedColor: COLORS.primary } } : {}}
                            theme={{
                                backgroundColor: theme.surface,
                                calendarBackground: theme.surface,
                                textSectionTitleColor: theme.textSecondary,
                                selectedDayBackgroundColor: COLORS.primary,
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: COLORS.primary,
                                dayTextColor: theme.textPrimary,
                                textDisabledColor: theme.textMuted,
                                arrowColor: COLORS.primary,
                                monthTextColor: theme.textPrimary,
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            style={styles.closeModalButton}
                        >
                            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >
            <TaskPreparationModal
                visible={prepModalVisible}
                onClose={() => setPrepModalVisible(false)}
                task={selectedTaskForPrep}
                onPrepare={handleRunPrep}
            />
            <ShareModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                itemId={project.id}
                itemTitle={project.title}
                ownerId={project.userId || "local"}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.lg,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    description: {
        fontSize: FONT_SIZES.md,
        marginBottom: SPACING.md,
        lineHeight: 22,
    },
    badgeContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    badgeText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
    },
    progressContainer: {
        marginTop: SPACING.sm,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: SPACING.xs,
    },
    progressBarFill: {
        height: '100%',
    },
    progressText: {
        fontSize: FONT_SIZES.xs,
        textAlign: 'right',
    },
    taskList: {
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '700',
        marginBottom: SPACING.sm,
        letterSpacing: 1,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    checkbox: {
        paddingRight: SPACING.md,
    },
    taskTitle: {
        flex: 1,
        fontSize: FONT_SIZES.md,
    },
    deleteButton: {
        padding: SPACING.sm,
    },
    emptyText: {
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: SPACING.lg,
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    },
    input: {
        flex: 1,
        height: 44,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        marginRight: SPACING.sm,
    },
    addButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarContainer: {
        width: '90%',
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    closeModalButton: {
        marginTop: SPACING.md,
        alignItems: 'center',
        padding: SPACING.sm,
    },
    sectionContainer: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    notesContainer: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.xs,
        minHeight: 120,
    },
    notesInput: {
        fontSize: FONT_SIZES.md,
        lineHeight: 24,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    saveHint: {
        fontSize: FONT_SIZES.xs,
        textAlign: 'right',
        marginTop: SPACING.xs,
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    statItem: {
        flex: 1,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
    }
});
