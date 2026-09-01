import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Colors, NotoKufiArabic } from '@/constants/theme';
import { CallLogService } from '@/services/CallLogService';
import { LeadActionService } from '@/services/LeadActionService';
import { ClientLeadItem, LeadService } from '@/services/LeadService';

function formatDate(isoStr: string | null): string {
  if (!isoStr) return 'غير محدد';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return isoStr;
  }
}

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [item, setItem] = useState<ClientLeadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callingPhone, setCallingPhone] = useState<string | null>(null);

  const clientId = id ? parseInt(id, 10) : 0;

  const loadClientDetails = async () => {
    if (!clientId) {
      setError('معرف العميل غير صالح');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await LeadService.getClientById(clientId);
      if (data) {
        setItem(data);
      } else {
        setError('لم يتم العثور على العميل');
      }
    } catch (e: any) {
      setError(e.message || 'تعذر تحميل تفاصيل العميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientDetails();
  }, [clientId]);

  const handleCall = async (phoneNumber: string, leadId: number) => {
    if (!phoneNumber || phoneNumber.trim() === '0000000000') {
      Alert.alert('رقم غير صالح', 'رقم الهاتف غير متاح للمكالمة.');
      return;
    }

    try {
      setCallingPhone(phoneNumber);
      // 1. Commit action to SQLite first with leadId
      const actionRowId = await LeadActionService.createAction(leadId, phoneNumber);
      console.log(`Action #${actionRowId} logged for Lead #${leadId} (${phoneNumber})`);

      // 2. Trigger native call
      try {
        await CallLogService.makeDirectCall(phoneNumber);
      } catch (directErr) {
        await Linking.openURL(`tel:${phoneNumber}`);
      }
    } catch (e) {
      Alert.alert('خطأ', 'فشل إجراء المكالمة.');
    } finally {
      setCallingPhone(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <EmptyState
          message={error || 'لم يتم العثور على بيانات العميل.'}
          actionLabel="الرجوع"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const { Client: client, Lead: lead } = item;
  const phones = [client.Phone1, client.Phone2, client.Phone3].filter(
    (p): p is string => Boolean(p) && p !== '0000000000' && p !== '0NULL' && p !== 'NULL'
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: colors.text, fontFamily: NotoKufiArabic.bold }]} numberOfLines={1}>
          تفاصيل العميل والليد
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Client Header Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <View style={styles.clientHeader}>
            <View style={styles.clientTitleMeta}>
              <Text style={[styles.clientName, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>{client.Name}</Text>
              <Text style={[styles.taxCardText, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                رقم التسجيل الضريبي: {client.TaxCard || 'غير مدون'}
              </Text>
            </View>
          </View>

          {client.Domain && client.Domain !== 'NULL' && (
            <View style={styles.metaRow}>
              <Ionicons name="briefcase-outline" size={16} color={colors.accent} />
              <Text style={[styles.metaValue, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                النشاط: {client.Domain}
              </Text>
            </View>
          )}

          {client.District && client.District !== 'NULL' && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={16} color={colors.accent} />
              <Text style={[styles.metaValue, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                العنوان/المنطقة: {client.District} {client.Address ? `- ${client.Address}` : ''}
              </Text>
            </View>
          )}

          {client.Email && (
            <View style={styles.metaRow}>
              <Ionicons name="mail-outline" size={16} color={colors.accent} />
              <Text style={[styles.metaValue, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                البريد: {client.Email}
              </Text>
            </View>
          )}
        </View>

        {/* Available Phones Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            أرقام التواصل والتصوير لمكالمة الليد
          </Text>
        </View>

        {phones.length === 0 ? (
          <Text style={[styles.emptyPhoneText, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
            لا توجد أرقام تواصل مسجلة للعميل.
          </Text>
        ) : (
          phones.map((phone, idx) => (
            <View
              key={idx}
              style={[
                styles.phoneCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                scheme === 'dark' && { borderWidth: 1 },
              ]}>
              <View style={styles.phoneMeta}>
                <Ionicons name="call-outline" size={20} color={colors.accent} />
                <Text style={[styles.phoneNumText, { color: colors.text, fontFamily: NotoKufiArabic.semiBold }]}>
                  {phone.trim()}
                </Text>
              </View>
              {/* Circular Call Icon Button */}
              <Pressable
                onPress={() => handleCall(phone.trim(), lead.LeadId)}
                disabled={callingPhone === phone.trim()}
                style={({ pressed }) => [
                  styles.circularCallBtn,
                  { backgroundColor: colors.accent },
                  pressed && { opacity: 0.8 },
                ]}>
                {callingPhone === phone.trim() ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          ))
        )}

        {/* Lead Info Card */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
            بيانات الليد والمسؤولين
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            scheme === 'dark' && { borderWidth: 1 },
          ]}>
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                معرف الليد (Ref):
              </Text>
              <Text style={[styles.gridVal, { color: colors.accent, fontFamily: NotoKufiArabic.bold }]}>
                #{lead.LeadId}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                الحالة:
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.badgeBackground }]}>
                <Text style={[styles.statusBadgeText, { color: colors.accent, fontFamily: NotoKufiArabic.bold }]}>
                  {lead.LeadStatusName || 'غير محدد'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                المنتج:
              </Text>
              <Text style={[styles.gridVal, { color: colors.text, fontFamily: NotoKufiArabic.semiBold }]}>
                {lead.ProductName || 'General Service'}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                تاريخ المتابعة:
              </Text>
              <Text style={[styles.gridVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]}>
                {formatDate(lead.FollowUpDateTime)}
              </Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                المسؤول:
              </Text>
              <Text style={[styles.gridVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]}>
                {lead.AssignedUserName || '-'}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={[styles.gridLabel, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                المسؤول التقني:
              </Text>
              <Text style={[styles.gridVal, { color: colors.text, fontFamily: NotoKufiArabic.medium }]}>
                {lead.TechnicalUserName || '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Last History Log Card */}
        {lead.LastHistory && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
                آخر سجل متابعة ({lead.HistoryCount} إجمالي)
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                scheme === 'dark' && { borderWidth: 1 },
              ]}>
              <View style={styles.historyMetaRow}>
                <Ionicons name="person-circle-outline" size={18} color={colors.accent} />
                <Text style={[styles.historyUser, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
                  {lead.LastHistory.CreatedBy}
                </Text>
                <Text style={[styles.historyDate, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
                  • {formatDate(lead.LastHistory.CommentDateTime)}
                </Text>
              </View>

              <Text style={[styles.commentText, { color: colors.text, fontFamily: NotoKufiArabic.regular }]}>
                "{lead.LastHistory.Comment || 'بدون ملاحظات'}"
              </Text>

              {lead.LastHistory.AudioRecordPath && (
                <Pressable
                  onPress={() => Linking.openURL(lead.LastHistory!.AudioRecordPath!)}
                  style={styles.audioBtn}>
                  <Ionicons name="play-circle-outline" size={20} color={colors.accent} />
                  <Text style={[styles.audioBtnText, { color: colors.accent, fontFamily: NotoKufiArabic.bold }]}>
                    استماع إلى تسجيل المكالمة ({lead.LastHistory.CallDurationSeconds} ثانية)
                  </Text>
                </Pressable>
              )}
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
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientTitleMeta: {
    flex: 1,
    gap: 4,
  },
  clientName: {
    fontSize: 18,
  },
  taxCardText: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaValue: {
    fontSize: 13,
    flex: 1,
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
  },
  emptyPhoneText: {
    fontSize: 14,
  },
  phoneCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  phoneMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phoneNumText: {
    fontSize: 16,
  },
  circularCallBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gridCol: {
    flex: 1,
    gap: 2,
  },
  gridLabel: {
    fontSize: 12,
  },
  gridVal: {
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
  },
  historyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyUser: {
    fontSize: 14,
  },
  historyDate: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  audioBtnText: {
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
