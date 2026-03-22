import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

export async function getCalendarPermissions() {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        // Find a default calendar to use
        const defaultCalendar =
            calendars.find(c => c.isPrimary) ||
            calendars.find(c => c.source.name === 'iCloud') || // iOS often
            calendars[0];

        return defaultCalendar?.id;
    } else {
        Alert.alert('Permission required', 'Calendar permission is required to save sessions.');
        return null;
    }
}

export async function addSessionToCalendar(
    title: string,
    notes: string,
    startTime: Date,
    durationMinutes: number
) {
    try {
        const calendarId = await getCalendarPermissions();

        if (!calendarId) {
            console.log("No calendar ID found");
            return;
        }

        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        await Calendar.createEventAsync(calendarId, {
            title: `Focus: ${title}`,
            startDate: startTime,
            endDate: endTime,
            notes: notes,
            timeZone: 'GMT', // Or local
        });

        Alert.alert('Success', 'Session added to calendar!');
    } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to add to calendar');
    }
}
