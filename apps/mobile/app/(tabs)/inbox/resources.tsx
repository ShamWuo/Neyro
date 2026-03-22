import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Platform,
    Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';
import { useNeyroStore } from '../../../src/store/useNeyroStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../../src/constants';

// Simple breadcrumb type
type Breadcrumb = { id: string | null; title: string };

export default function ResourcesScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const resources = useNeyroStore(state => state.resources);
    const addResource = useNeyroStore(state => state.addResource);
    const deleteResource = useNeyroStore(state => state.deleteResource);

    // Navigation State
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: null, title: 'Library' }]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newItemType, setNewItemType] = useState<'folder' | 'note'>('note');

    // Filter resources by current folder
    const currentItems = resources.filter(
        r => r.parentId === currentFolderId || (currentFolderId === null && !r.parentId)
    ).sort((a, b) => {
        // Folders first, then alphabetical
        if (a.isFolder === b.isFolder) return a.title.localeCompare(b.title);
        return a.isFolder ? -1 : 1;
    });

    const handleNavigate = (folderId: string, title: string) => {
        setCurrentFolderId(folderId);
        setBreadcrumbs(prev => [...prev, { id: folderId, title }]);
    };

    const handleNavigateBack = (index: number) => {
        const target = breadcrumbs[index];
        setCurrentFolderId(target.id);
        setBreadcrumbs(prev => prev.slice(0, index + 1));
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;

        await addResource(
            newTitle.trim(),
            newItemType === 'folder',
            currentFolderId
        );

        setNewTitle('');
        setModalVisible(false);
    };

    const handleDelete = (id: string, title: string) => {
        Alert.alert(
            "Delete Resource",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteResource(id) }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.row, { borderBottomColor: theme.border }]}
            onPress={() => {
                if (item.isFolder) {
                    handleNavigate(item.id, item.title);
                } else {
                    // Navigate to Note Editor
                    // @ts-ignore dynamic route
                    router.push(`/resource/${item.id}`);
                }
            }}
            onLongPress={() => handleDelete(item.id, item.title)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.isFolder ? theme.surfaceLight : 'transparent' }]}>
                <Ionicons
                    name={item.isFolder ? "folder" : "document-text"}
                    size={24}
                    color={item.isFolder ? theme.primary : theme.textSecondary}
                />
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
                    {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header / Breadcrumbs */}
            <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
                <View style={styles.breadcrumbContainer}>
                    {breadcrumbs.map((crumb, index) => (
                        <TouchableOpacity
                            key={crumb.id || 'root'}
                            onPress={() => handleNavigateBack(index)}
                            style={styles.crumbTouch}
                        >
                            <Text style={[
                                styles.crumbText,
                                { color: index === breadcrumbs.length - 1 ? theme.textPrimary : theme.textSecondary }
                            ]}>
                                {crumb.title}
                            </Text>
                            {index < breadcrumbs.length - 1 && (
                                <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* List */}
            <FlatList
                data={currentItems}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons
                            name={currentFolderId ? "folder-open-outline" : "library-outline"}
                            size={64}
                            color={theme.surfaceLight} // Subtle Icon
                        />
                        <Text style={{ color: theme.textSecondary, marginTop: 16, fontSize: FONT_SIZES.md }}>
                            {currentFolderId ? "Empty Folder" : "No Resources"}
                        </Text>
                        <Text style={{ color: theme.textMuted, marginTop: 8 }}>
                            Tap + to add notes or folders.
                        </Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Add Modal */}
            <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add to Library</Text>

                        <View style={styles.typeSelector}>
                            <Pressable
                                onPress={() => setNewItemType('note')}
                                style={[
                                    styles.typeBtn,
                                    newItemType === 'note' && { backgroundColor: theme.surfaceLight, borderColor: theme.primary }
                                ]}
                            >
                                <Ionicons name="document-text" size={24} color={newItemType === 'note' ? theme.primary : theme.textMuted} />
                                <Text style={{ color: newItemType === 'note' ? theme.primary : theme.textMuted, marginTop: 4 }}>Note</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setNewItemType('folder')}
                                style={[
                                    styles.typeBtn,
                                    newItemType === 'folder' && { backgroundColor: theme.surfaceLight, borderColor: theme.primary }
                                ]}
                            >
                                <Ionicons name="folder" size={24} color={newItemType === 'folder' ? theme.primary : theme.textMuted} />
                                <Text style={{ color: newItemType === 'folder' ? theme.primary : theme.textMuted, marginTop: 4 }}>Folder</Text>
                            </Pressable>
                        </View>

                        <TextInput
                            style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.background, borderColor: theme.border }]}
                            placeholder={`Title for new ${newItemType}...`}
                            placeholderTextColor={theme.textMuted}
                            value={newTitle}
                            onChangeText={setNewTitle}
                            autoFocus
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreate}
                                style={[styles.modalBtn, { backgroundColor: theme.primary, borderRadius: 8, paddingHorizontal: 16 }]}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    breadcrumbContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    crumbTouch: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    crumbText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        marginHorizontal: 4,
    },
    listContent: {
        paddingBottom: 100,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
    },
    itemMeta: {
        fontSize: FONT_SIZES.sm,
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
    },
    modalTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    typeBtn: {
        flex: 1,
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    input: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.lg,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SPACING.lg,
    },
    modalBtn: {
        paddingVertical: 8,
    }
});
