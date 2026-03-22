import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.message}>{message}</Text>
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
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
