import React, { useState } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import { CollaborationService } from '../../services/collaborationService';

interface ShareModalProps {
    visible: boolean;
    onClose: () => void;
    itemId: string;
    itemTitle: string;
    ownerId: string; // Current user ID (mock for now if null)
}

export const ShareModal = ({ visible, onClose, itemId, itemTitle, ownerId }: ShareModalProps) => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInvite = async () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        // Simulate owner ID if missing (e.g. local first)
        const effectiveOwnerId = ownerId || 'local_user';

        const result = await CollaborationService.shareArea(itemId, effectiveOwnerId, email);
        setLoading(false);

        if (result) {
            Alert.alert('Success', `Invited ${email} to collaborate on "${itemTitle}".`);
            setEmail('');
            onClose();
        } else {
            Alert.alert('Error', 'Failed to send invitation. Please try again.');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.surface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Share "{itemTitle}"</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.label, { color: theme.textSecondary }]}>
                        Invite collaborators by email:
                    </Text>

                    <TextInput
                        style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.surfaceLight }]}
                        placeholder="colleague@example.com"
                        placeholderTextColor={theme.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                        <Text style={{ fontSize: 12, color: theme.textSecondary, flex: 1, marginLeft: 8 }}>
                            Collaborators will be able to view and edit tasks in this workspace.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: COLORS.primary }]}
                        onPress={handleInvite}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Send Invitation</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    container: {
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    label: {
        fontSize: FONT_SIZES.md,
        marginBottom: SPACING.sm,
    },
    input: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
        fontSize: FONT_SIZES.md,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary + '10', // 10% opacity hex
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
        alignItems: 'center'
    },
    button: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: FONT_SIZES.md,
    }
});
