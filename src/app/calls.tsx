import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CallRow } from '@/components/call-row';
import { EmptyState } from '@/components/empty-state';
import { Colors, NotoKufiArabic } from '@/constants/theme';
import { CallLogService, CallRecord } from '@/services/CallLogService';

export default function CallsScreen() {
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
      setError('تعذر تحميل سجل المكالمات.');
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>المكالمات</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>المكالمات</Text>
        </View>
        <EmptyState
          message="تعذر تحميل سجل المكالمات."
          actionLabel="إعادة المحاولة"
          onAction={loadCalls}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={calls}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={calls.length === 0 ? styles.emptyContainer : styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>المكالمات</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={<EmptyState message="لا توجد مكالمات مسجلة حتى الآن." />}
        renderItem={({ item }) => (
          <CallRow
            call={item}
            onPress={() => router.push(`/call-actions/${item.id}` as any)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    textAlign: 'right',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
});
