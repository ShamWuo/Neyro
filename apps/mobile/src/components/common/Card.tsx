import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SPACING, BORDER_RADIUS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({ children, style, padding = 'medium' }: CardProps) {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.card,
      { backgroundColor: theme.surface, borderColor: theme.border },
      styles[padding],
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  none: {
    padding: 0,
  },
  small: {
    padding: SPACING.sm,
  },
  medium: {
    padding: SPACING.md,
  },
  large: {
    padding: SPACING.lg,
  },
});
