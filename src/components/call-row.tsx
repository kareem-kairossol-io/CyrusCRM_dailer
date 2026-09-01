import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { StatusBadge } from '@/components/status-badge';
import { UploadStatusBadge } from '@/components/upload-status-badge';
import { Colors, NotoKufiArabic } from '@/constants/theme';
import { CallRecord } from '@/services/CallLogService';

export interface CallRowProps {
  call: CallRecord;
  onPress: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(epochMillis: number): string {
  if (!epochMillis) return '';
  const date = new Date(epochMillis);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function CallRow({ call, onPress }: CallRowProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const nameText = call.contactName || call.phoneNumber;
  const initial = (call.contactName && call.contactName !== 'غير مسجل')
    ? call.contactName.trim().charAt(0).toUpperCase()
    : null;

  const isOutgoing = call.direction === 'OUTGOING';
  const isAnswered = call.status === 'ANSWERED';

  // Arrow color & symbol configuration typed safely
  let arrowColor: string = colors.accent;
  let iosSymbol: any = 'arrow.up.right';
  let androidSymbol = 'north_east';
  let webSymbol = 'link';

  if (isOutgoing) {
    arrowColor = colors.accent;
    iosSymbol = 'arrow.up.right';
    androidSymbol = 'north_east';
  } else if (isAnswered) {
    arrowColor = colors.success;
    iosSymbol = 'arrow.down.left';
    androidSymbol = 'south_west';
  } else {
    arrowColor = colors.danger;
    iosSymbol = 'arrow.down.left';
    androidSymbol = 'south_west';
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: 'rgba(232,134,43,0.04)' },
      ]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.badgeBackground }]}>
        {initial ? (
          <Text style={[styles.initialText, { color: colors.accent, fontFamily: NotoKufiArabic.bold }]}>{initial}</Text>
        ) : (
          <SymbolView
            name={{ ios: 'phone.fill', android: 'call', web: 'phone' }}
            size={18}
            tintColor={colors.accent}
          />
        )}
      </View>

      {/* Middle Content - RTL */}
      <View style={styles.middleContent}>
        <View style={styles.nameHeaderRow}>
          <Text style={[styles.name, { color: colors.text, fontFamily: NotoKufiArabic.bold }]} numberOfLines={1}>
            {nameText}
          </Text>
          {Boolean(call.ref) && (
            <View style={[styles.refTag, { backgroundColor: colors.badgeBackground }]}>
              <Text style={[styles.refTagText, { color: colors.accent, fontFamily: NotoKufiArabic.bold }]}>
                #{call.ref}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <StatusBadge status={call.status} />
          <UploadStatusBadge status={call.uploadStatus} />
          <Text style={[styles.dateText, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]} numberOfLines={1}>
            · {formatDate(call.date)}
          </Text>
        </View>
      </View>

      {/* Right Content: Duration & Direction Arrow */}
      <View style={styles.rightContent}>
        <Text style={[styles.duration, { color: colors.textSecondary, fontFamily: NotoKufiArabic.medium }]}>
          {formatDuration(call.duration)}
        </Text>
        <SymbolView
          name={{ ios: iosSymbol, android: androidSymbol, web: webSymbol } as any}
          size={16}
          tintColor={arrowColor}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 16,
  },
  middleContent: {
    flex: 1,
    marginRight: 12,
    marginLeft: 8,
    gap: 4,
    alignItems: 'flex-start',
  },
  nameHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  refTag: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  refTagText: {
    fontSize: 10,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 12,
    textAlign: 'right',
  },
  rightContent: {
    alignItems: 'flex-start',
    gap: 4,
  },
  duration: {
    fontSize: 12,
  },
});
