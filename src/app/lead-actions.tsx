import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { EmptyState } from '@/components/empty-state';
import { Colors } from '@/constants/theme';
import { LeadAction, LeadActionService } from '@/services/LeadActionService';

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

export default function LeadActionsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [actions, setActions] = useState<LeadAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActions = useCallback(async () => {
    try {
      setError(null);
      const data = await LeadActionService.getAllActions();
      setActions(data);
    } catch (e) {
      setError('Could not load lead actions.');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadActions();
      setLoading(false);
    })();
  }, [loadActions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActions();
    setRefreshing(false);
  }, [loadActions]);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Action?', 'This record will be removed from SQLite.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await LeadActionService.deleteAction(id);
          await loadActions();
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All Actions?', 'This will wipe all lead actions from SQLite.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await LeadActionService.deleteAllActions();
          await loadActions();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Lead Actions</Text>
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
          <Text style={[styles.title, { color: colors.text }]}>Lead Actions</Text>
        </View>
        <EmptyState
          message="Could not load lead actions."
          actionLabel="Retry"
          onAction={loadActions}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={actions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={actions.length === 0 ? styles.emptyContainer : styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]}>Lead Actions</Text>
              {actions.length > 0 && (
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={[styles.clearText, { color: colors.danger }]}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {actions.length} action logs stored in SQLite database.
            </Text>
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
        ListEmptyComponent={
          <EmptyState
            message="No lead actions recorded yet. Go to the Leads tab and tap 'Log Action'!"
          />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
              scheme === 'dark' && { borderWidth: 1 },
            ]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.badgeBackground }]}>
                <Ionicons name="flash" size={18} color={colors.accent} />
              </View>

              <View style={styles.cardMeta}>
                <Text style={[styles.number, { color: colors.text }]}>
                  {item.number || 'Unknown Number'}
                </Text>
                <Text style={[styles.subMeta, { color: colors.textSecondary }]}>
                  Lead ID: #{item.leadId} • Action #{item.id}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDate(item.date)}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flex: 1,
    gap: 2,
  },
  number: {
    fontSize: 16,
    fontWeight: '600',
  },
  subMeta: {
    fontSize: 12,
    fontWeight: '400',
  },
  deleteBtn: {
    padding: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '400',
  },
});
