import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CallRow } from '@/components/call-row';
import { EmptyState } from '@/components/empty-state';
import { SecondaryButton } from '@/components/secondary-button';
import { StatCard } from '@/components/stat-card';
import { Colors, NotoKufiArabic } from '@/constants/theme';
import { CallLogService, CallRecord } from '@/services/CallLogService';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCalls = useCallback(async () => {
    try {
      setError(null);
      const data = await CallLogService.getCalls();
      setCalls(data);
    } catch (e) {
      setError('تعذر تحميل لوحة تحكم المكالمات.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadCalls();
      setLoading(false);
    })();
  }, [loadCalls]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCalls();
    setRefreshing(false);
  }, [loadCalls]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            الرئيسية
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
            ملخص وإحصائيات سجل المكالمات والمتابعات.
          </Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            الرئيسية
          </Text>
        </View>
        <EmptyState
          message="تعذر تحميل لوحة تحكم المكالمات."
          actionLabel="إعادة المحاولة"
          onAction={loadCalls}
        />
      </SafeAreaView>
    );
  }

  // Client-side stat calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const callsTodayCount = calls.filter((c) => c.date >= startOfToday).length;
  const missedCount = calls.filter((c) => c.status === 'NO_ANSWER').length;

  const answeredCalls = calls.filter((c) => c.status === 'ANSWERED' && c.duration > 0);
  const avgDurationSec =
    answeredCalls.length > 0
      ? Math.round(answeredCalls.reduce((sum, c) => sum + c.duration, 0) / answeredCalls.length)
      : 0;

  const recentCalls = calls.slice(0, 5);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }>
        {/* 1. Header - RTL */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            الرئيسية
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
            ملخص وإحصائيات سجل المكالمات والمتابعات.
          </Text>
        </View>

        {/* 2. Stat Row - RTL */}
        <View style={styles.statRow}>
          <StatCard
            icon={
              <SymbolView
                name={{ ios: 'phone.fill', android: 'call', web: 'phone' } as any}
                size={18}
                tintColor={colors.accent}
              />
            }
            value={callsTodayCount}
            label="مكالمات اليوم"
          />
          <StatCard
            icon={
              <SymbolView
                name={{ ios: 'phone.down.fill', android: 'call_missed', web: 'phone' } as any}
                size={18}
                tintColor={colors.accent}
              />
            }
            value={missedCount}
            label="لم يتم الرد"
          />
          <StatCard
            icon={
              <SymbolView
                name={{ ios: 'clock.fill', android: 'schedule', web: 'clock' } as any}
                size={18}
                tintColor={colors.accent}
              />
            }
            value={formatDuration(avgDurationSec)}
            label="متوسط المدة"
          />
        </View>

        {/* 3. Recent Calls Section - RTL */}
        <View style={styles.recentSection}>
          <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            أحدث المكالمات
          </Text>

          {recentCalls.length === 0 ? (
            <EmptyState message="لا توجد مكالمات حديثة." />
          ) : (
            <View style={styles.callsList}>
              {recentCalls.map((item) => (
                <CallRow
                  key={item.id}
                  call={item}
                  onPress={() => router.push(`/call-actions/${item.id}` as any)}
                />
              ))}
            </View>
          )}

          <SecondaryButton
            title="عرض كافة المكالمات"
            onPress={() => router.push('/calls' as any)}
            style={styles.seeAllBtn}
          />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    gap: 12,
  },
  recentSection: {
    gap: 12,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 18,
    paddingHorizontal: 16,
  },
  callsList: {
    borderTopWidth: 0,
  },
  seeAllBtn: {
    marginHorizontal: 16,
    marginTop: 4,
  },
});
