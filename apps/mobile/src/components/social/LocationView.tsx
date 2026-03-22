import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

interface LocationViewProps {
    lat: number;
    lng: number;
    timestamp: number;
    userName: string;
}

export const LocationView = ({ lat, lng, timestamp, userName }: LocationViewProps) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.surfaceLight }]}>
            {/* Mock Map Background */}
            <View style={[styles.mapPlaceholder, { backgroundColor: theme.surface }]}>
                <View style={styles.gridLines}>
                    {[...Array(5)].map((_, i) => (
                        <View key={`v-${i}`} style={[styles.vLine, { backgroundColor: theme.border }]} />
                    ))}
                    {[...Array(5)].map((_, i) => (
                        <View key={`h-${i}`} style={[styles.hLine, { backgroundColor: theme.border }]} />
                    ))}
                </View>

                {/* Pin */}
                <View style={styles.pinContainer}>
                    <Ionicons name="location" size={32} color={COLORS.error} />
                    <View style={[styles.tooltip, { backgroundColor: theme.surface }]}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: theme.textPrimary }}>
                            {userName}
                        </Text>
                        <Text style={{ fontSize: 8, color: theme.textSecondary }}>
                            {new Date(timestamp).toLocaleTimeString()}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginVertical: SPACING.md,
    },
    mapPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridLines: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    vLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        left: `${Math.random() * 100}%`
    },
    hLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        top: `${Math.random() * 100}%`
    },
    pinContainer: {
        alignItems: 'center',
    },
    tooltip: {
        padding: 4,
        borderRadius: 4,
        marginTop: 4,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    }
});
