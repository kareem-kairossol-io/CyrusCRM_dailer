import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Colors, NotoKufiArabic } from '@/constants/theme';

export interface StatusBadgeProps {
  status: 'ANSWERED' | 'NO_ANSWER' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const isAnswered = status === 'ANSWERED';
  const backgroundColor = isAnswered ? 'rgba(46,158,91,0.12)' : 'rgba(214,69,69,0.12)';
  const textColor = isAnswered ? colors.success : colors.danger;
  const labelText = isAnswered ? 'تم الرد' : 'لم يتم الرد';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor, fontFamily: NotoKufiArabic.medium }]}>{labelText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
  },
});
