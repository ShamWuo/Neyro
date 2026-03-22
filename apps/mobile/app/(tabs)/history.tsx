import React from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSessionsWithProjects, useSessions, FocusSessionWithProject } from '../../src/hooks/useSessions';
import { EmptyState, LoadingState } from '../../src/components/common';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants';
import { formatTime } from '../../src/utils/formatters';
import { useTheme } from '../../src/context/ThemeContext';

function groupSessionsByDateLocal(sessions: FocusSessionWithProject[]) {
  const groups: Record<string, FocusSessionWithProject[]> = {};
  sessions.forEach((session) => {
    const dateKey = session.date; // YYYY-MM-DD
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(session);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({
      title: date,
      data: list
    }));
}

function SessionItem({ session, onPress, onDelete }: {
  session: FocusSessionWithProject;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { theme } = useTheme();

  const handleLongPress = () => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this focus session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.sessionItem, { backgroundColor: theme.surface }]}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.sessionTime}>
        <Text style={[styles.timeText, { color: theme.textMuted }]}>{formatTime(session.completedAt)}</Text>
      </View>
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionPiece, { color: theme.textPrimary }]}>
          {session.project?.title || session.focusArea || 'Unassigned Focus'}
        </Text>
        {session.project?.status && (
          <Text style={[styles.sessionComposer, { color: theme.textSecondary }]}>{session.project.status}</Text>
        )}
        {session.notes && (
          <Text style={[styles.sessionNotes, { color: theme.textMuted }]} numberOfLines={1}>
            {session.notes}
          </Text>
        )}
      </View>
      <View style={styles.sessionDuration}>
        <Text style={[styles.durationText, { color: theme.primary }]}>{session.durationMinutes}m</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { sessions, isLoading, refetch } = useSessionsWithProjects();
  const { deleteSession } = useSessions();
  const { theme } = useTheme();

  const sectionData = groupSessionsByDateLocal(sessions);

  const handleSessionPress = (id: string) => {
    Alert.alert("Session Details", "Detailed view coming soon.");
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete session');
    }
  };

  const handleAddSession = () => {
    Alert.alert("Log Session", "Please use the Schedule tab to log completed sessions for now.");
  };

  if (isLoading) {
    return <LoadingState message="Loading history..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {sessions.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No Focus History"
          message="Start working to see your logs here!"
          action={
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={handleAddSession}>
              <Ionicons name="add" size={20} color={theme.surface} />
              <Text style={[styles.addButtonText, { color: theme.surface }]}>Log Session</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <>
          <SectionList
            sections={sectionData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SessionItem
                session={item}
                onPress={() => handleSessionPress(item.id)}
                onDelete={() => handleDeleteSession(item.id)}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
              </View>
            )}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
            stickySectionHeadersEnabled={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: SPACING.md,
  },
  sectionHeader: {
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSeparator: {
    height: SPACING.md,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  sessionTime: {
    width: 60,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
  },
  sessionInfo: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  sessionPiece: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  sessionComposer: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
    textTransform: 'capitalize'
  },
  sessionNotes: {
    fontSize: FONT_SIZES.xs,
    fontStyle: 'italic',
    marginTop: 4,
  },
  sessionDuration: {
    marginRight: SPACING.sm,
  },
  durationText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  separator: {
    height: SPACING.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
