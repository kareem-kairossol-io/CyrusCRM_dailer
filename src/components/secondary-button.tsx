import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
  style?: ViewStyle;
}

export function SecondaryButton({ title, onPress, variant = 'default', style }: SecondaryButtonProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const isDanger = variant === 'danger';
  const textColor = isDanger ? colors.danger : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.7 },
        style,
      ]}>
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
