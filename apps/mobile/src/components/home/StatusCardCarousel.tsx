import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNeyroStore } from '../../store/useNeyroStore';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export const StatusCardCarousel = () => {
    const { theme } = useTheme();
    const { inbox, activeProjects } = useNeyroStore();

    const inboxCount = inbox.filter(i => !i.isProcessed).length;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + SPACING.md}
        >
            {/* 1. Inbox / Status Card (Like Wise Currency Card) */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        {/* Circle Flag Icon equivalent */}
                        <View style={[styles.flagIcon, { backgroundColor: COLORS.accent }]}>
                            <Ionicons name="file-tray" size={24} color="#fff" />
                        </View>
                        <Text style={[styles.currencyText, { color: theme.textPrimary }]}>Inbox</Text>
                    </View>
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={[styles.balanceSymbol, { color: theme.textMuted }]}>Items </Text>
                    <Text style={[styles.balance, { color: theme.textPrimary }]}>{inboxCount}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                        {inboxCount > 0 ? "You have unprocessed items." : "All clear for now."}
                    </Text>
                </View>
            </View>

            {/* 2. Active Project Cards */}
            {activeProjects.slice(0, 3).map(project => (
                <TouchableOpacity key={project.id} style={[styles.card, { backgroundColor: theme.surface }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.flagIcon, { backgroundColor: COLORS.primary }]}>
                                <Ionicons name="briefcase" size={24} color="#fff" />
                            </View>
                            <Text style={[styles.currencyText, { color: theme.textPrimary }]} numberOfLines={1}>{project.title}</Text>
                        </View>
                    </View>

                    <View style={styles.balanceContainer}>
                        <Text style={[styles.balance, { color: theme.textPrimary }]}>0%</Text>
                        <Text style={[styles.balanceSymbol, { color: theme.textMuted }]}> Done</Text>
                    </View>
                    <View style={styles.cardFooter}>
                        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                            Next: Check Project Tasks
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingLeft: SPACING.lg,
        paddingRight: SPACING.md,
        paddingVertical: SPACING.md,
        gap: SPACING.md,
    },
    card: {
        width: CARD_WIDTH,
        height: 180,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    flagIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencyText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    balanceContainer: {
        marginTop: SPACING.lg,
    },
    balanceSymbol: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
    },
    balance: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 4,
    },
    cardFooter: {
        marginTop: SPACING.md,
    }
});
