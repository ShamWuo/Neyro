import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useNeyroStore } from '../../src/store/useNeyroStore';
import { useUIStore } from '../../src/store/useUIStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants';

// New Components
import { ActionRow } from '../../src/components/home/ActionRow';
import { StatusCardCarousel } from '../../src/components/home/StatusCardCarousel';
import { RecentActivityList } from '../../src/components/home/RecentActivityList';
import { QuickCaptureModal } from '../../src/components/QuickCaptureModal'; // Re-use if needed or handled by tab

export default function InboxScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { loadData, isLoading } = useNeyroStore();

  // Note: QuickCapture is also handled by the Tab Bar "+" button, 
  // but we can trigger it programmatically via global store or local state if we want explicit buttons.
  // For now, let's map the buttons to actions.

  const handleQuickCapture = () => {
    useNeyroStore.getState().setCaptureVisible(true);
  };

  const handleFocusMode = () => {
    router.push('/focus' as any);
  };

  const handleNewProject = () => {
    // Navigate to projects or open command palette with "New Project"
    router.push('/(tabs)/inbox/projects' as any);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={theme.textPrimary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionSpacer}>
          <ActionRow
            onQuickCapture={handleQuickCapture}
            onFocus={handleFocusMode}
            onNewProject={handleNewProject}
          />
        </View>

        <StatusCardCarousel />

        <View style={styles.listSpacer} />

        <RecentActivityList />
      </ScrollView>

      {/* Floating Action Button for Quick Capture */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleQuickCapture}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Critical for Tab Bar visibility
  },
  sectionSpacer: {
    marginTop: 20
  },
  listSpacer: {
    height: 20
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary, // Using constant instead of theme for brand pop
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 100,
  }
});

