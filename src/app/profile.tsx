import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
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

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user, logout, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshProfile();
      Alert.alert('نجاح', 'تم تحديث بيانات الملف الشخصي بنجاح.');
    } catch (e: any) {
      Alert.alert('خطأ', e?.message || 'فشل في تحديث بيانات الملف الشخصي.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت تأكد أنك تريد تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleClearDatabase = () => {
    Alert.alert('حذف سجل المكالمات؟', 'سيؤدي هذا إلى حذف جميع سجلات المكالمات المحلية من SQLite.', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف الكل',
        style: 'destructive',
        onPress: async () => {
          await CallLogService.deleteAllCalls();
          Alert.alert('تم', 'تم مسح قاعدة البيانات المحلية.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            User account info & session details
          </Text>
        </View>

        {/* User Card */}
        {user ? (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
              scheme === 'dark' && { borderWidth: 1 },
            ]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="person" size={32} color={colors.accent} />
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

            {/* Profile Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: colors.border }]}
                onPress={handleRefresh}
                disabled={refreshing}>
                <Ionicons name="sync-outline" size={18} color={colors.text} />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>
                  {refreshing ? 'Syncing...' : 'Sync Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            ]}>
            <Text style={{ color: colors.textSecondary }}>No user logged in.</Text>
          </View>
        )}

        {/* Account & Details */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Username</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{user?.userName || '-'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{user?.email || '-'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>User ID</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{user?.id || '-'}</Text>
          </View>
        </View>

        {/* Storage Management */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Database & Storage</Text>

          <TouchableOpacity style={styles.dangerRow} onPress={handleClearDatabase}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.dangerText, { color: colors.danger }]}>Clear Call Database</Text>
          </TouchableOpacity>
        </View>

        {/* Log Out Section */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '40' }]}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[styles.logoutBtnText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            CyrusCRM Dialer v1.0.0
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
    paddingBottom: 32,
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
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 3,
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    marginHorizontal: 16,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
