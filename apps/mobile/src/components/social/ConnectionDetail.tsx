import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { CollaborationService, PermissionType } from '../../services/collaborationService';
import { LocationView } from './LocationView';

interface ConnectionDetailProps {
    connectionId: string;
    name: string;
    onBack?: () => void;
}

export const ConnectionDetail = ({ connectionId, name, onBack }: ConnectionDetailProps) => {
    const { theme } = useTheme();

    // Local state for toggles (would be synced with DB in real implementation)
    const [permissions, setPermissions] = useState({
        screenTime: false,
        location: false,
        projects: true,
    });

    const togglePermission = async (key: keyof typeof permissions, type: PermissionType) => {
        const newValue = !permissions[key];
        setPermissions(prev => ({ ...prev, [key]: newValue }));

        // Simulate DB update
        if (newValue) {
            // In a real app, getUserID would connect to auth cache
            // await CollaborationService.grantPermission('my_id', connectionId, type);
        } else {
            // await CollaborationService.revokePermission('my_id', connectionId, type);
        }
    };

    const handleNudge = async () => {
        Alert.alert(
            "Send Focus Nudge",
            `Send a 25m Focus command to ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Send",
                    onPress: () => {
                        CollaborationService.sendFocusCommand(connectionId, 25);
                        Alert.alert("Sent", "Focus command delivered.");
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <View style={[styles.avatarLarge, { backgroundColor: COLORS.primary + '20' }]}>
                    <Text style={{ fontSize: 32, color: COLORS.primary, fontWeight: 'bold' }}>
                        {name.charAt(0)}
                    </Text>
                </View>
                <Text style={[styles.nameLarge, { color: theme.textPrimary }]}>{name}</Text>
                <Text style={[styles.status, { color: theme.textSecondary }]}>Online</Text>
            </View>

            {/* Actions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ACTIONS</Text>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                    onPress={handleNudge}
                >
                    <Ionicons name="flash" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ color: "white", fontWeight: "bold" }}>Send Focus Nudge</Text>
                </TouchableOpacity>
            </View>

            {/* Location View (if enabled) */}
            {permissions.location && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>LAST SEEN</Text>
                    <LocationView
                        lat={34.0522}
                        lng={-118.2437}
                        timestamp={Date.now() - 1000 * 60 * 15} // 15 mins ago
                        userName={name}
                    />
                </View>
            )}

            {/* Permissions */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>PERMISSIONS (THEY CAN...)</Text>

                <View style={[styles.settingRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Control Screen Time</Text>
                        <Text style={[styles.settingSub, { color: theme.textSecondary }]}>Allow them to limit your apps</Text>
                    </View>
                    <Switch
                        value={permissions.screenTime}
                        onValueChange={() => togglePermission('screenTime', 'screen_time_control')}
                        trackColor={{ false: theme.border, true: COLORS.primary }}
                    />
                </View>

                <View style={[styles.settingRow, { backgroundColor: theme.surface }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>View Location</Text>
                        <Text style={[styles.settingSub, { color: theme.textSecondary }]}>See your last known location</Text>
                    </View>
                    <Switch
                        value={permissions.location}
                        onValueChange={() => togglePermission('location', 'location_view')}
                        trackColor={{ false: theme.border, true: COLORS.primary }}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        borderBottomLeftRadius: BORDER_RADIUS.xl,
        borderBottomRightRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.lg,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    nameLarge: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    status: {
        fontSize: FONT_SIZES.sm,
    },
    section: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
        marginLeft: SPACING.sm,
        letterSpacing: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    settingLabel: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
    },
    settingSub: {
        fontSize: 12,
        marginTop: 2,
    }
});
