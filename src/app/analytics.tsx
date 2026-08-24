import React, { useCallback, useEffect, useState } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';

import { StatCard } from '@/components/stat-card';
import { Colors } from '@/constants/theme';
import { CallLogService, CallRecord } from '@/services/CallLogService';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function AnalyticsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await CallLogService.getCalls();
      setCalls(data);
    } catch (e) {
      console.warn('Could not load analytics data');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const totalCalls = calls.length;
  const answeredCalls = calls.filter((c) => c.status === 'ANSWERED');
  const missedCalls = calls.filter((c) => c.status === 'NO_ANSWER');
  const incomingCalls = calls.filter((c) => c.direction === 'INCOMING');
  const outgoingCalls = calls.filter((c) => c.direction === 'OUTGOING');

  const answerRate = totalCalls > 0 ? Math.round((answeredCalls.length / totalCalls) * 100) : 0;
  const totalDuration = answeredCalls.reduce((acc, c) => acc + c.duration, 0);

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Call performance and metrics overview.
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            {/* Stat Row 1 */}
            <View style={styles.statRow}>
              <StatCard
                icon={<Ionicons name="call" size={18} color={colors.accent} />}
                value={totalCalls}
                label="Total Calls"
              />
              <StatCard
                icon={<Ionicons name="checkmark-circle" size={18} color={colors.success} />}
                value={`${answerRate}%`}
                label="Answer Rate"
              />
            </View>

            {/* Stat Row 2 */}
            <View style={styles.statRow}>
              <StatCard
                icon={<Ionicons name="time" size={18} color={colors.accent} />}
                value={formatDuration(totalDuration)}
                label="Total Talk Time"
              />
              <StatCard
                icon={<Ionicons name="close-circle" size={18} color={colors.danger} />}
                value={missedCalls.length}
                label="Missed Calls"
              />
            </View>

            {/* Breakdown Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                scheme === 'dark' && { borderWidth: 1 },
              ]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Call Breakdown</Text>
              
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownItem}>
                  <Ionicons name="arrow-down" size={20} color={colors.success} />
                  <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                    Incoming ({incomingCalls.length})
                  </Text>
                </View>
                <View style={styles.breakdownItem}>
                  <Ionicons name="arrow-up" size={20} color={colors.accent} />
                  <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                    Outgoing ({outgoingCalls.length})
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
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
  center: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
