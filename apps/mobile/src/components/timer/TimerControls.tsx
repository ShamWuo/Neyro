import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

import { TimerStatus } from '../../types';

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void; // Initial start
  onPause: () => void; // Stop running -> active pause
  onResume: () => void; // Paused -> running
  onSave: () => void; // Paused -> Save & Reset
}

export function TimerControls({ status, onStart, onPause, onResume, onSave }: TimerControlsProps) {
  if (status === 'running') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.pauseButton]}
          onPress={onPause}
          activeOpacity={0.8}
        >
          <Ionicons name="pause" size={32} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'paused') {
    return (
      <View style={styles.containerRow}>
        <TouchableOpacity
          style={[styles.miniButton, styles.resumeButton]}
          onPress={onResume}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={24} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.miniButton, styles.saveButton]}
          onPress={onSave}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={24} color={COLORS.textPrimary} />
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Idle (or stopped)
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.startButton]}
        onPress={onStart}
        activeOpacity={0.8}
      >
        <Ionicons name="play" size={32} color={COLORS.textPrimary} />
        <Text style={styles.buttonText}>Start Focus</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginVertical: SPACING.xl,
  },
  button: {
    width: 160,
    height: 160,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  miniButton: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  pauseButton: {
    backgroundColor: COLORS.accent,
  },
  resumeButton: {
    backgroundColor: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.success,
  },
  stopButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
});
