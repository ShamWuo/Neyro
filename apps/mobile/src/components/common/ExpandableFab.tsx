import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

export interface FabAction {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
}

interface ExpandableFabProps {
    actions?: FabAction[]; // Optional now as we add default recording actions
    onRecordVideo?: () => void;
    onRecordAudio?: () => void;
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ExpandableFab({ actions = [], onRecordVideo, onRecordAudio }: ExpandableFabProps) {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    // Base tab bar height (approx 49-60) + standard margin (16) + insets
    const bottomPosition = 60 + 16 + insets.bottom;

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;

        Animated.spring(animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();

        setIsOpen(!isOpen);
    };

    const rotation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <View style={[styles.container, { bottom: bottomPosition }]}>
            {/* Background overlay when open */}
            {isOpen && (
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                {[
                    ...actions,
                    {
                        icon: 'videocam',
                        label: 'Video Recording',
                        onPress: () => onRecordVideo?.(),
                        color: COLORS.accent,
                    },
                    {
                        icon: 'mic',
                        label: 'Sound Recording',
                        onPress: () => onRecordAudio?.(),
                        color: COLORS.primary,
                    }
                ].map((action, index) => {
                    const translateY = animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0], // We handle position via flexbox order now or simpler transform
                    });

                    // Just fade in and scale up slightly
                    const scale = animation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.8, 0.9, 1],
                    });
                    const opacity = animation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0, 1],
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.actionWrapper,
                                {
                                    transform: [{ translateY }],
                                    opacity,
                                    // Disable pointer events when closed so invisible buttons aren't clickable
                                    zIndex: isOpen ? 1 : -1,
                                },
                            ]}
                        >
                            <View style={styles.labelContainer}>
                                <Text style={styles.labelText}>{action.label}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.miniFab, { backgroundColor: action.color || COLORS.surface }]}
                                onPress={() => {
                                    toggleMenu();
                                    action.onPress();
                                }}
                            >
                                <Ionicons name={action.icon as any} size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>

            {/* Main FAB */}
            <TouchableOpacity
                style={[styles.fab, isOpen && styles.fabOpen]}
                onPress={toggleMenu}
                activeOpacity={0.8}
            >
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Ionicons name="add" size={30} color="#fff" />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // bottom position is handled dynamically in the component
        right: SPACING.md,
        alignItems: 'center',
        zIndex: 999,
    },
    overlay: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 1000, // Large enough to cover screen
        height: 1000,
        // backgroundColor: 'rgba(0,0,0,0.3)', // Optional: Dim background
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 2,
    },
    fabOpen: {
        backgroundColor: COLORS.primary, // Could change color when open
    },
    actionsContainer: {
        position: 'absolute',
        bottom: 20, // Start slightly above the FAB center
        right: 8, // Align with the center of the main FAB (56 width) - (40 width) / 2 = 8
        alignItems: 'center',
        marginBottom: 56, // Push up by FAB height
        zIndex: 0,
    },
    actionWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 16, // Space between sub-buttons
        // The wrapper itself shouldn't be width constrained or it clips labels
        width: 200,
        paddingRight: 0,
    },
    miniFab: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: COLORS.surface,
    },
    labelContainer: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    labelText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
});
