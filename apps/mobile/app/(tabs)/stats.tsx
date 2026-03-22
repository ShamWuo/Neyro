import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStats } from '../../src/hooks/useStats';
import { Card, LoadingState } from '../../src/components/common';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants';
import { formatMinutes, getShortDayName } from '../../src/utils/formatters';
import { useTheme } from '../../src/context/ThemeContext';

function StatCard({
  icon,
  iconColor,
  label,
  value,
  subvalue,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value: string;
  subvalue?: string;
}) {
  const { theme } = useTheme();
  return (
    <Card style={[styles.statCard, { backgroundColor: theme.surface }]}>
      <Ionicons name={icon} size={28} color={iconColor || theme.textPrimary} />
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      {subvalue && <Text style={[styles.statSubvalue, { color: theme.textMuted }]}>{subvalue}</Text>}
    </Card>
  );
}

function WeeklyChart({ data }: { data: { date: string; minutes: number }[] }) {
  const { theme } = useTheme();
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <Card style={[styles.chartCard, { backgroundColor: theme.surface }]}>
      <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Last 7 Days</Text>
      <View style={styles.chartContainer}>
        {data.map((day, index) => (
          <View key={day.date} style={styles.chartBar}>
            <View style={[styles.barContainer, { backgroundColor: theme.surfaceLight }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(day.minutes / maxMinutes) * 100}%`,
                    backgroundColor: day.minutes > 0 ? theme.primary : theme.surfaceLight,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: theme.textMuted }]}>{getShortDayName(day.date)}</Text>
            <Text style={[styles.barValue, { color: theme.textSecondary }]}>
              {day.minutes > 0 ? `${day.minutes}m` : '-'}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function StatsScreen() {
  const { stats, isLoading } = useStats();
  const { theme } = useTheme();

  if (isLoading || !stats) {
    return <LoadingState message="Calculating focus stats..." />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      {/* Main Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="flame"
          iconColor={theme.accent}
          label="Current Streak"
          value={`${stats.currentStreak}`}
          subvalue="days"
        />
        <StatCard
          icon="trophy"
          iconColor={theme.accent}
          label="Longest Streak"
          value={`${stats.longestStreak}`}
          subvalue="days"
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="today"
          label="Today"
          value={formatMinutes(stats.totalMinutesToday)}
        />
        <StatCard
          icon="calendar"
          label="This Week"
          value={formatMinutes(stats.totalMinutesThisWeek)}
        />
      </View>

      {/* Weekly Chart */}
      <WeeklyChart data={stats.focusByDay} />

      {/* Total & Most Active */}
      <Card style={[styles.totalCard, { backgroundColor: theme.surface }]}>
        <View style={styles.totalRow}>
          <Ionicons name="time" size={24} color={theme.primary} />
          <View style={styles.totalInfo}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Focus Time</Text>
            <Text style={[styles.totalValue, { color: theme.textPrimary }]}>
              {formatMinutes(stats.totalMinutesAllTime)}
            </Text>
          </View>
        </View>
      </Card>

      {stats.mostActiveProject && (
        <Card style={[styles.mostPracticedCard, { backgroundColor: theme.surface }]}>
          <View style={styles.mostPracticedHeader}>
            <Ionicons name="star" size={20} color={theme.accent} />
            <Text style={[styles.mostPracticedLabel, { color: theme.accent }]}>Most Active Project</Text>
          </View>
          <Text style={[styles.mostPracticedTitle, { color: theme.textPrimary }]}>
            {stats.mostActiveProject.project.title}
          </Text>
          <Text style={[styles.mostPracticedTime, { color: theme.primary }]}>
            {formatMinutes(stats.mostActiveProject.minutes)} total
          </Text>
        </Card>
      )}

      {/* Daily Goal Progress */}
      <Card style={[styles.goalCard, { backgroundColor: theme.surface }]}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalLabel, { color: theme.textPrimary }]}>Daily Goal Progress</Text>
          <Text style={[styles.goalPercent, { color: theme.primary }]}>{stats.dailyGoalProgress}%</Text>
        </View>
        <View style={[styles.progressBarContainer, { backgroundColor: theme.surfaceLight }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(stats.dailyGoalProgress, 100)}%`,
                backgroundColor: theme.primary
              },
            ]}
          />
        </View>
        <Text style={[styles.goalSubtext, { color: theme.textSecondary }]}>
          {stats.totalMinutesToday} / 30 minutes
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  statSubvalue: {
    fontSize: FONT_SIZES.xs,
  },
  chartCard: {
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: 24,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: BORDER_RADIUS.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  barValue: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  totalCard: {
    marginBottom: SPACING.md,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalInfo: {
    marginLeft: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZES.sm,
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  mostPracticedCard: {
    marginBottom: SPACING.md,
  },
  mostPracticedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mostPracticedLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  mostPracticedTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  mostPracticedComposer: { // kept for compile safety even if unused
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
  mostPracticedTime: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  goalCard: {
    marginBottom: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  goalPercent: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  goalSubtext: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
