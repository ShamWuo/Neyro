import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants';

interface LocationViewProps {
    data: string | null; // JSON string { lat, lng }
}

export const LocationView = ({ data }: LocationViewProps) => {
    if (!data) return null;

    let loc = { lat: 0, lng: 0, timestamp: 0 };
    try {
        loc = JSON.parse(data);
    } catch {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Last Known Location</Text>
            <View style={styles.mapPlaceholder}>
                <Text style={styles.coords}>
                    Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}
                </Text>
                <Text style={styles.time}>
                    Updates {new Date(loc.timestamp).toLocaleTimeString()}
                </Text>
                {/* Real map would go here using react-native-maps */}
                <Text style={styles.note}>Map View Placeholder</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.md,
        backgroundColor: COLORS.surfaceLight,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    label: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        textTransform: 'uppercase',
    },
    mapPlaceholder: {
        height: 100,
        backgroundColor: '#e1e1e1',
        borderRadius: BORDER_RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    coords: {
        fontWeight: 'bold',
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#666',
    },
    note: {
        marginTop: SPACING.xs,
        fontSize: 10,
        fontStyle: 'italic',
        color: '#888'
    }
});
