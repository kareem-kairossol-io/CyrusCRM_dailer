import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

import { Colors, NotoKufiArabic } from '@/constants/theme';

export interface StatCardProps {
  icon?: React.ReactNode;
  value: string | number;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.backgroundElement },
        scheme === 'dark' && { borderWidth: 1, borderColor: colors.border },
      ]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.value, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: NotoKufiArabic.medium }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    marginBottom: 4,
    textAlign: 'right',
  },
  label: {
    fontSize: 11,
    textAlign: 'right',
  },
});
