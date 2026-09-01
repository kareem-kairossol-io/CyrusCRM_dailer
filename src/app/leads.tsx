import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Colors, NotoKufiArabic } from '@/constants/theme';
import { ClientLeadItem, LeadService, LeadStatus } from '@/services/LeadService';

function formatDate(isoStr: string | null): string {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return isoStr;
  }
}

export default function LeadsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<ClientLeadItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial statuses
  useEffect(() => {
    (async () => {
      try {
        const fetchedStatuses = await LeadService.getStatuses();
        setStatuses(fetchedStatuses);
      } catch (e) {
        console.warn('Failed to load lead statuses:', e);
      }
    })();
  }, []);

  // Fetch clients list
  const loadClients = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const res = await LeadService.getClients({
          search: searchQuery,
          status: selectedStatus,
          pageNumber: pageNum,
          pageSize: 20,
        });

        if (pageNum === 1) {
          setItems(res.Items || []);
        } else {
          setItems((prev) => [...prev, ...(res.Items || [])]);
        }

        setPage(res.PageNumber);
        setTotalPages(res.TotalPages);
        setTotalCount(res.TotalCount);
      } catch (e: any) {
        setError(e.message || 'تعذر تحميل بيانات العملاء.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, selectedStatus]
  );

  useEffect(() => {
    loadClients(1);
  }, [loadClients]);

  const onRefresh = () => {
    loadClients(1, true);
  };

  const loadNextPage = () => {
    if (page < totalPages && !loadingMore && !loading) {
      loadClients(page + 1);
    }
  };

  const renderCardItem = (item: ClientLeadItem) => {
    const { Client: client, Lead: lead } = item;

    return (
      <Pressable
        key={client.Id}
        onPress={() => router.push(`/client-detail/${client.Id}` as any)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.backgroundElement, borderColor: colors.border },
          scheme === 'dark' && { borderWidth: 1 },
          pressed && { opacity: 0.9 },
        ]}>
        {/* Top Header - RTL (Name & Tax Card on right, Status Badge on left) */}
        <View style={styles.cardHeader}>
          <View style={styles.clientMeta}>
            <Text style={[styles.clientName, { color: colors.text, fontFamily: NotoKufiArabic.bold }]} numberOfLines={1}>
              {client.Name}
            </Text>
            <Text style={[styles.taxCard, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              تسجيل ضريبي: {client.TaxCard || 'غير مدون'}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: colors.badgeBackground }]}>
            <Text style={[styles.statusBadgeText, { color: colors.accent, fontFamily: NotoKufiArabic.bold }]}>
              {lead.LeadStatusName || 'جديد'}
            </Text>
          </View>
        </View>

        {/* Details Divider & Grid - RTL */}
        <View style={[styles.cardDivider, { borderTopColor: colors.border }]} />

        <View style={styles.detailsGrid}>
          <View style={styles.gridCell}>
            <Text style={[styles.gridCellLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              المنتج:
            </Text>
            <Text style={[styles.gridCellVal, { color: colors.text, fontFamily: NotoKufiArabic.semiBold }]} numberOfLines={1}>
              {lead.ProductName || 'General Service'}
            </Text>
          </View>

          <View style={styles.gridCell}>
            <Text style={[styles.gridCellLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              تاريخ المتابعة:
            </Text>
            <Text style={[styles.gridCellVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]}>
              {formatDate(lead.FollowUpDateTime)}
            </Text>
          </View>

          <View style={styles.gridCell}>
            <Text style={[styles.gridCellLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              المسؤول:
            </Text>
            <Text style={[styles.gridCellVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]} numberOfLines={1}>
              {lead.AssignedUserName || '-'}
            </Text>
          </View>

          <View style={styles.gridCell}>
            <Text style={[styles.gridCellLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              المسؤول التقني:
            </Text>
            <Text style={[styles.gridCellVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]} numberOfLines={1}>
              {lead.TechnicalUserName || '-'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header Bar - RTL */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            العملاء والمتابعات
          </Text>
        </View>

        {/* Search Bar - RTL */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="بحث بالاسم أو التسجيل الضريبي أو الهاتف..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text, fontFamily: NotoKufiArabic.regular }]}
            onSubmitEditing={() => loadClients(1)}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Status Filter Horizontal Chips - RTL (Including "الكل") */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusChipsContent}>
          {/* All Chip */}
          <Pressable
            onPress={() => setSelectedStatus(null)}
            style={[
              styles.chip,
              selectedStatus === null
                ? { backgroundColor: colors.accent }
                : { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 },
            ]}>
            <Text
              style={[
                styles.chipText,
                {
                  color: selectedStatus === null ? '#FFFFFF' : colors.text,
                  fontFamily: selectedStatus === null ? NotoKufiArabic.bold : NotoKufiArabic.medium,
                },
              ]}>
              الكل {selectedStatus === null && totalCount > 0 ? `(${totalCount})` : ''}
            </Text>
          </Pressable>

          {statuses.map((st) => {
            const isSelected = selectedStatus === st.Value;
            return (
              <Pressable
                key={st.Value}
                onPress={() => setSelectedStatus(st.Value)}
                style={[
                  styles.chip,
                  isSelected
                    ? { backgroundColor: colors.accent }
                    : { backgroundColor: colors.backgroundElement, borderColor: colors.border, borderWidth: 1 },
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontFamily: isSelected ? NotoKufiArabic.bold : NotoKufiArabic.medium,
                    },
                  ]}>
                  {st.Name} {isSelected && totalCount > 0 ? `(${totalCount})` : ''}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content List - Cards */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <EmptyState
          message="تعذر تحميل بيانات العملاء."
          actionLabel="إعادة المحاولة"
          onAction={() => loadClients(1)}
        />
      ) : items.length === 0 ? (
        <EmptyState message="لا توجد بيانات عملاء مطابقة للبحث والحالة المحددة." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.Client.Id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={colors.accent} />
            ) : null
          }
          renderItem={({ item }) => renderCardItem(item)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  statusChipsContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  clientMeta: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 2,
  },
  clientName: {
    fontSize: 14,
    textAlign: 'right',
  },
  taxCard: {
    fontSize: 12,
    textAlign: 'right',
  },
  cardDivider: {
    borderTopWidth: 1,
  },
  detailsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCell: {
    width: '46%',
    gap: 2,
    alignItems: 'flex-start',
  },
  gridCellLabel: {
    fontSize: 11,
    textAlign: 'right',
  },
  gridCellVal: {
    fontSize: 13,
    textAlign: 'right',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  statusBadgeText: {
    fontSize: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
