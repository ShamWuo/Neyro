import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider'; // Make sure this is installed or use basic
import { Ionicons } from '@expo/vector-icons';
import { CollaborationService } from '../../services/collaborationService';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants';

interface RemoteFocusControlProps {
    targetUserId: string;
    targetName: string;
}

export const RemoteFocusControl = ({ targetUserId, targetName }: RemoteFocusControlProps) => {
    const [duration, setDuration] = useState(25);
    const [loading, setLoading] = useState(false);

    const handleStartSession = async () => {
        setLoading(true);
        try {
            await CollaborationService.sendFocusCommand(targetUserId, duration);
            Alert.alert("Session Started", `You've started a ${duration} min focus session for ${targetName}.`);
        } catch (e) {
            Alert.alert("Error", "Failed to start remote session.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="timer" size={24} color={COLORS.primary} />
                <Text style={styles.title}>Control Screen Time</Text>
            </View>

            <Text style={styles.subtitle}>
                Set a focus session for {targetName}. They will be locked into Focus Mode.
            </Text>

            <View style={styles.sliderContainer}>
                <Text style={styles.durationText}>{duration} Minutes</Text>
                {/* Fallback UI if slider package issues, simple increment/decrement */}
                <View style={styles.controls}>
                    <TouchableOpacity onPress={() => setDuration(Math.max(5, duration - 5))} style={styles.btnSmall}>
                        <Ionicons name="remove" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDuration(Math.min(120, duration + 5))} style={styles.btnSmall}>
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleStartSession}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Start Focus Session</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginVertical: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    title: { fontSize: 18, fontWeight: 'bold', marginLeft: SPACING.sm, color: COLORS.textPrimary },
    subtitle: { color: COLORS.textSecondary, marginBottom: SPACING.lg },
    sliderContainer: { alignItems: 'center', marginBottom: SPACING.lg },
    durationText: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: SPACING.md },
    controls: { flexDirection: 'row', gap: 20 },
    btnSmall: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center'
    },
    btn: {
        backgroundColor: COLORS.error, // Red for "Control" / Serious action
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center'
    },
    btnDisabled: { opacity: 0.7 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
