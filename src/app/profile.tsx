import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
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

import { Colors, NotoKufiArabic } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header - RTL */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            الحساب الشخصي
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
            تفاصيل حساب المستخدم وجلسة العمل
          </Text>
        </View>

        {/* User Card - RTL */}
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
                <Text style={[styles.profileName, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
                  {user.fullName || user.userName}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                  {user.email || user.userName}
                </Text>
                {user.roles && user.roles.length > 0 ? (
                  <View style={styles.rolesContainer}>
                    {user.roles.map((role, idx) => (
                      <View
                        key={idx}
                        style={[styles.roleBadge, { backgroundColor: colors.accent + '15' }]}>
                        <Text style={[styles.roleText, { color: colors.accent, fontFamily: NotoKufiArabic.bold }]}>
                          {role}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            {/* Profile Sync Button */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: colors.border }]}
                onPress={handleRefresh}
                disabled={refreshing}>
                <Ionicons name="sync-outline" size={18} color={colors.text} />
                <Text style={[styles.actionBtnText, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
                  {refreshing ? 'جاري المزامنة...' : 'تحديث البيانات'}
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
            <Text style={{ color: colors.textSecondary, fontFamily: NotoKufiArabic.regular, textAlign: 'right' }}>
              لم يتم تسجيل الدخول.
            </Text>
          </View>
        )}

        {/* Account Details - RTL */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            بيانات الحساب
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              اسم المستخدم:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text, fontFamily: NotoKufiArabic.semiBold }]}>
              {user?.userName || '-'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              البريد الإلكتروني:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text, fontFamily: NotoKufiArabic.semiBold }]}>
              {user?.email || '-'}
            </Text>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '40' }]}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[styles.logoutBtnText, { color: colors.danger, fontFamily: NotoKufiArabic.bold }]}>
            تسجيل الخروج
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
            سيروس CRM - الإصدار 1.0.0
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
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'right',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row-reverse',
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
    alignItems: 'flex-start',
  },
  profileName: {
    fontSize: 18,
    textAlign: 'right',
  },
  profileEmail: {
    fontSize: 13,
    textAlign: 'right',
  },
  rolesContainer: {
    flexDirection: 'row-reverse',
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
  },
  actionButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
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
    textAlign: 'right',
  },
  detailValue: {
    fontSize: 14,
    textAlign: 'right',
  },
  logoutBtn: {
    marginHorizontal: 16,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
