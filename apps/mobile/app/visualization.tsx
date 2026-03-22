import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import { useNeyroStore } from '../src/store/useNeyroStore';
import { PARAHeatmap } from '../src/components/visualization/PARAHeatmap';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants';

export default function VisualizationScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { activeProjects, pausedProjects, areas } = useNeyroStore();

    const allProjects = [...activeProjects, ...pausedProjects];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: "", // Clean header
                headerTransparent: true,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16, marginTop: 8 }}>
                        <View style={{ backgroundColor: theme.surfaceLight, padding: 8, borderRadius: 20 }}>
                            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                        </View>
                    </TouchableOpacity>
                )
            }} />

            <View style={styles.content}>
                <PARAHeatmap projects={allProjects} areas={areas} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingTop: 80, // Space for transparent header
    }
});
