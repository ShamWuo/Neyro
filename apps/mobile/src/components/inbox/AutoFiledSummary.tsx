import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';

// Mock data type
interface AutoFiledItem {
    id: string;
    content: string;
    destination: string;
    targetName: string;
}

export const AutoFiledSummary = () => {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(true); // Should be controlled by prop or store
    const [items, setItems] = useState<AutoFiledItem[]>([
        { id: '1', content: 'Buy milk', destination: 'project', targetName: 'Groceries' },
        { id: '2', content: 'Email boss', destination: 'area', targetName: 'Career' },
    ]);
    const [showDetails, setShowDetails] = useState(false);

    if (items.length === 0 || !visible) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.success + '20' }]}>
                    <Ionicons name="sparkles" size={16} color={COLORS.success} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.summaryText, { color: theme.textPrimary }]}>
                        <Text style={{ fontWeight: 'bold' }}>{items.length} items</Text> auto-filed while you were away.
                    </Text>
                </View>
                <TouchableOpacity onPress={() => setShowDetails(true)} style={styles.reviewButton}>
                    <Text style={[styles.reviewText, { color: COLORS.primary }]}>Review</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={18} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            <Modal visible={showDetails} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Auto-Filed Items</Text>
                            <TouchableOpacity onPress={() => setShowDetails(false)}>
                                <Ionicons name="close" size={24} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={items}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingBottom: SPACING.lg }}
                            renderItem={({ item }) => (
                                <View style={[styles.itemRow, { borderBottomColor: theme.border }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.itemContent, { color: theme.textPrimary }]}>{item.content}</Text>
                                        <View style={styles.itemMeta}>
                                            <Ionicons
                                                name={item.destination === 'project' ? 'briefcase-outline' : 'grid-outline'}
                                                size={12}
                                                color={theme.textSecondary}
                                            />
                                            <Text style={[styles.itemDestination, { color: theme.textSecondary }]}>
                                                Moved to {item.targetName}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.undoButton}>
                                        <Text style={{ color: COLORS.error, fontSize: 12 }}>Undo</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: SPACING.md,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    summaryText: {
        fontSize: FONT_SIZES.sm,
    },
    reviewButton: {
        marginRight: SPACING.md,
    },
    reviewText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        height: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    itemContent: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        marginBottom: 4,
    },
    itemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemDestination: {
        fontSize: FONT_SIZES.sm,
    },
    undoButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        backgroundColor: COLORS.error + '15',
        borderRadius: BORDER_RADIUS.sm,
    }
});
