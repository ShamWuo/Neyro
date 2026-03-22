import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface SubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
    const { user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!user) return;
        setLoading(true);

        // MOCK PAYMENT PROCESSING
        // In a real app, this would integrate with RevenueCat or Stripe
        setTimeout(async () => {
            try {
                const { error } = await supabase
                    .from('users')
                    .update({ subscription_tier: 'pro' })
                    .eq('id', user.id);

                if (error) throw error;

                await refreshProfile();
                Alert.alert("Welcome to Pro!", "You now have access to all premium features.");
                onClose();
            } catch (error) {
                Alert.alert("Error", "Failed to upgrade subscription.");
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="sparkles" size={40} color="#FFD700" />
                            </View>
                            <Text style={styles.title}>Upgrade to Pro</Text>
                            <Text style={styles.subtitle}>Unlock the full potential of your practice.</Text>
                        </View>

                        <View style={styles.featuresContainer}>
                            <FeatureItem
                                icon="musical-notes"
                                title="Unlimited AI Insights"
                                description="Get deep musical analysis for any piece in your repertoire."
                            />
                            <FeatureItem
                                icon="calendar"
                                title="Advanced Schedules"
                                description="AI-generated practice plans tailored to your needs."
                            />
                            <FeatureItem
                                icon="cloud-upload"
                                title="Cloud Sync"
                                description="Backup all your data and access it on any device."
                            />
                            <FeatureItem
                                icon="stats-chart"
                                title="Advanced Stats"
                                description="Track your progress with detailed charts."
                            />
                        </View>

                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>$4.99</Text>
                            <Text style={styles.period}>/ month</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.upgradeButton}
                            onPress={handleUpgrade}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.upgradeButtonText}>Start 7-Day Free Trial</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onClose} style={styles.maybeLaterButton}>
                            <Text style={styles.maybeLaterText}>Maybe Later</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function FeatureItem({ icon, title, description }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string }) {
    return (
        <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
                <Ionicons name={icon} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        height: '90%',
        padding: SPACING.lg,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    featuresContainer: {
        marginBottom: SPACING.xl,
    },
    featureItem: {
        flexDirection: 'row',
        marginBottom: SPACING.lg,
        alignItems: 'flex-start',
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        marginBottom: SPACING.lg,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    period: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginLeft: 5,
    },
    upgradeButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.md,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    upgradeButtonText: {
        color: '#fff',
        fontSize: FONT_SIZES.md,
        fontWeight: 'bold',
    },
    maybeLaterButton: {
        alignItems: 'center',
        padding: 10,
    },
    maybeLaterText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZES.md,
    },
});
