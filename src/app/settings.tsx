import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { CallLogService } from '@/services/CallLogService';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user, logout, refreshProfile } = useAuth();

  const [autoSync, setAutoSync] = useState(true);
  const [recordMatching, setRecordMatching] = useState(true);
  const [refreshingUser, setRefreshingUser] = useState(false);

  const handleRefreshProfile = async () => {
    try {
      setRefreshingUser(true);
      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update profile.');
    } finally {
      setRefreshingUser(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleClearDatabase = () => {
    Alert.alert('Clear Call History?', 'This will wipe all stored call records from SQLite.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await CallLogService.deleteAllCalls();
          Alert.alert('Success', 'Call database cleared.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings & Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            User account, background sync & preferences.
          </Text>
        </View>

        {/* User Profile Card */}
        {user ? (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
              scheme === 'dark' && { borderWidth: 1 },
            ]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="person" size={28} color={colors.accent} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {user.fullName || user.userName}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {user.email || user.userName}
                </Text>
                {user.roles && user.roles.length > 0 ? (
                  <View style={styles.rolesContainer}>
                    {user.roles.map((role, idx) => (
                      <View
                        key={idx}
                        style={[styles.roleBadge, { backgroundColor: colors.accent + '15' }]}>
                        <Text style={[styles.roleText, { color: colors.accent }]}>{role}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.profileActions}>
              <TouchableOpacity
                style={[styles.profileBtn, { borderColor: colors.border }]}
                onPress={handleRefreshProfile}
                disabled={refreshingUser}>
                <Ionicons name="refresh" size={16} color={colors.text} />
                <Text style={[styles.profileBtnText, { color: colors.text }]}>Sync Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.profileBtn, { borderColor: colors.danger + '40' }]}
                onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={16} color={colors.danger} />
                <Text style={[styles.profileBtnText, { color: colors.danger }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Section 1: Call Sync */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Call Sync & Storage</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Auto Background Sync</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                Sync calls automatically via WorkManager.
              </Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Recording Matching</Text>
              <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                Auto-locate audio files in Samsung folders.
              </Text>
            </View>
            <Switch
              value={recordMatching}
              onValueChange={setRecordMatching}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section 2: Data Management */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Management</Text>

          <TouchableOpacity style={styles.actionRow} onPress={handleClearDatabase}>
            <Ionicons name="trash" size={20} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>Clear Local Database</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoFooter}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            CyrusCRM_ext v1.0.0 (Expo 57 • RN 0.86)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  profileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
  },
  profileBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  infoFooter: {
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
  },
});
