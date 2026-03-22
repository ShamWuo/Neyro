import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../src/constants';
import { useNeyroStore } from '../src/store/useNeyroStore';
import { Ionicons } from '@expo/vector-icons';

type Step = 'intro' | 'inbox' | 'projects' | 'areas' | 'summary';

export default function WeeklyReviewScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const [step, setStep] = useState<Step>('intro');

    const inbox = useNeyroStore(state => state.inbox);
    const activeProjects = useNeyroStore(state => state.activeProjects);
    const updateProject = useNeyroStore(state => state.updateProject);
    const areas = useNeyroStore(state => state.areas);
    const updateAreaScore = useNeyroStore(state => state.updateAreaScore);

    const [scores, setScores] = useState<Record<string, number>>({});

    const nextStep = () => {
        switch (step) {
            case 'intro': setStep('inbox'); break;
            case 'inbox': setStep('projects'); break;
            case 'projects': setStep('areas'); break;
            case 'areas': setStep('summary'); break;
            case 'summary': router.back(); break;
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'intro':
                return (
                    <View style={styles.center}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                            <Ionicons name="refresh" size={64} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Weekly Review</Text>
                        <Text style={[styles.desc, { color: theme.textSecondary }]}>
                            "You can't do everything. But you can do the right things."
                        </Text>
                        <View style={[styles.timeChip, { backgroundColor: theme.surfaceLight }]}>
                            <Ionicons name="time-outline" size={16} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted }}>10 mins</Text>
                        </View>
                    </View>
                );
            case 'inbox':
                return (
                    <View>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Step 1: Clear Inbox</Text>
                        <Text style={{ color: theme.textSecondary, marginBottom: SPACING.xl }}>
                            You have {inbox.length} items remaining.
                        </Text>
                        {inbox.length > 0 ? (
                            <View style={[styles.messageBox, { backgroundColor: COLORS.error + '10' }]}>
                                <Ionicons name="alert-circle" size={32} color={COLORS.error} />
                                <Text style={[styles.messageText, { color: COLORS.error }]}>Process your inbox first!</Text>
                                <Pressable onPress={() => router.back()} style={styles.linkAction}>
                                    <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Go to Inbox</Text>
                                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                                </Pressable>
                            </View>
                        ) : (
                            <View style={[styles.messageBox, { backgroundColor: COLORS.success + '10' }]}>
                                <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                                <Text style={[styles.messageText, { color: COLORS.success }]}>Inbox Zero achieved.</Text>
                            </View>
                        )}
                    </View>
                );
            case 'projects':
                return (
                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Step 2: Review Projects</Text>
                        <Text style={{
                            color: activeProjects.length > 7 ? COLORS.error : theme.textSecondary,
                            marginBottom: SPACING.lg,
                            fontWeight: activeProjects.length > 7 ? 'bold' : 'normal'
                        }}>
                            {activeProjects.length > 7
                                ? `⚠️ You have ${activeProjects.length} active projects. Limit is 7.`
                                : `Review your ${activeProjects.length}/7 active projects.`}
                        </Text>

                        {activeProjects.length === 0 && (
                            <Text style={{ color: theme.textMuted, fontStyle: 'italic' }}>No active projects to review.</Text>
                        )}

                        {activeProjects.map(p => (
                            <View key={p.id} style={[
                                styles.card,
                                {
                                    backgroundColor: theme.surface,
                                    shadowColor: theme.shadows.sm.shadowColor,
                                    shadowOffset: theme.shadows.sm.shadowOffset,
                                    shadowOpacity: theme.shadows.sm.shadowOpacity,
                                    shadowRadius: theme.shadows.sm.shadowRadius,
                                    elevation: theme.shadows.sm.elevation,
                                }
                            ]}>
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{p.title}</Text>
                                    <Text style={{ color: theme.textMuted }}>{p.outcome || "No outcome defined"}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                                    <Pressable
                                        style={[styles.actionBtn, { borderColor: theme.border }]}
                                        onPress={() => updateProject(p.id, { status: 'paused' })}
                                    >
                                        <Ionicons name="pause-circle-outline" size={20} color={COLORS.warning} />
                                        <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>Pause</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[styles.actionBtn, { borderColor: theme.border }]}
                                        onPress={() => updateProject(p.id, { status: 'completed', completedAt: Date.now() })}
                                    >
                                        <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
                                        <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>Complete</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                );
            case 'areas':
                return (
                    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Step 3: Score Areas</Text>
                        <Text style={{ color: theme.textSecondary, marginBottom: SPACING.lg }}>
                            Rate your satisfaction (1-5).
                        </Text>
                        {areas.map(a => (
                            <View key={a.id} style={[styles.row, { borderBottomColor: theme.border }]}>
                                <Text style={{ flex: 1, color: theme.textPrimary, fontSize: 16, fontWeight: '500' }}>{a.title}</Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {[1, 2, 3, 4, 5].map(score => (
                                        <Pressable
                                            key={score}
                                            onPress={() => {
                                                setScores(s => ({ ...s, [a.id]: score }));
                                                updateAreaScore(a.id, score);
                                            }}
                                            style={[
                                                styles.scoreBtn,
                                                {
                                                    borderColor: theme.border,
                                                    backgroundColor: scores[a.id] === score ? COLORS.primary : 'transparent'
                                                }
                                            ]}
                                        >
                                            <Text style={{ color: scores[a.id] === score ? 'white' : theme.textPrimary, fontWeight: '600' }}>{score}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                );
            case 'summary':
                return (
                    <View style={styles.center}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.accent + '20' }]}>
                            <Ionicons name="trophy" size={64} color={COLORS.accent} />
                        </View>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>All Done!</Text>
                        <Text style={[styles.desc, { color: theme.textSecondary }]}>
                            You are ready to crush this week.
                        </Text>
                    </View>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                {renderContent()}
            </View>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                {step !== 'intro' && step !== 'summary' && (
                    <Pressable onPress={() => setStep('intro')} style={styles.btn}>
                        <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                    </Pressable>
                )}
                <Pressable
                    onPress={nextStep}
                    style={[
                        styles.btnPrimary,
                        {
                            backgroundColor: COLORS.primary,
                            shadowColor: COLORS.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8
                        }
                    ]}
                    disabled={step === 'inbox' && inbox.length > 0}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {step === 'summary' ? 'Finish' : 'Next'}
                    </Text>
                    {step !== 'summary' && <Ionicons name="arrow-forward" size={18} color="white" />}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: SPACING.lg },
    center: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: SPACING.sm },
    desc: { textAlign: 'center', fontSize: 18, lineHeight: 28, paddingHorizontal: 20 },
    timeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginTop: SPACING.xl,
    },
    sectionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: SPACING.xs },
    footer: { padding: SPACING.lg, borderTopWidth: 0, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    btn: { padding: 15, borderRadius: BORDER_RADIUS.full },
    btnPrimary: {
        padding: 16,
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 32,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8
    },
    messageBox: {
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.xl,
        alignItems: 'center',
        gap: SPACING.md,
    },
    messageText: {
        fontSize: 18,
        fontWeight: '600'
    },
    linkAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: SPACING.sm,
    },
    card: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
    },
    cardTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
    scoreBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        gap: 6
    }
});
