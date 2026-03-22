import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { PLANS, SubscriptionTier, subscriptionService } from '../../services/SubscriptionService';
import { Ionicons } from '@expo/vector-icons';

interface SubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    currentTier: SubscriptionTier;
    userId: string;
    onUpgrade: () => void; // Callback to refresh user state
}

export function SubscriptionModal({ visible, onClose, currentTier, userId, onUpgrade }: SubscriptionModalProps) {
    const [loading, setLoading] = useState(false);

    const handleSelectPlan = async (tier: SubscriptionTier) => {
        if (tier === currentTier) return;

        setLoading(true);
        try {
            // Mock payment flow
            await new Promise(resolve => setTimeout(resolve, 1000));
            await subscriptionService.upgradePlan(userId, tier);
            Alert.alert('Success', `You are now on the ${PLANS[tier].name} plan!`);
            onUpgrade();
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to update subscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Unlock Review Plans</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {Object.values(PLANS).map((plan) => {
                        const isCurrent = plan.id === currentTier;
                        return (
                            <TouchableOpacity
                                key={plan.id}
                                style={[
                                    styles.planCard,
                                    { borderColor: plan.color },
                                    isCurrent && styles.currentPlanCard
                                ]}
                                onPress={() => handleSelectPlan(plan.id)}
                                disabled={loading || isCurrent}
                            >
                                <View style={[styles.badge, { backgroundColor: plan.color }]}>
                                    <Text style={styles.badgeText}>{plan.name}</Text>
                                </View>

                                <Text style={styles.price}>{plan.price}</Text>
                                <View style={styles.features}>
                                    {plan.features.map((feature, index) => (
                                        <Text key={index} style={styles.featureRow}>• {feature}</Text>
                                    ))}
                                </View>

                                {isCurrent ? (
                                    <View style={styles.currentButton}>
                                        <Text style={styles.currentButtonText}>Current Plan</Text>
                                    </View>
                                ) : (
                                    <View style={[styles.upgradeButton, { backgroundColor: plan.color }]}>
                                        <Text style={styles.upgradeButtonText}>
                                            {loading ? 'Processing...' : `Upgrade to ${plan.name}`}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 50,
    },
    planCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    currentPlanCard: {
        opacity: 0.8,
        backgroundColor: '#F3F4F6',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 10,
    },
    badgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    price: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1F2937',
    },
    features: {
        marginBottom: 20,
    },
    featureRow: {
        fontSize: 15,
        color: '#4B5563',
        marginBottom: 8,
    },
    upgradeButton: {
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    upgradeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    currentButton: {
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#D1D5DB',
    },
    currentButtonText: {
        color: '#374151',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
