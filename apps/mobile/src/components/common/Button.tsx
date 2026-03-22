import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: theme.primary };
      case 'secondary':
        return { backgroundColor: theme.surfaceLight, borderWidth: 1, borderColor: theme.border };
      case 'danger':
        return { backgroundColor: theme.error };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return {};
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'ghost':
        return { color: theme.primary };
      default:
        return { color: theme.textPrimary }; // Or white for primary/danger? usually checks contrast. 
      // Assuming primary/danger are dark enough for white text or light enough for black?
      // In current theme, primary is Orange, Text is Light.
      // Let's stick to textPrimary for now or maybe forced white for filled buttons?
      // The original static colors used textPrimary even for primary buttons? 
      // Wait, original said: primaryText: { color: COLORS.textPrimary } which is white in dark mode.
      // So for dark theme, white text on orange button is fine.
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        getVariantStyle(),
        styles[size],
        isDisabled && { opacity: 0.5 },
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? theme.primary : theme.textPrimary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextStyle(),
            styles[`${size}Text`],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },

  // Sizes
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minWidth: 80,
  },
  medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minWidth: 120,
  },
  large: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minWidth: 160,
  },

  // Text base
  text: {
    fontWeight: '600',
  },

  // Text sizes
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.md,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
});
