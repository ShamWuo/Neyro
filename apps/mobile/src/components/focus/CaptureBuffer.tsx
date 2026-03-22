import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
import { useNeyroStore } from '../../store/useNeyroStore';

interface CaptureBufferProps {
    visible: boolean;
    onClose: () => void;
}

export const CaptureBuffer = ({ visible, onClose }: CaptureBufferProps) => {
    const { theme } = useTheme();
    const [text, setText] = useState('');
    const addToInbox = useNeyroStore(state => state.addToInbox);

    const handleCapture = () => {
        if (text.trim()) {
            addToInbox(text.trim(), 'free'); // Default to free for quick capture
            setText('');
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
                
                <View style={[styles.container, { backgroundColor: theme.surface }]}>
                    <View style={styles.header}>
                        <Ionicons name="flash-outline" size={20} color={COLORS.accent} />
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Quick Capture</Text>
                    </View>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Get it out of your head, then get back to flow.
                    </Text>
                    
                    <TextInput
                        style={[styles.input, { 
                            backgroundColor: theme.background, 
                            color: theme.textPrimary,
                            borderColor: theme.border 
                        }]}
                        placeholder="What's distracting you?"
                        placeholderTextColor={theme.textMuted}
                        value={text}
                        onChangeText={setText}
                        onSubmitEditing={handleCapture}
                        autoFocus
                    />
                    
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={{ color: theme.textMuted }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleCapture} 
                            style={[styles.captureButton, { backgroundColor: COLORS.accent }]}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Capture & Return</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
        gap: 8,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: FONT_SIZES.sm,
        marginBottom: SPACING.lg,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        fontSize: FONT_SIZES.md,
        marginBottom: SPACING.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SPACING.md,
    },
    cancelButton: {
        padding: SPACING.sm,
    },
    captureButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS.full,
    }
});
