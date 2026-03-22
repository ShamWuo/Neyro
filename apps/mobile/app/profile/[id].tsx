import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { SocialService } from '../../src/services/SocialService';
import { CollaborationService } from '../../src/services/collaborationService';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../src/constants';
import { LocationView } from '../../src/components/collaboration/LocationView';
import { RemoteFocusControl } from '../../src/components/collaboration/RemoteFocusControl';

export default function ProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasLocationAccess, setLocationAccess] = useState(false);
    const [hasControlAccess, setControlAccess] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        if (!id || typeof id !== 'string') return;
        setLoading(true);
        try {
            const data = await SocialService.getProfile(id);
            setProfile(data);

            if (user?.id) {
                // Check permissions
                const loc = await CollaborationService.checkPermission(id, user.id, 'location_view');
                const ctrl = await CollaborationService.checkPermission(id, user.id, 'screen_time_control');
                setLocationAccess(loc);
                setControlAccess(ctrl);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={theme.primary} /></View>;
    }

    if (!profile) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: theme.textSecondary }}>User not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface }]}>
                <View style={styles.avatarLarge}>
                    <Ionicons name="person" size={40} color={'#888'} />
                </View>
                <Text style={[styles.name, { color: theme.textPrimary }]}>{profile.displayName || "Unknown User"}</Text>
                <Text style={[styles.bio, { color: theme.textSecondary }]}>{profile.bio || "No bio available"}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={[styles.statNum, { color: theme.textPrimary }]}>{profile.aiUsageCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>AI Tasks</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={[styles.statNum, { color: theme.textPrimary }]}>7</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Streak</Text>
                    </View>
                </View>
            </View>

            {/* Collaboration Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Collaboration</Text>

                {hasLocationAccess ? (
                    <LocationView data={profile.lastLocation} />
                ) : (
                    <View style={styles.infoBox}>
                        <Ionicons name="location-outline" size={20} color={theme.textMuted} />
                        <Text style={{ color: theme.textMuted, marginLeft: 10 }}>Location sharing is not enabled.</Text>
                    </View>
                )}

                {hasControlAccess ? (
                    <RemoteFocusControl targetUserId={profile.id} targetName={profile.displayName || "Partner"} />
                ) : (
                    <View style={styles.infoBox}>
                        <Ionicons name="lock-closed-outline" size={20} color={theme.textMuted} />
                        <Text style={{ color: theme.textMuted, marginLeft: 10 }}>Screen Time Control is not enabled.</Text>
                    </View>
                )}

                {/* For Demo purposes, button to grant permission (Self-Grant simulation for testing) */}
                <TouchableOpacity
                    style={styles.devBtn}
                    onPress={async () => {
                        if (user?.id && id !== user.id) {
                            // THIS USER (user.id) grants PERMISSION TO (id)
                            // But here we are viewing "id"'s profile. Ideally "Permissions" are managed in Settings.
                            // But for "Collaborating", maybe we want to REQUEST permission?
                            Alert.alert("Request Sent", "Requested permission to collaborate.");
                        }
                    }}
                >
                    <Text style={{ color: theme.primary }}>Request Collaboration Access</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: SPACING.xl, paddingBottom: SPACING.xl * 1.5, marginBottom: SPACING.md },
    avatarLarge: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee',
        justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md
    },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: SPACING.xs },
    bio: { fontSize: 16, marginBottom: SPACING.lg, textAlign: 'center' },
    statsRow: { flexDirection: 'row', gap: 40 },
    stat: { alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 12 },
    section: { padding: SPACING.lg },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING.md },
    infoBox: {
        flexDirection: 'row', alignItems: 'center', padding: SPACING.lg,
        backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md
    },
    devBtn: { marginTop: SPACING.md, alignItems: 'center', padding: SPACING.md }
});
