import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
// import { AgenticService } from '../../services/agenticService'; // In real usage

interface TaskPreparationModalProps {
    visible: boolean;
    onClose: () => void;
    task: any; // Type would be Task from schema
    onPrepare: () => void; // Trigger preparation
}

export const TaskPreparationModal = ({ visible, onClose, task, onPrepare }: TaskPreparationModalProps) => {
    const { theme } = useTheme();

    if (!task) return null;

    const isPreparing = task.preparationStatus === 'preparing';
    const isReady = task.preparationStatus === 'ready';
    const content = task.preparedContent ? JSON.parse(task.preparedContent) : null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.iconBox, { backgroundColor: COLORS.accent + '20', marginRight: 12 }]}>
                                <Ionicons name="construct" size={20} color={COLORS.accent} />
                            </View>
                            <View>
                                <Text style={[styles.title, { color: theme.textPrimary }]}>Task Prep</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Agentic Workflow</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>{task.title}</Text>

                        {!isReady && !isPreparing && (
                            <View style={[styles.emptyState, { borderColor: theme.border }]}>
                                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>
                                    Let AI fetch research, draft emails, or find resources for this task.
                                </Text>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                                    onPress={onPrepare}
                                >
                                    <Ionicons name="sparkles" size={18} color="white" style={{ marginRight: 8 }} />
                                    <Text style={{ color: 'white', fontWeight: '600' }}>Run Preparation Agent</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {isPreparing && (
                            <View style={styles.loadingState}>
                                <ActivityIndicator size="large" color={COLORS.accent} />
                                <Text style={{ color: theme.textSecondary, marginTop: 16 }}>
                                    Agents are working...
                                </Text>
                                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
                                    Searching web • Summarizing • Drafting
                                </Text>
                            </View>
                        )}

                        {isReady && content && (
                            <View>
                                {content.research && (
                                    <View style={[styles.section, { backgroundColor: theme.background }]}>
                                        <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>RESEARCH SUMMARY</Text>
                                        <Text style={[styles.sectionText, { color: theme.textPrimary }]}>
                                            {content.research.summary}
                                        </Text>
                                        <Text style={[styles.sourceText, { color: theme.textMuted }]}>
                                            Sources: {content.research.sources.map((s: any) => s.source).join(', ')}
                                        </Text>
                                    </View>
                                )}

                                {content.draft && (
                                    <View style={[styles.section, { backgroundColor: theme.background }]}>
                                        <Text style={[styles.sectionTitle, { color: COLORS.accent }]}>DRAFT GENERATED</Text>
                                        <View style={[styles.draftBox, { borderColor: theme.border }]}>
                                            <Text style={{ color: theme.textSecondary, fontWeight: '600', marginBottom: 4 }}>
                                                {content.draft.subject}
                                            </Text>
                                            <Text style={{ color: theme.textPrimary }}>
                                                {content.draft.body}
                                            </Text>
                                        </View>
                                        <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 8 }}>
                                            <Text style={{ color: COLORS.primary }}>Copy to Clipboard</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    {isReady && (
                        <View style={[styles.footer, { borderTopColor: theme.border }]}>
                            <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.border }]}>
                                <Text style={{ color: theme.textPrimary }}>Regenerate</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: COLORS.success }]}>
                                <Text style={{ color: 'white', fontWeight: '600' }}>Mark Prepared</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    content: {
        flex: 1,
    },
    taskTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '600',
        marginBottom: SPACING.xl,
    },
    emptyState: {
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: BORDER_RADIUS.full,
    },
    loadingState: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    section: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    sectionText: {
        lineHeight: 22,
        fontSize: 15,
        marginBottom: 8,
    },
    sourceText: {
        fontSize: 12,
    },
    draftBox: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        gap: SPACING.md,
    },
    secondaryButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
    },
    primaryButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS.md,
    }
});
