import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { SecondaryButton } from '@/components/secondary-button';
import { StatusBadge } from '@/components/status-badge';
import { UploadStatusBadge } from '@/components/upload-status-badge';
import { Colors } from '@/constants/theme';
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

  const handleCallBack = () => {
    if (call?.phoneNumber) {
      Linking.openURL(`tel:${call.phoneNumber}`);
    }
  };

  const handleRetryUpload = async () => {
    try {
      await CallLogService.retryFailedUploads();
      Alert.alert('Upload Queue Woken', 'Retrying upload queue in the background.', [
        { text: 'OK', onPress: () => load() },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to trigger upload retry.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete call?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (call) {
            await CallLogService.deleteCall(call.id);
            router.back();
          }
        },
      },
    ]);
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

  if (!call) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <EmptyState message="Call not found." />
      </SafeAreaView>
    );
  }

  const initial =
    call.contactName && call.contactName !== 'غير مسجل'
      ? call.contactName.trim().charAt(0).toUpperCase()
      : null;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Large Avatar */}
        <View style={[styles.avatar, { backgroundColor: colors.badgeBackground }]}>
          {initial ? (
            <Text style={[styles.avatarText, { color: colors.accent }]}>{initial}</Text>
          ) : (
            <SymbolView
              name={{ ios: 'phone.fill', android: 'call', web: 'phone' }}
              size={24}
              tintColor={colors.accent}
            />
          )}
        </View>

        {/* Contact Name & Phone Number */}
        <Text style={[styles.name, { color: colors.text }]}>
          {call.contactName || call.phoneNumber}
        </Text>
        <Text style={[styles.phoneNumber, { color: colors.textSecondary }]}>
          {call.phoneNumber}
        </Text>

        {/* Linked Ref Badge if present */}
        {Boolean(call.ref) && (
          <View style={[styles.refBadge, { backgroundColor: colors.badgeBackground }]}>
            <Text style={[styles.refBadgeText, { color: colors.accent }]}>
              Linked Ref: {call.ref}
            </Text>
          </View>
        )}

        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {call.direction}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>·</Text>
          <StatusBadge status={call.status} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>·</Text>
          <UploadStatusBadge status={call.uploadStatus} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatDate(call.date)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <PrimaryButton title="Call back" onPress={handleCallBack} />

          {call.uploadStatus !== 'UPLOADED' && (
            <SecondaryButton title="Retry Upload Queue" onPress={handleRetryUpload} />
          )}

          {Boolean(call.recordingPath) && (
            <SecondaryButton
              title="Play recording"
              onPress={() => {
                /* TODO: wire up audio playback */
              }}
            />
          )}

          <SecondaryButton
            title="Delete call"
            variant="danger"
            onPress={handleDelete}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
  },
  refBadge: {
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  refBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '400',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
});
