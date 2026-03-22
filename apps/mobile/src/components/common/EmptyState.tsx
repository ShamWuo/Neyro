import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZES } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={theme.textMuted} />
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  action: {
    marginTop: SPACING.lg,
  },
});
