import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export interface StatusBadgeProps {
  status: 'ANSWERED' | 'NO_ANSWER';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const isAnswered = status === 'ANSWERED';
  const backgroundColor = isAnswered ? 'rgba(46,158,91,0.12)' : 'rgba(214,69,69,0.12)';
  const textColor = isAnswered ? colors.success : colors.danger;
  const labelText = isAnswered ? 'Answered' : 'No Answer';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{labelText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
