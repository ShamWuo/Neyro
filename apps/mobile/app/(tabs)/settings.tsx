import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { SPACING, FONT_SIZES, COLORS, BORDER_RADIUS } from '../../src/constants';
import { useSettings } from '../../src/hooks/useSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncService } from '../../src/services/SyncService';
import { AutoSortSettings } from '../../src/components/settings/AutoSortSettings';
import { NegativeConstraints } from '../../src/components/settings/NegativeConstraints';
import { EnergyScheduler } from '../../src/components/schedule/EnergyScheduler';

export default function SettingsScreen() {
  const { profile, user, signOut } = useAuth();
  const { theme } = useTheme();
  const { settings, setTheme } = useSettings(); // Destructured settings & setTheme from SettingsContext
  const router = useRouter(); // If needed
  const [lastSync, setLastSync] = React.useState<string>('Never');
  const [isSyncing, setIsSyncing] = React.useState(false);

  React.useEffect(() => {
    loadLastSync();
  }, []);

  const loadLastSync = async () => {
    const ts = await AsyncStorage.getItem('neyro_last_sync_timestamp');
    if (ts) {
      setLastSync(new Date(parseInt(ts)).toLocaleTimeString());
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await SyncService.sync();
    await loadLastSync();
    setIsSyncing(false);
    Alert.alert('Synced', 'Data synchronized with cloud.');
  };

  const handleThemePress = () => {
    Alert.alert(
      'Theme',
      'Choose your preferred theme:',
      [
        { text: 'System', onPress: () => setTheme('system') },
        { text: 'Light', onPress: () => setTheme('light') },
        { text: 'Dark', onPress: () => setTheme('dark') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  const SettingRow = ({ icon, label, value, onPress, destructive }: any) => (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: theme.surfaceLight }]}>
        <Ionicons name={icon} size={20} color={destructive ? COLORS.error : theme.textPrimary} />
      </View>
      <Text style={[styles.label, { color: destructive ? COLORS.error : theme.textPrimary }]}>{label}</Text>
      {value && <Text style={[styles.value, { color: theme.textMuted }]}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />}
    </TouchableOpacity>
  );

  const Section = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
        {children}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>

      {/* Account */}
      <Section title="ACCOUNT">
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: COLORS.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: COLORS.primary }]}>
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: theme.textPrimary }]}>
              {profile?.displayName || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </Section>

      {/* Appearance */}
      <Section title="APPEARANCE">
        <SettingRow
          icon="color-palette"
          label="Theme"
          value="System"
          onPress={handleThemePress}
        />
      </Section>

      {/* Intelligence */}
      <Section title="INTELLIGENCE">
        <AutoSortSettings />
        <View style={{ height: SPACING.md }} />
        <EnergyScheduler />
        <View style={{ height: SPACING.md }} />
        <NegativeConstraints />
      </Section>

      {/* Data */}
      <Section title="DATA">
        <SettingRow
          icon={isSyncing ? "refresh" : "cloud-upload"}
          label={isSyncing ? "Syncing..." : "Sync Now"}
          value={lastSync}
          onPress={handleSync}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow
          icon="download"
          label="Export Data"
          value=""
          onPress={() => Alert.alert('Coming Soon', 'Export functionality will be available soon.')}
        />
      </Section>

      {/* About */}
      <Section title="ABOUT">
        <SettingRow
          icon="information-circle"
          label="Version"
          value="2.0.0"
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingRow
          icon="flash"
          label="App"
          value="Neyro"
        />
      </Section>

      {/* Sign Out */}
      <Section title="">
        <SettingRow
          icon="log-out-outline"
          label="Sign Out"
          value=""
          onPress={handleSignOut}
          destructive
        />
      </Section>

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="flash" size={32} color={theme.textMuted} />
        <Text style={[styles.footerText, { color: theme.textMuted }]}>Neyro</Text>
        <Text style={[styles.footerSubtext, { color: theme.textMuted }]}>Focus better, achieve more</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  label: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  value: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.sm,
  },
  divider: {
    height: 1,
    marginLeft: SPACING.md + 32 + SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: FONT_SIZES.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  footerSubtext: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
});
