import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { SecondaryButton } from '@/components/secondary-button';
import { Colors } from '@/constants/theme';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      <SymbolView
        name={{ ios: 'tray', android: 'inbox', web: 'inbox' }}
        size={44}
        tintColor={colors.textSecondary}
      />
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction && (
        <SecondaryButton
          title={actionLabel}
          onPress={onAction}
          style={styles.actionBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  actionBtn: {
    marginTop: 8,
    minWidth: 120,
  },
});
