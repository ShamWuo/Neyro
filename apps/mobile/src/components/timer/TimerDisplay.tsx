import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../../constants';
import { formatTimer } from '../../utils/formatters';

interface TimerDisplayProps {
  seconds: number;
  isRunning: boolean;
}

export function TimerDisplay({ seconds, isRunning }: TimerDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.time, isRunning && styles.timeRunning]}>
        {formatTimer(seconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  time: {
    fontSize: FONT_SIZES.timer,
    fontWeight: '200',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  timeRunning: {
    color: COLORS.primary,
  },
});
