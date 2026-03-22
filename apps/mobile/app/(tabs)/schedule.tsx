import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Modal, Platform, FlatList, Switch, ScrollView, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants';
import { useSchedule } from '../../src/hooks/useSchedule';
import { formatDate } from '../../src/utils/formatters';
import { Card } from '../../src/components/common';
import { useProjects } from '../../src/hooks/useProjects';
import { useSettings } from '../../src/hooks/useSettings';
import { generatePracticeSchedule, AIScheduleSession, AIPlanPreferences } from '../../src/services/ai';
import { addSessionToCalendar } from '../../src/utils/calendar';
import { useTheme } from '../../src/context/ThemeContext';

import { useNavigation } from '@react-navigation/native';

// Define type for Agenda items
type AgendaItem = {
    id: string;
    name: string;
    height: number;
    day: string;
    duration: number;
    isCompleted: boolean;
    notificationId?: string | null;
    startTime?: string;
    type?: string;
    notes?: string;
};

export default function ScheduleScreen() {
    const { sessions, fetchSessions, addScheduledSession, updateScheduledSession, toggleComplete, deleteScheduledSession } = useSchedule();
    const { projects } = useProjects();
    const { settings } = useSettings(); // Destructured settings
    const router = useRouter();
    const { theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<{ [key: string]: AgendaItem[] }>({});

    // UI State
    const [calendarExpanded, setCalendarExpanded] = useState(false);

    // AI State
    const [aiLoading, setAiLoading] = useState(false);
    const [proposedSchedule, setProposedSchedule] = useState<AIScheduleSession[] | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [prefsModalVisible, setPrefsModalVisible] = useState(false);

    const [aiPrefs, setAiPrefs] = useState({
        totalMinutes: '60',
        timeInput: '09:00',
        amPm: 'AM' as 'AM' | 'PM',
        includeReview: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        focusAreas: [] as string[],
        selectedProjectIds: [] as string[]
    });

    const FOCUS_OPTIONS = ["Deep Work", "Shallow Work", "Admin", "Research", "Planning", "Review"];

    // Range Selection Logic
    const handleDayPressInModal = (day: any) => {
        const date = day.dateString;
        if (!aiPrefs.startDate || (aiPrefs.startDate && aiPrefs.endDate)) {
            // Start new range
            setAiPrefs(prev => ({ ...prev, startDate: date, endDate: '' }));
        } else if (aiPrefs.startDate && !aiPrefs.endDate) {
            // End range (handle reverse order)
            if (date < aiPrefs.startDate) {
                setAiPrefs(prev => ({ ...prev, startDate: date, endDate: aiPrefs.startDate }));
            } else {
                setAiPrefs(prev => ({ ...prev, endDate: date }));
            }
        }
    };

    const getMarkedDatesForModal = () => {
        const marks: any = {};
        if (aiPrefs.startDate) {
            marks[aiPrefs.startDate] = { startingDay: true, color: theme.primary, textColor: 'white' };
            if (aiPrefs.endDate) {
                marks[aiPrefs.endDate] = { endingDay: true, color: theme.primary, textColor: 'white' };
                // Fill in between? limiting to start/end for simplicity or computing loop
                // For now just start/end is fine, reader implies range.
                // Actually better to fill:
                let curr = new Date(aiPrefs.startDate);
                let end = new Date(aiPrefs.endDate);
                while (curr < end) {
                    const dS = curr.toISOString().split('T')[0];
                    if (dS !== aiPrefs.startDate) marks[dS] = { color: theme.primary + '33', textColor: theme.textPrimary }; // +33 for approx 20% opacity hex
                    curr.setDate(curr.getDate() + 1);
                }
                // Re-apply end to ensure style
                marks[aiPrefs.endDate] = { endingDay: true, color: theme.primary, textColor: 'white' };
            } else {
                marks[aiPrefs.startDate] = { startingDay: true, endingDay: true, color: theme.primary, textColor: 'white' };
            }
        }
        return marks;
    };

    // Edit State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingSession, setEditingSession] = useState<{ id: string, name: string, duration: string } | null>(null);

    // Load sessions on mount
    useEffect(() => {
        console.log("Fetching sessions on mount");
        fetchSessions();
    }, []); // Empty dependency to ensure it only runs once

    // Transform sessions to Agenda items
    useEffect(() => {
        const newItems: { [key: string]: AgendaItem[] } = {};

        sessions.forEach(session => {
            let date = session.date;
            if (date && date.includes('T')) {
                date = date.split('T')[0];
            }
            if (date) {
                if (!newItems[date]) {
                    newItems[date] = [];
                }
                newItems[date].push({
                    id: session.id,
                    name: session.focus || 'Practice Session', // Todo: Improve name mapping
                    height: 50,
                    day: date,
                    duration: session.durationMinutes,
                    isCompleted: session.isCompleted || false,
                    notificationId: session.notificationId,
                    startTime: (session as any).startTime, // Assume DB might store this later
                    type: (session as any).type,
                    notes: (session as any).notes
                });
            }
        });

        console.log("Updating items state from sessions", sessions.length);
        setItems(newItems);
    }, [sessions]);

    const renderItem = useCallback((item: AgendaItem) => {
        // Safety check - ensure item exists
        if (!item) {
            return <View style={{ height: 50, justifyContent: 'center', paddingLeft: 20 }}><Text style={{ color: theme.textMuted }}>Invalid Item</Text></View>;
        }

        const handleItemPress = () => {
            Alert.alert(
                item.name || 'Session',
                `Duration: ${item.duration || 0} mins\nStatus: ${item.isCompleted ? 'Completed' : 'Pending'}${item.notes ? `\n\nNotes: ${item.notes}` : ''}`,
                [
                    {
                        text: item.isCompleted ? 'Mark Incomplete' : 'Mark Complete',
                        onPress: () => toggleComplete(item.id, !item.isCompleted)
                    },
                    {
                        text: 'Edit',
                        onPress: () => {
                            setEditingSession({
                                id: item.id,
                                name: item.name,
                                duration: item.duration.toString()
                            });
                            setEditModalVisible(true);
                        }
                    },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                            Alert.alert("Delete Session", "Are you sure?", [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => deleteScheduledSession(item.id, item.notificationId) }
                            ])
                        }
                    },
                    { text: 'OK', style: 'cancel' }
                ]
            );
        };

        return (
            <TouchableOpacity
                style={[styles.item, { backgroundColor: theme.surfaceLight }, item.isCompleted && [styles.itemCompleted, { backgroundColor: theme.surface, borderLeftColor: theme.success }]]}
                onPress={handleItemPress}
                activeOpacity={0.7}
            >
                {/* Time Column */}
                <View style={styles.timeColumn}>
                    <Text style={[styles.timeText, { color: theme.primary }]}>{item.startTime || '—'}</Text>
                    <Text style={[styles.ampmText, { color: theme.textSecondary }]}>{item.startTime ? item.startTime.split(' ')[1] : ''}</Text>
                </View>

                {/* Content Column */}
                <View style={styles.itemContent}>
                    <Text style={[styles.itemText, { color: theme.textPrimary }, item.isCompleted && styles.textCompleted]}>{item.name || 'Session'}</Text>
                    <Text style={[styles.itemDetails, { color: theme.textSecondary }]}>{item.type ? item.type.toUpperCase() : 'PRACTICE'} • {item.duration} min</Text>
                </View>

                {/* Actions Column */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => {
                            setEditingSession({
                                id: item.id,
                                name: item.name,
                                duration: item.duration.toString()
                            });
                            setEditModalVisible(true);
                        }}
                        style={{ padding: 5 }}
                    >
                        <Ionicons name="create-outline" size={22} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert("Delete Session", "Are you sure?", [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => deleteScheduledSession(item.id, item.notificationId) }
                            ])
                        }}
                        style={{ padding: 5 }}
                    >
                        <Ionicons name="trash-outline" size={22} color={theme.error || '#FF5252'} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }, [toggleComplete, deleteScheduledSession, theme]);

    const renderEmptyDate = useCallback(() => {
        return (
            <View style={styles.emptyDate}>
                <Text style={[styles.emptyDateText, { color: theme.textMuted }]}>No session scheduled for today.</Text>
                <TouchableOpacity onPress={() => setPrefsModalVisible(true)}>
                    <Text style={{ color: theme.primary, marginTop: 5 }}>Tap to create a plan</Text>
                </TouchableOpacity>
            </View>
        );
    }, [theme]);

    const handleGeneratePlan = async () => {
        if (projects.length === 0 && !aiPrefs.includeReview) {
            Alert.alert("No Projects", "Add active projects or enable review sessions!");
            return;
        }
        setPrefsModalVisible(true);
    };

    const runAIPlanner = async () => {
        setPrefsModalVisible(false); // Close prefs
        setAiLoading(true);
        try {
            // Construct start time
            const fullTime = `${aiPrefs.timeInput} ${aiPrefs.amPm}`;

            const prefs: AIPlanPreferences = {
                startTime: fullTime,
                totalMinutes: parseInt(aiPrefs.totalMinutes) || 60,
                includeReview: aiPrefs.includeReview,
                startDate: aiPrefs.startDate,
                endDate: aiPrefs.endDate || aiPrefs.startDate, // Default to single day if no end
                focusAreas: aiPrefs.focusAreas,
                selectedProjectIds: aiPrefs.selectedProjectIds
            };

            const plan = await generatePracticeSchedule(projects, prefs);

            if (plan.length > 0) {
                setProposedSchedule(plan);
                setModalVisible(true);
            } else {
                Alert.alert("AI Error", "Could not generate a schedule.");
            }
        } catch (error) {
            Alert.alert("Error", error instanceof Error ? error.message : "Failed to generate schedule");
        } finally {
            setAiLoading(false);
        }
    };

    const saveProposedSchedule = async (exportToCalendar: boolean) => {
        if (!proposedSchedule) return;

        try {
            for (const session of proposedSchedule) {
                // 1. Save to App Database
                const sessionTitle = session.projectTitle || session.focus;

                await addScheduledSession(
                    session.date, // Use session date
                    session.durationMinutes,
                    sessionTitle,
                    session.projectId ? [session.projectId] : [],
                    session.startTime, // Pass startTime
                    session.type    // Pass type
                );

                // 2. Export to Calendar if requested
                if (exportToCalendar) {
                    // Parse Start Time
                    let dateObj = new Date(session.date);
                    if (session.startTime) {
                        const [time, period] = session.startTime.split(' ');
                        let [hours, minutes] = time.split(':').map(Number);
                        if (period === 'PM' && hours < 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;

                        // Set time on the date object (ensure local time usage)
                        // Note: session.date is YYYY-MM-DD. unique parsing might be needed to avoid timezone issues:
                        const [y, m, d] = session.date.split('-').map(Number);
                        dateObj = new Date(y, m - 1, d, hours, minutes);
                    }

                    await addSessionToCalendar(
                        sessionTitle,
                        `${session.notes}\nFocus: ${session.focus}`,
                        dateObj,
                        session.durationMinutes
                    );
                }
            }

            Alert.alert("Success", "Schedule saved!");
            setModalVisible(false);
            setProposedSchedule(null);
            fetchSessions();
        } catch (error) {
            Alert.alert("Error", "Failed to save schedule.");
        }
    };

    // Render preferences modal
    const renderPrefsModal = () => (
        <Modal
            visible={prefsModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setPrefsModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.surface, maxHeight: '95%' }]}>
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>AI Plan Settings</Text>
                    <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Select range, focus, and preferences</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* 1. Date Range */}
                        <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>Focus Period</Text>
                        <View style={{ borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, marginBottom: 15 }}>
                            <Calendar
                                current={new Date().toISOString().split('T')[0]}
                                onDayPress={handleDayPressInModal}
                                markingType={'period'}
                                markedDates={getMarkedDatesForModal()}
                                theme={{
                                    calendarBackground: theme.background,
                                    textSectionTitleColor: theme.textSecondary,
                                    selectedDayBackgroundColor: theme.primary,
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: theme.primary,
                                    dayTextColor: theme.textPrimary,
                                    textDisabledColor: theme.textMuted,
                                    arrowColor: theme.primary,
                                    monthTextColor: theme.textPrimary,
                                }}
                            />
                        </View>
                        <Text style={{ textAlign: 'center', color: theme.primary, marginBottom: 15, fontWeight: 'bold' }}>
                            {aiPrefs.startDate} {aiPrefs.endDate ? `to ${aiPrefs.endDate}` : '(Select End Date)'}
                        </Text>

                        {/* 2. Focus Areas */}
                        <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>Focus Areas</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
                            {FOCUS_OPTIONS.map(opt => {
                                const isSelected = aiPrefs.focusAreas.includes(opt);
                                return (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.chip, { backgroundColor: theme.surfaceLight, borderColor: theme.border }, isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                        onPress={() => {
                                            setAiPrefs(prev => ({
                                                ...prev,
                                                focusAreas: isSelected
                                                    ? prev.focusAreas.filter(f => f !== opt)
                                                    : [...prev.focusAreas, opt]
                                            }));
                                        }}
                                    >
                                        <Text style={[styles.chipText, { color: theme.textSecondary }, isSelected && { color: '#fff', fontWeight: 'bold' }]}>{opt}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* 3. Time & Duration */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Start Time Each Day</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TextInput
                                    style={[styles.textInput, { flex: 2, backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                                    value={aiPrefs.timeInput}
                                    onChangeText={(t) => setAiPrefs({ ...aiPrefs, timeInput: t })}
                                    placeholder="09:00"
                                    placeholderTextColor={theme.textMuted}
                                />
                                <View style={{ flexDirection: 'row', flex: 1, backgroundColor: theme.background, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: theme.border, overflow: 'hidden' }}>
                                    <TouchableOpacity
                                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: aiPrefs.amPm === 'AM' ? theme.primary : 'transparent' }}
                                        onPress={() => setAiPrefs({ ...aiPrefs, amPm: 'AM' })}
                                    >
                                        <Text style={{ color: aiPrefs.amPm === 'AM' ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>AM</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: aiPrefs.amPm === 'PM' ? theme.primary : 'transparent' }}
                                        onPress={() => setAiPrefs({ ...aiPrefs, amPm: 'PM' })}
                                    >
                                        <Text style={{ color: aiPrefs.amPm === 'PM' ? '#fff' : theme.textPrimary, fontWeight: 'bold' }}>PM</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Duration Per Day (min)</Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: theme.background, color: theme.textPrimary, borderColor: theme.border }]}
                                value={aiPrefs.totalMinutes}
                                onChangeText={(t) => setAiPrefs({ ...aiPrefs, totalMinutes: t })}
                                keyboardType="numeric"
                                placeholder="60"
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>

                        {/* 4. Options */}
                        <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.itemText, { color: theme.textPrimary }]}>Include Daily Review</Text>
                            <Switch
                                value={aiPrefs.includeReview}
                                onValueChange={(v) => setAiPrefs({ ...aiPrefs, includeReview: v })}
                                trackColor={{ false: theme.border, true: theme.primary }}
                            />
                        </View>

                        {/* 5. Projects Selection (Optional Expander) */}
                        <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>Active Projects</Text>
                        <View style={{ marginBottom: 20 }}>
                            {projects.length === 0 ? (
                                <Text style={{ color: theme.textMuted, fontStyle: 'italic' }}>No projects in workspace.</Text>
                            ) : (
                                projects.map(p => {
                                    const isSelected = aiPrefs.selectedProjectIds.length === 0 || aiPrefs.selectedProjectIds.includes(p.id);
                                    return (
                                        <TouchableOpacity
                                            key={p.id}
                                            style={[styles.pieceSelectRow, isSelected && { backgroundColor: theme.surfaceLight, borderRadius: BORDER_RADIUS.sm }]}
                                            onPress={() => {
                                                setAiPrefs(prev => {
                                                    const current = prev.selectedProjectIds.length === 0 ? projects.map(x => x.id) : prev.selectedProjectIds;
                                                    const newSelection = current.includes(p.id)
                                                        ? current.filter(id => id !== p.id)
                                                        : [...current, p.id];
                                                    // If all selected, set to empty array (implies all)
                                                    return { ...prev, selectedProjectIds: newSelection.length === projects.length ? [] : newSelection };
                                                });
                                            }}
                                        >
                                            <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={20} color={isSelected ? theme.primary : theme.textSecondary} />
                                            <Text style={{ marginLeft: 10, color: theme.textPrimary }}>{p.title}</Text>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>

                    </ScrollView>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border }]} onPress={() => setPrefsModalVisible(false)}>
                            <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={runAIPlanner}>
                            <Text style={styles.saveButtonText}>Generate Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );



    const saveEditedSession = async () => {
        if (!editingSession) return;
        try {
            await updateScheduledSession(editingSession.id, {
                focus: editingSession.name,
                durationMinutes: parseInt(editingSession.duration) || 30
            });
            setEditModalVisible(false);
            setEditingSession(null);
            fetchSessions();
        } catch (e) {
            Alert.alert("Error", "Failed to update session");
        }
    };

    const renderEditModal = () => (
        <Modal
            visible={editModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setEditModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Session</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Focus / Name</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 10, color: theme.textPrimary }}
                            value={editingSession?.name}
                            onChangeText={(t) => setEditingSession(prev => prev ? { ...prev, name: t } : null)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Duration (minutes)</Text>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 10, color: theme.textPrimary }}
                            value={editingSession?.duration}
                            keyboardType="numeric"
                            onChangeText={(t) => setEditingSession(prev => prev ? { ...prev, duration: t } : null)}
                        />
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border }]} onPress={() => setEditModalVisible(false)}>
                            <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={saveEditedSession}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Render the AI Review Modal
    const renderAIModal = () => (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Proposed Schedule</Text>
                    <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Total Time: {proposedSchedule?.reduce((acc, curr) => acc + curr.durationMinutes, 0)} mins</Text>

                    <FlatList
                        data={proposedSchedule}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={[styles.proposalItem, { backgroundColor: theme.background, borderLeftColor: theme.accent }]}>
                                <View style={{ flex: 1 }}>
                                    <View style={[styles.proposalTypeheader, { backgroundColor: theme.surfaceLight }]}>
                                        <Text style={[styles.proposalTypeText, { color: theme.textSecondary }]}>{item.type || 'Focus'}</Text>
                                    </View>
                                    <Text style={[styles.proposalTitle, { color: theme.textPrimary }]}>{item.projectTitle}</Text>
                                    <Text style={[styles.proposalDetails, { color: theme.textSecondary }]}>{item.focus}</Text>
                                    <Text style={[styles.proposalNotes, { color: theme.textSecondary }]}>{item.notes}</Text>
                                    {item.startTime && <Text style={[styles.proposalTime, { color: theme.textMuted }]}>Starts at {item.startTime}</Text>}
                                </View>
                                <Text style={[styles.proposalDuration, { color: theme.textPrimary }]}>{item.durationMinutes}m</Text>
                            </View>
                        )}
                        style={styles.proposalList}
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border }]} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>Close</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={() => Alert.alert("Save & Export?", "Add to device calendar as well?", [
                                { text: "App Only", onPress: () => saveProposedSchedule(false) },
                                { text: "App + Calendar", onPress: () => saveProposedSchedule(true) },
                                { text: "Cancel", style: "cancel" }
                            ])}
                        >
                            <Text style={styles.saveButtonText}>Accept Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {Platform.OS === 'web' ? (
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                    <Ionicons name="desktop-outline" size={64} color={theme.textMuted} />
                    <Text style={{ fontSize: FONT_SIZES.lg, color: theme.textPrimary, marginTop: 10 }}>
                        Schedule View
                    </Text>
                    <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 5 }}>
                        The detailed calendar view is optimized for mobile.
                    </Text>
                </View>
            ) : (
                <>
                    <View style={styles.headerRow}>
                        <Text style={[styles.dateHeader, { color: theme.textSecondary }]}>
                            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={() => setCalendarExpanded(!calendarExpanded)}>
                            <Text style={[styles.calendarToggle, { color: theme.primary }]}>
                                {calendarExpanded ? 'Hide Calendar' : 'Show Calendar'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {calendarExpanded && (
                        <View style={styles.calendarContainer}>
                            <Calendar
                                current={selectedDate}
                                onDayPress={(day: any) => {
                                    setSelectedDate(day.dateString);
                                }}
                                markedDates={{
                                    ...Object.keys(items).reduce((acc, date) => {
                                        if (items[date].length > 0) {
                                            // @ts-ignore
                                            acc[date] = { marked: true, dotColor: theme.primary };
                                        }
                                        return acc;
                                    }, {} as any),
                                    [selectedDate]: { selected: true, selectedColor: theme.primary }
                                }}
                                theme={{
                                    backgroundColor: theme.surface,
                                    calendarBackground: theme.surface,
                                    textSectionTitleColor: theme.textSecondary,
                                    selectedDayBackgroundColor: theme.primary,
                                    selectedDayTextColor: theme.textPrimary,
                                    todayTextColor: theme.primary,
                                    dayTextColor: theme.textPrimary,
                                    textDisabledColor: theme.textMuted,
                                    dotColor: theme.primary,
                                    selectedDotColor: theme.textPrimary,
                                    arrowColor: theme.primary,
                                    monthTextColor: theme.textPrimary,
                                    indicatorColor: theme.primary,
                                }}
                            />
                        </View>
                    )}

                    <View style={[styles.listContainer, { backgroundColor: theme.background }]}>
                        <FlatList
                            data={items[selectedDate] || []}
                            renderItem={({ item }) => renderItem(item)}
                            keyExtractor={(item, index) => item.id || `session-${index}`}
                            ListEmptyComponent={renderEmptyDate}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />

                        {/* Moved AI Button out of action row into its own prominent card */}
                        <TouchableOpacity style={[styles.aiMainButton, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleGeneratePlan}>
                            <View style={[styles.aiIconBox, { backgroundColor: theme.surfaceLight }]}>
                                <Ionicons name="sparkles" size={24} color={theme.accent} />
                            </View>
                            <View style={styles.aiButtonContent}>
                                <Text style={[styles.aiButtonTitle, { color: theme.textPrimary }]}>Generate AI Focus Plan</Text>
                                <Text style={[styles.aiButtonSubtitle, { color: theme.textSecondary }]}>Create a customized session for today</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                        </TouchableOpacity>

                        <View style={{ height: 20 }} />
                        {/* Spacer for bottom padding */}
                    </View>
                </>
            )}
            {renderAIModal()}
            {renderPrefsModal()}
            {renderEditModal()}
            {
                aiLoading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={{ color: '#fff', marginTop: 20, fontWeight: 'bold' }}>Generating Plan...</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 5 }}>Analyzing repertoire & preferences</Text>
                    </View>
                )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
    },
    calendarToggle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    calendarContainer: {
        marginBottom: 10,
        overflow: 'hidden',
    },
    calendarCollapsed: {
        height: 0,
    },
    sectionHeader: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 5,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipSelected: {
        // handled inline
    },
    chipText: {
        fontSize: FONT_SIZES.sm,
    },
    chipTextSelected: {
        // handled inline
    },
    pieceSelectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    pieceSelectRowActive: {
        borderRadius: BORDER_RADIUS.sm,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    dateHeader: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
        textTransform: 'uppercase',
    },
    listContent: {
        paddingBottom: 100, // Space for FAB and Buttons
    },
    item: {
        borderRadius: BORDER_RADIUS.md,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2', // default fallback, overridden inline
    },
    itemCompleted: {
        opacity: 0.6,
        borderLeftColor: '#4CAF50', // default fallback
    },
    itemContent: {
        flex: 1,
    },
    itemText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    textCompleted: {
        textDecorationLine: 'line-through',
    },
    itemDetails: {
        fontSize: FONT_SIZES.sm,
        marginTop: 4,
    },
    itemDuration: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    timeColumn: {
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
    },
    timeText: {
        fontWeight: 'bold',
        fontSize: FONT_SIZES.md,
    },
    ampmText: {
        fontSize: 10,
        textTransform: 'uppercase',
    },
    emptyDate: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyDateText: {
        fontStyle: 'italic',
        fontSize: FONT_SIZES.md,
    },
    // AI Modal & Prefs
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '85%',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        elevation: 10,
    },
    modalTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: FONT_SIZES.sm,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    textInput: {
        padding: 12,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        fontSize: FONT_SIZES.md,
    },
    inputLabel: {
        marginBottom: 5,
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    optionButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
        marginHorizontal: 4,
        borderWidth: 1,
    },
    optionButtonSelected: {
        // handled inline
    },
    optionText: {
        // handled inline
    },
    optionTextSelected: {
        // handled inline
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    proposalList: {
        marginTop: SPACING.md,
        marginBottom: SPACING.md,
    },
    proposalItem: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
    },
    proposalTypeheader: {
        padding: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    proposalTypeText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    proposalTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    proposalDetails: {
        fontSize: FONT_SIZES.sm,
        marginTop: 2,
    },
    proposalNotes: {
        fontSize: FONT_SIZES.sm,
        fontStyle: 'italic',
        marginTop: 4,
    },
    proposalDuration: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    proposalTime: {
        fontSize: FONT_SIZES.xs,
        marginTop: 2,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        gap: SPACING.md,
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
    },
    cancelButtonText: {
        fontWeight: '600',
    },
    saveButton: {
        flex: 2,
        padding: 15,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: FONT_SIZES.md,
    },
    aiButtonContainer: {
        padding: 20,
        paddingBottom: 100, // Stay above FAB
        alignItems: 'center',
    },
    aiMainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: BORDER_RADIUS.lg,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    aiIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    aiButtonContent: {
        flex: 1,
    },
    aiButtonTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    aiButtonSubtitle: {
        fontSize: FONT_SIZES.sm,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
});
