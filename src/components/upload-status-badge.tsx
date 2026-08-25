import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';

export interface UploadStatusBadgeProps {
  status?: string;
}

export function UploadStatusBadge({ status = 'PENDING' }: UploadStatusBadgeProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  let label = 'Pending';
  let badgeBg = 'rgba(232, 134, 43, 0.12)';
  let textColor: string = colors.accent;
  let iconName: keyof typeof Ionicons.glyphMap = 'time-outline';

  if (status === 'UPLOADED') {
    label = 'Uploaded';
    badgeBg = scheme === 'dark' ? 'rgba(61, 190, 115, 0.18)' : 'rgba(46, 158, 91, 0.12)';
    textColor = colors.success;
    iconName = 'cloud-done-outline';
  } else if (status === 'FAILED') {
    label = 'Failed';
    badgeBg = scheme === 'dark' ? 'rgba(229, 96, 95, 0.18)' : 'rgba(214, 69, 69, 0.12)';
    textColor = colors.danger;
    iconName = 'cloud-offline-outline';
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
      <Ionicons name={iconName} size={11} color={textColor} />
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
