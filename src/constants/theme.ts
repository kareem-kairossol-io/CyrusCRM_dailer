import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FAF9F7',
    backgroundElement: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B70',
    border: '#E7E5E1',
    accent: '#E8862B',
    accentGradientStart: '#F2A23D',
    accentGradientEnd: '#E8862B',
    success: '#2E9E5B',
    danger: '#D64545',
    badgeBackground: 'rgba(232,134,43,0.10)',
    backgroundSelected: '#F0EFEA',
  },
  dark: {
    background: '#0B0B0C',
    backgroundElement: 'rgba(255,255,255,0.04)',
    text: '#FFFFFF',
    textSecondary: '#C9C9CC',
    border: 'rgba(255,255,255,0.08)',
    accent: '#E8862B',
    accentGradientStart: '#F2A23D',
    accentGradientEnd: '#E8862B',
    success: '#3DBE73',
    danger: '#E5605F',
    badgeBackground: 'rgba(255,255,255,0.06)',
    backgroundSelected: 'rgba(255,255,255,0.10)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const NotoKufiArabic = {
  thin: 'NotoKufiArabic-Thin',
  extraLight: 'NotoKufiArabic-ExtraLight',
  light: 'NotoKufiArabic-Light',
  regular: 'NotoKufiArabic-Regular',
  medium: 'NotoKufiArabic-Medium',
  semiBold: 'NotoKufiArabic-SemiBold',
  bold: 'NotoKufiArabic-Bold',
  extraBold: 'NotoKufiArabic-ExtraBold',
  black: 'NotoKufiArabic-Black',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: NotoKufiArabic.regular,
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: NotoKufiArabic.regular,
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: NotoKufiArabic.regular,
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
