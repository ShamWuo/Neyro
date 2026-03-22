import React from 'react';
import { View, Alert, StyleSheet, Platform } from 'react-native';
import { SettingsSection } from '../SettingsSection';
import { SettingRow } from '../SettingRow';
import { SPACING, COLORS } from '../../../constants';
import { useSettings } from '../../../hooks/useSettings';
import { useTheme } from '../../../context/ThemeContext';
import { validateDailyGoal } from '../../../utils/validation';

// Helper for cross-platform prompt
const promptValue = (
    title: string,
    message: string,
    initialValue: string,
    callback: (value: string) => void,
    keyboardType: 'default' | 'plain-text' | 'numeric' = 'default'
) => {
    if (Platform.OS === 'ios') {
        Alert.prompt(
            title,
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: (val?: string) => callback(val || ''),
                },
            ],
            keyboardType === 'numeric' ? 'plain-text' : 'plain-text',
            initialValue,
            keyboardType === 'numeric' ? 'number-pad' : 'default'
        );
    } else {
        Alert.alert(
            'Not Supported on Android',
            'Editing this value is currently only supported on iOS in this version. Please update your profile on the web.',
            [{ text: 'OK' }]
        );
    }
};

export function FocusSection() {
    const { settings, setDailyGoal, setCalendarSync } = useSettings();
    const { theme } = useTheme();

    const handleDailyGoalPress = () => {
        promptValue(
            'Daily Focus Goal',
            'Enter your daily focus goal in minutes (1-480):',
            String(settings.dailyGoalMinutes),
            async (value) => {
                const minutes = parseInt(value || '0', 10);
                const validation = validateDailyGoal(minutes);

                if (!validation.isValid) {
                    Alert.alert('Invalid Goal', validation.error);
                    return;
                }

                await setDailyGoal(minutes);
            },
            'numeric'
        );
    };

    const handleCalendarSyncPress = () => {
        Alert.alert(
            'Calendar Sync',
            'Automatically save scheduled focus sessions to your device calendar?',
            [
                { text: 'Turn Off', onPress: () => setCalendarSync(false) },
                { text: 'Turn On', onPress: () => setCalendarSync(true) },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <SettingsSection title="Focus">
            <SettingRow
                icon="flag"
                label="Daily Goal"
                value={`${settings.dailyGoalMinutes} min`}
                onPress={handleDailyGoalPress}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingRow
                icon="calendar"
                label="Sync to Calendar"
                value={settings.calendarSync ? 'On' : 'Off'}
                onPress={handleCalendarSyncPress}
            />
        </SettingsSection>
    );
}

const styles = StyleSheet.create({
    divider: {
        height: 1,
        marginLeft: SPACING.md + 32 + SPACING.md,
    },
});
