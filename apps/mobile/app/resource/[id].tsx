import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useNeyroStore } from '../../src/store/useNeyroStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants';

export default function ResourceNoteScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const router = useRouter();

    // Store
    const resources = useNeyroStore(state => state.resources);
    const notes = useNeyroStore(state => state.notes);
    const saveNote = useNeyroStore(state => state.saveNote);

    // Derived Data
    const resource = resources.find(r => r.id === id);
    // Find existing note linked to this resource
    const existingNote = notes.find(n => n.parentId === id && n.parentType === 'resource');

    // Local State
    const [title, setTitle] = useState(resource?.title || '');
    const [content, setContent] = useState(existingNote?.content || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (resource) {
            setTitle(resource.title);
        }
    }, [resource]);

    useEffect(() => {
        if (existingNote) {
            setContent(existingNote.content || '');
        }
    }, [existingNote]);

    const handleSave = async () => {
        if (!id || !resource) return;
        setIsSaving(true);
        // We use the resource title as the note title for consistency, or allow divergent titles?
        // Let's force consistency for now or just allow the note to have its own internal title.
        // But the user is editing the "Resource".
        // Actually, update resource title if changed? 
        // For V1, let's just save the note content.

        await saveNote(id, 'resource', content, title);
        setIsSaving(false);
    };

    if (!resource) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.textMuted }}>Resource not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    headerTitle: '', // Custom header below
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                            <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 16 }}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    ),
                    headerTintColor: theme.textPrimary,
                    headerStyle: { backgroundColor: theme.surface }
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={100}
            >
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TextInput
                        style={[styles.titleInput, { color: theme.textPrimary }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Title"
                        placeholderTextColor={theme.textMuted}
                    // For now we don't update resource title in DB, just UI local
                    />
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                        {existingNote ? `Last edited ${new Date(existingNote.updatedAt).toLocaleDateString()}` : 'New Note'}
                    </Text>
                </View>

                <TextInput
                    style={[styles.contentInput, { color: theme.textPrimary }]}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    placeholder="Start writing..."
                    placeholderTextColor={theme.textMuted}
                    textAlignVertical="top"
                />
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.md,
        borderBottomWidth: 1,
    },
    titleInput: {
        fontSize: FONT_SIZES.xl,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    contentInput: {
        flex: 1,
        padding: SPACING.md,
        fontSize: FONT_SIZES.md,
        lineHeight: 24,
    }
});
