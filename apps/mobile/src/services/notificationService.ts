import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export const NotificationService = {
    /**
     * Request permissions for notifications
     */
    requestPermissions: async (): Promise<boolean> => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return false;
        }

        // special android config if needed
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('practice-reminders', {
                name: 'Practice Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return true;
    },

    /**
     * Schedule a notification for a specific date
     */
    schedulePracticeReminder: async (
        date: Date,
        title: string = 'Practice Time! 🎵',
        body: string = 'Time to work on your pieces.'
    ): Promise<string | null> => {
        const hasPermission = await NotificationService.requestPermissions();
        if (!hasPermission) return null;

        const triggerDate = new Date(date);
        // Be sure the date is in the future
        if (triggerDate.getTime() <= Date.now()) {
            return null;
        }

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger: {
                    date: triggerDate,
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                },
            });
            return id;
        } catch (error) {
            console.warn("Failed to schedule notification:", error);
            return null;
        }
    },

    /**
     * Cancel a specific notification
     */
    cancelReminder: async (id: string): Promise<void> => {
        await Notifications.cancelScheduledNotificationAsync(id);
    },

    /**
     * Cancel all notifications
     */
    cancelAll: async (): Promise<void> => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
