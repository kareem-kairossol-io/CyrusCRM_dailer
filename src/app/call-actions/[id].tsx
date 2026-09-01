import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { UploadStatusBadge } from '@/components/upload-status-badge';
import { Colors, NotoKufiArabic } from '@/constants/theme';
import { CallLogService, CallRecord } from '@/services/CallLogService';

function formatDate(epochMillis: number): string {
  if (!epochMillis) return '';
  return new Date(epochMillis).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CallActionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [call, setCall] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    if (id) {
      const record = await CallLogService.getCallById(Number(id));
      setCall(record);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!call) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <EmptyState message="لم يتم العثور على المكالمة." />
      </SafeAreaView>
    );
  }

  const isOutgoing = call.direction === 'OUTGOING';
  const directionLabel = isOutgoing ? 'مكالمة صادرة' : 'مكالمة واردة';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: colors.text, fontFamily: NotoKufiArabic.bold }]} numberOfLines={1}>
          تفاصيل المكالمة
        </Text>
      </View>

      <View style={styles.container}>
        {/* Contact Icon Badge */}
        <View style={[styles.avatar, { backgroundColor: colors.badgeBackground }]}>
          <Ionicons name="call" size={28} color={colors.accent} />
        </View>

        {/* Contact Name & Phone Number */}
        <Text style={[styles.name, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
          {call.contactName && call.contactName !== 'Unknown' ? call.contactName : call.phoneNumber}
        </Text>

        <Text style={[styles.phoneNumber, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
          {call.phoneNumber}
        </Text>

        {/* Linked Ref Badge if present */}
        {Boolean(call.ref) && (
          <View style={[styles.refBadge, { backgroundColor: colors.badgeBackground }]}>
            <Text style={[styles.refBadgeText, { color: colors.accent, fontFamily: NotoKufiArabic.bold }]}>
              معرف الليد المرتبط: #{call.ref}
            </Text>
          </View>
        )}

        {/* Details Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              النوع:
            </Text>
            <Text style={[styles.detailVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]}>
              {directionLabel}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              المدة:
            </Text>
            <Text style={[styles.detailVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]}>
              {formatDuration(call.duration)} ({call.duration} ثانية)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              حالة المكالمة:
            </Text>
            <StatusBadge status={call.status} />
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              حالة المزامنة:
            </Text>
            <UploadStatusBadge status={call.uploadStatus} />
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              تاريخ ووقت المكالمة:
            </Text>
            <Text style={[styles.detailVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]}>
              {formatDate(call.date)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 20,
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  name: {
    fontSize: 20,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 14,
    textAlign: 'center',
  },
  refBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  refBadgeText: {
    fontSize: 12,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailVal: {
    fontSize: 14,
  },
});
