import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
// import { AdaptiveAIService } from '../../services/adaptiveAIService';

export const NegativeConstraints = () => {
    const { theme } = useTheme();
    const [constraints, setConstraints] = useState([
        { id: '1', pattern: 'Side Hustle', reason: 'Don\'t suggest during 9-5 work hours' },
        { id: '2', pattern: 'Deep Work', reason: 'Never before 10 AM' }
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newPattern, setNewPattern] = useState('');
    const [newReason, setNewReason] = useState('');

    const handleAdd = () => {
        if (!newPattern.trim() || !newReason.trim()) return;

        const newItem = {
            id: Date.now().toString(),
            pattern: newPattern,
            reason: newReason
        };

        setConstraints([...constraints, newItem]);
        // In real app: await AdaptiveAIService.addNegativeConstraint(...)

        setNewPattern('');
        setNewReason('');
        setIsAdding(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>Negative Constraints</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        Tell the AI what NOT to do.
                    </Text>
                </View>
                <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={constraints}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ marginTop: SPACING.md }}
                renderItem={({ item }) => (
                    <View style={[styles.constraintItem, { backgroundColor: theme.background }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.pattern, { color: theme.textPrimary }]}>"{item.pattern}"</Text>
                            <Text style={[styles.reason, { color: theme.textMuted }]}>{item.reason}</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            setConstraints(constraints.filter(c => c.id !== item.id));
                        }}>
                            <Ionicons name="trash-outline" size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <Modal visible={isAdding} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add AI Rule</Text>

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>When I mention...</Text>
                        <TextInput
                            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                            placeholder="e.g. 'Project Alpha'"
                            placeholderTextColor={theme.textMuted}
                            value={newPattern}
                            onChangeText={setNewPattern}
                        />

                        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Never suggest...</Text>
                        <TextInput
                            style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                            placeholder="e.g. 'Scheduling on weekends'"
                            placeholderTextColor={theme.textMuted}
                            value={newReason}
                            onChangeText={setNewReason}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.modalButton}>
                                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAdd} style={[styles.modalButton, { backgroundColor: COLORS.primary }]}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Save Rule</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginBottom: 2,
    },
    description: {
        fontSize: FONT_SIZES.xs,
    },
    addButton: {
        padding: 4,
    },
    constraintItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.xs,
    },
    pattern: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    reason: {
        fontSize: FONT_SIZES.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    modalContent: {
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        marginBottom: SPACING.xs,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.md,
        gap: SPACING.md,
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS.md,
    }
});
