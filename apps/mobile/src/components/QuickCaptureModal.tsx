import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    StyleSheet,
    Pressable,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNeyroStore } from '../store/useNeyroStore';
import { SPACING, BORDER_RADIUS, COLORS, FONT_SIZES } from '../constants';
import * as Haptics from 'expo-haptics';

interface QuickCaptureModalProps {
    visible: boolean;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

export function QuickCaptureModal({ visible, onClose }: QuickCaptureModalProps) {
    const { theme } = useTheme();
    const [text, setText] = useState('');
    const addToInbox = useNeyroStore(state => state.addToInbox);
    const inputRef = useRef<TextInput>(null);

    // Animation for the modal slide up
    const slideAnim = useRef(new Animated.Value(300)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Open animation
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 60,
                    friction: 8,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Focus input shortly after opening
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            // Close animation is handled by onClose wrapper usually, 
            // but for now we reset when props change
            setText('');
            slideAnim.setValue(300);
            fadeAnim.setValue(0);
        }
    }, [visible]);

    const handleSend = () => {
        if (text.trim()) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            addToInbox(text.trim());
            setText('');
            handleClose();
        }
    };

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={handleClose}
            animationType="none" // Custom animation
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* Backdrop */}
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Pressable style={styles.backdropPressable} onPress={handleClose} />
                </Animated.View>

                {/* Modal Content */}
                <Animated.View
                    style={[
                        styles.content,
                        {
                            backgroundColor: theme.surface === '#000000' ? '#1c1c1e' : theme.surface, // Specific dark mode tweak
                            transform: [{ translateY: slideAnim }],
                            borderTopColor: theme.primary, // Accent line
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Quick Capture</Text>
                        <Pressable onPress={handleClose} style={styles.closeBtn}>
                            <Ionicons name="close-circle" size={24} color={theme.textMuted} />
                        </Pressable>
                    </View>

                    <TextInput
                        ref={inputRef}
                        style={[styles.input, { color: theme.textPrimary }]}
                        placeholder="What's on your mind?"
                        placeholderTextColor={theme.textMuted}
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={280}
                        returnKeyType="send"
                        onSubmitEditing={handleSend}
                    />

                    <View style={styles.actionBar}>
                        <View style={styles.tools}>
                            <Pressable style={styles.toolBtn} onPress={() => alert('Voice Capture coming soon!')}>
                                <Ionicons name="mic-outline" size={24} color={theme.textSecondary} />
                            </Pressable>
                            <Pressable style={styles.toolBtn} onPress={() => alert('Photo Capture coming soon!')}>
                                <Ionicons name="image-outline" size={24} color={theme.textSecondary} />
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={handleSend}
                            style={[
                                styles.sendBtn,
                                {
                                    backgroundColor: text.trim() ? theme.primary : theme.surfaceLight,
                                    opacity: text.trim() ? 1 : 0.7
                                }
                            ]}
                            disabled={!text.trim()}
                        >
                            <Ionicons
                                name="arrow-up"
                                size={24}
                                color={text.trim() ? '#FFF' : theme.textMuted}
                            />
                        </Pressable>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdropPressable: {
        flex: 1,
    },
    content: {
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
        borderTopWidth: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    closeBtn: {
        padding: SPACING.xs,
    },
    input: {
        fontSize: FONT_SIZES.lg,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: SPACING.md,
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tools: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    toolBtn: {
        padding: SPACING.sm,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
