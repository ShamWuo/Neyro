import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

export const AppHeader = (props: BottomTabHeaderProps) => {
    const { theme } = useTheme();
    const { profile, user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const displayName = profile?.displayName || user?.email?.split('@')[0] || 'User';
    const { options } = props;
    const title = options.title !== undefined ? options.title : options.tabBarLabel !== undefined ? options.tabBarLabel : props.route.name;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: theme.background,
                paddingTop: insets.top + SPACING.sm,
                borderBottomColor: theme.border,
                borderBottomWidth: 1, // Optional: adds subtle separation
            }
        ]}>
            <View style={styles.left}>
                <TouchableOpacity onPress={() => router.push('/settings' as any)}>
                    {profile?.avatarUrl ? (
                        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.surfaceLight }]}>
                            <Text style={[styles.avatarText, { color: theme.textSecondary }]}>
                                {(displayName.charAt(0) || '?').toUpperCase()}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.center}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                    {typeof title === 'string' ? title : props.route.name}
                </Text>
            </View>

            <View style={styles.right}>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surfaceLight }]}>
                    <Ionicons name="notifications-outline" size={20} color={theme.textPrimary} />
                    <View style={styles.badge} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    left: {
        flex: 1,
        alignItems: 'flex-start',
    },
    center: {
        flex: 2,
        alignItems: 'center',
    },
    right: {
        flex: 1,
        alignItems: 'flex-end',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
    },
    title: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
        borderWidth: 1,
        borderColor: '#fff'
    }
});
