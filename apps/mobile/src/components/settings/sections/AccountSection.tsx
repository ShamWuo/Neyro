import React from 'react';
import { View, Text, Alert, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SettingsSection } from '../SettingsSection';
import { SettingRow } from '../SettingRow';
import { SPACING, BORDER_RADIUS, FONT_SIZES, COLORS } from '../../../constants'; // Keep COLORS for primary/accent defaults if needed
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { validateDisplayName } from '../../../utils/validation';

// Helper for cross-platform prompt
const promptValue = (
    title: string,
    message: string,
    initialValue: string,
    callback: (value: string) => void,
    keyboardType: 'default' | 'plain-text' | 'numeric' = 'default'
) => {
    if (Platform.OS === 'ios') {
        Alert.prompt(
            title,
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: (val?: string) => callback(val || ''),
                },
            ],
            keyboardType === 'numeric' ? 'plain-text' : 'plain-text',
            initialValue,
            keyboardType === 'numeric' ? 'number-pad' : 'default'
        );
    } else {
        // Fallback for Android (ideally would be a custom modal, keeping simple for now)
        Alert.alert(
            'Edit Profile',
            'To edit your profile, please use the web dashboard or wait for the next Android update.',
            [{ text: 'OK' }]
        );
    }
};

import { SubscriptionModal } from '../../common/SubscriptionModal';
// Assuming SubscriptionTier is compatible or we map it. 
// Ideally SubscriptionTier matches 'free' | 'musician' | 'virtuoso' from schema.
import { subscriptionService, SubscriptionTier } from '../../../services/SubscriptionService';

export function AccountSection() {
    const { signOut, user, profile, isPro, updateProfile, refreshProfile } = useAuth();
    const { theme } = useTheme();
    const [showSubscription, setShowSubscription] = React.useState(false);

    // Derive tier from profile or isPro for backward compat
    const currentTier: string = profile?.subscriptionTier || (isPro ? 'musician' : 'free');

    const handleUpdateName = () => {
        promptValue(
            'Display Name',
            'Enter your display name',
            profile?.displayName || '',
            (name) => {
                const validation = validateDisplayName(name);
                if (!validation.isValid) {
                    Alert.alert('Invalid Name', validation.error);
                    return;
                }
                updateProfile({ displayName: name });
            }
        );
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Pro Status Card */}
            <LinearGradient
                colors={isPro ? [COLORS.primary, '#8B5CF6'] : [theme.surface, theme.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.profileCard, !isPro && { backgroundColor: theme.surface }]}
            >
                <View style={styles.profileHeader}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {profile?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: isPro ? '#fff' : theme.textPrimary }]}>
                            {profile?.displayName || 'Productivity User'}
                        </Text>
                        <Text style={[styles.profileEmail, { color: isPro ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                            {user?.email}
                        </Text>
                        {isPro && (
                            <View style={styles.proBadge}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.proText}>PRO MEMBER</Text>
                            </View>
                        )}
                    </View>
                </View>

                {currentTier !== 'free' && (
                    <TouchableOpacity style={styles.manageButton} onPress={() => setShowSubscription(true)}>
                        <Text style={styles.manageText}>Manage Subscription ({currentTier})</Text>
                    </TouchableOpacity>
                )}

                {!isPro && currentTier === 'free' && (
                    <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: theme.background }]}>
                        <Text style={styles.upgradeText}>Upgrade to Pro</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </LinearGradient>

            <SettingsSection title="Profile Settings">
                <SettingRow
                    icon="person-outline"
                    label="Display Name"
                    value={profile?.displayName || 'Set Name'}
                    onPress={handleUpdateName}
                />
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <SettingRow
                    icon="log-out-outline"
                    label="Sign Out"
                    value=""
                    onPress={handleSignOut}
                    destructive
                />
            </SettingsSection>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    profileCard: {
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: FONT_SIZES.sm,
        marginBottom: 8,
    },
    proBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    proText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    upgradeButton: {
        marginTop: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    upgradeText: {
        color: COLORS.primary,
        fontWeight: '600',
        marginRight: 4,
    },
    manageButton: {
        marginTop: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    manageText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginLeft: SPACING.md + 32 + SPACING.md,
    },
});
