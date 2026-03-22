import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { COLORS, SPACING, FONT_SIZES } from '../src/constants';
import { useFocusTimer } from '../src/hooks/useFocusTimer';
import { useNeyroStore } from '../src/store/useNeyroStore';
import { TimerDisplay } from '../src/components/timer/TimerDisplay';
import { TimerControls } from '../src/components/timer/TimerControls';
import { TaskPickerModal } from '../src/components/timer/TaskPickerModal';
import { CaptureBuffer } from '../src/components/focus/CaptureBuffer';

export default function FocusScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const {
        status,
        elapsed,
        start,
        pause,
        resume,
        save,
        selectedProjectId,
        currentProject,
        selectProject,
        selectTask,
        currentTask
    } = useFocusTimer();

    const activeProjects = useNeyroStore(state => state.activeProjects);
    const tasks = useNeyroStore(state => state.tasks) || [];
    const [pickerVisible, setPickerVisible] = useState(false);
    const [captureVisible, setCaptureVisible] = useState(false);

    // Context Switch Shield
    useEffect(() => {
        const backAction = () => {
            if (status === 'running') {
                Alert.alert(
                    "Hold on!",
                    "You're in the middle of a focus session. Are you sure you want to break flow?",
                    [
                        { text: "Detailed Notes", onPress: () => setCaptureVisible(true) }, // Quick capture instead
                        { text: "Stay Focused", onPress: () => null, style: "cancel" },
                        { text: "Exit", onPress: () => router.back(), style: "destructive" }
                    ]
                );
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [status]);

    const handleBack = () => {
        if (status === 'running') {
            Alert.alert(
                "Hold on!",
                "You're in the middle of a focus session. Are you sure you want to break flow?",
                [
                    { text: "Quick Capture", onPress: () => setCaptureVisible(true) },
                    { text: "Stay Focused", onPress: () => null, style: "cancel" },
                    { text: "Exit", onPress: () => router.back(), style: "destructive" }
                ]
            );
        } else {
            router.back();
        }
    };

    const handleSave = async () => {
        const result = await save();
        if (result === true) {
            router.back();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: currentTask ? "Deep Work (Task)" : "Deep Work",
                headerLeft: () => (
                    <TouchableOpacity onPress={handleBack} style={{ marginLeft: 16 }}>
                        <Ionicons name="close" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                )
            }} />

            <View style={styles.content}>
                <View style={styles.projectSection}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>FOCUSING ON</Text>
                    <TouchableOpacity
                        style={[styles.projectSelector, { backgroundColor: theme.surface }]}
                        onPress={() => setPickerVisible(true)}
                    >
                        <Ionicons name={currentTask ? "checkbox-outline" : "briefcase-outline"} size={20} color={theme.primary} />
                        <Text style={[styles.projectName, { color: theme.textPrimary }]}>
                            {currentTask ? currentTask.title : (currentProject ? currentProject.title : "Select Focus")}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                </View>

                <TimerDisplay seconds={elapsed} isRunning={status === 'running'} />

                <TimerControls
                    status={status}
                    onStart={start}
                    onPause={pause}
                    onResume={resume}
                    onSave={handleSave}
                />

                <Text style={[styles.hint, { color: theme.textMuted }]}>
                    "The successful warrior is the average man, with laser-like focus."
                </Text>

                <TouchableOpacity
                    style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setCaptureVisible(true)}
                >
                    <Ionicons name="flash-outline" size={16} color={theme.textMuted} style={{ marginRight: 6 }} />
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>Distracted? Quick Capture.</Text>
                </TouchableOpacity>
            </View>

            <TaskPickerModal
                visible={pickerVisible}
                projects={activeProjects}
                tasks={tasks}
                durationSeconds={elapsed}
                onSelectProject={(id) => {
                    selectProject(id);
                    setPickerVisible(false);
                }}
                onSelectTask={(id) => {
                    selectTask(id);
                    setPickerVisible(false);
                }}
                onCancel={() => setPickerVisible(false)}
            />

            <CaptureBuffer
                visible={captureVisible}
                onClose={() => setCaptureVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    projectSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        width: '100%',
    },
    label: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        marginBottom: SPACING.xs,
        letterSpacing: 1,
    },
    projectSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: 20,
        gap: SPACING.sm,
    },
    projectName: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
    hint: {
        marginTop: SPACING.xl * 2,
        fontStyle: 'italic',
        textAlign: 'center',
        opacity: 0.7,
        maxWidth: '80%',
    }
});
