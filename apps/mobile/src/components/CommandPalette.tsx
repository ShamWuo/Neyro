import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useNeyroStore } from '../store/useNeyroStore';
import { useUIStore } from '../store/useUIStore';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants';

type CommandItem = {
    id: string;
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: () => void;
    type: 'navigation' | 'action';
};

export const CommandPalette = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
    const { activeProjects, areas } = useNeyroStore();
    const [query, setQuery] = useState('');

    // Reset query when opening
    useEffect(() => {
        if (isCommandPaletteOpen) {
            setQuery('');
        }
    }, [isCommandPaletteOpen]);

    const commands: CommandItem[] = useMemo(() => {
        const list: CommandItem[] = [];

        // Global Actions
        list.push({
            id: 'action-create-task',
            title: 'Create New Task',
            subtitle: 'Add to Inbox',
            icon: 'add-circle-outline',
            action: () => {
                // Determine where to navigate involves context, for now go to inbox or open modal
                // Since this is global, maybe just navigate to inbox with auto-focus?
                router.push('/(tabs)/' as any);
            },
            type: 'action'
        });

        list.push({
            id: 'nav-focus',
            title: 'Start Focus Session',
            subtitle: 'Enter Deep Work Mode',
            icon: 'timer-outline',
            action: () => router.push('/focus' as any),
            type: 'navigation'
        });

        list.push({
            id: 'nav-visual',
            title: 'View Connectivity Forest',
            subtitle: 'Visualize Project Health',
            icon: 'leaf-outline',
            action: () => router.push('/visualization' as any),
            type: 'navigation'
        });

        list.push({
            id: 'nav-social',
            title: 'Connections',
            subtitle: 'Manage Social Circle',
            icon: 'people-outline',
            action: () => router.push('/social' as any),
            type: 'navigation'
        });

        // Projects
        activeProjects.forEach(p => {
            list.push({
                id: `proj-${p.id}`,
                title: p.title,
                subtitle: 'Project',
                icon: 'briefcase-outline',
                action: () => router.push(`/project/${p.id}` as any),
                type: 'navigation'
            });
        });

        // Areas
        areas.forEach(a => {
            list.push({
                id: `area-${a.id}`,
                title: a.title,
                subtitle: 'Area',
                icon: 'layers-outline',
                action: () => {
                    // Navigate to area details (if implemented) or just filtered view
                    // For now, assuming we might not have a dedicated area page yet, or use generic
                    // router.push(`/area/${a.id}`); 
                },
                type: 'navigation'
            });
        });

        return list;
    }, [activeProjects, areas, router]);

    const filteredCommands = useMemo(() => {
        if (!query) return commands;
        const lowerQuery = query.toLowerCase();
        return commands.filter(c =>
            c.title.toLowerCase().includes(lowerQuery) ||
            c.subtitle?.toLowerCase().includes(lowerQuery)
        );
    }, [query, commands]);

    const handleSelect = (item: CommandItem) => {
        setCommandPaletteOpen(false);
        item.action();
    };

    if (!isCommandPaletteOpen) return null;

    return (
        <Modal
            visible={isCommandPaletteOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setCommandPaletteOpen(false)}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    onPress={() => setCommandPaletteOpen(false)}
                    activeOpacity={1}
                />

                <View style={[styles.container, { backgroundColor: theme.surface }]}>
                    <View style={[styles.searchRow, { borderBottomColor: theme.border }]}>
                        <Ionicons name="search" size={20} color={theme.textMuted} />
                        <TextInput
                            style={[styles.input, { color: theme.textPrimary }]}
                            placeholder="Type a command or search..."
                            placeholderTextColor={theme.textMuted}
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => setCommandPaletteOpen(false)}>
                            <View style={[styles.kbd, { borderColor: theme.border }]}>
                                <Text style={{ fontSize: 10, color: theme.textMuted }}>ESC</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={filteredCommands}
                        keyExtractor={item => item.id}
                        style={styles.list}
                        keyboardShouldPersistTaps="always"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.item, { borderBottomColor: theme.border }]}
                                onPress={() => handleSelect(item)}
                            >
                                <Ionicons name={item.icon} size={20} color={theme.textSecondary} />
                                <View style={styles.itemContent}>
                                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                                    {item.subtitle && (
                                        <Text style={[styles.itemSubtitle, { color: theme.textMuted }]}>{item.subtitle}</Text>
                                    )}
                                </View>
                                {item.type === 'action' && (
                                    <Ionicons name="return-down-back" size={16} color={theme.textMuted} />
                                )}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={{ color: theme.textMuted }}>No results found.</Text>
                            </View>
                        }
                    />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        paddingTop: 100, // Top offset like VS Code / Spotlight
        paddingHorizontal: SPACING.md,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        borderRadius: BORDER_RADIUS.xl,
        maxHeight: '60%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        gap: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: FONT_SIZES.md,
        height: 40,
    },
    kbd: {
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    list: {

    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        gap: SPACING.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
    },
    itemSubtitle: {
        fontSize: FONT_SIZES.xs,
    },
    emptyState: {
        padding: SPACING.xl,
        alignItems: 'center',
    }
});
