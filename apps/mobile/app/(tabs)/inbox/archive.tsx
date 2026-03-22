import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../../src/context/ThemeContext';
import { useNeyroStore } from '../../../src/store/useNeyroStore';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../../src/constants';
import { Ionicons } from '@expo/vector-icons';
import { Project } from '../../../src/database/schema';

type Tab = 'projects' | 'resources';

export default function ArchiveScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('projects');
    const completedProjects = useNeyroStore(state => state.completedProjects);
    // Assuming resources might have an archive state later, for now just placeholder
    const archivedResources = [];

    const updateProject = useNeyroStore(state => state.updateProject);
    const deleteProject = useNeyroStore(state => state.deleteProject);

    const handleProjectPress = (project: Project) => {
        Alert.alert(
            project.title,
            "What would you like to do?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reactivate",
                    onPress: () => {
                        updateProject(project.id, { status: 'active', completedAt: null });
                        Alert.alert("Project Active", "Project moved back to Active list.");
                    }
                },
                {
                    text: "Delete Permanently",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert(
                            "Confirm Delete",
                            "This cannot be undone.",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => deleteProject(project.id) }
                            ]
                        );
                    }
                }
            ]
        );
    };

    const renderProject = ({ item }: { item: Project }) => (
        <TouchableOpacity
            onPress={() => handleProjectPress(item)}
            activeOpacity={0.7}
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.textSecondary, textDecorationLine: 'line-through' }]}>
                    {item.title}
                </Text>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                Completed: {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Unknown'}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Tabs */}
            <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    onPress={() => setActiveTab('projects')}
                    style={[styles.tab, activeTab === 'projects' && { borderBottomColor: COLORS.primary }]}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'projects' ? COLORS.primary : theme.textMuted }
                    ]}>Projects</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('resources')}
                    style={[styles.tab, activeTab === 'resources' && { borderBottomColor: COLORS.primary }]}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'resources' ? COLORS.primary : theme.textMuted }
                    ]}>Resources</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'projects' ? (
                <FlatList
                    data={completedProjects}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: SPACING.md }}
                    renderItem={renderProject}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="archive-outline" size={48} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted, marginTop: 10 }}>No archived projects yet.</Text>
                        </View>
                    }
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="file-tray-full-outline" size={48} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted, marginTop: 10 }}>No archived resources.</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontWeight: '600',
        fontSize: 16,
    },
    card: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        opacity: 0.7,
    }
});
