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
import { CallLogService } from '@/services/CallLogService';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [autoSync, setAutoSync] = useState(true);
  const [recordMatching, setRecordMatching] = useState(true);

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
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Background sync & preferences.
          </Text>
        </View>

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
