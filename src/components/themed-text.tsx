import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, NotoKufiArabic, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'], fontFamily: NotoKufiArabic.regular },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: NotoKufiArabic.medium,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: NotoKufiArabic.bold,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: NotoKufiArabic.medium,
  },
  title: {
    fontSize: 28,
    fontFamily: NotoKufiArabic.bold,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: NotoKufiArabic.semiBold,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: NotoKufiArabic.regular,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
    fontFamily: NotoKufiArabic.medium,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
