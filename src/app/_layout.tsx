import React, { useEffect } from 'react';
import { I18nManager, Text, useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { NotoKufiArabic } from '@/constants/theme';
import { AuthProvider } from '@/context/AuthContext';

try {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
} catch (e) {
  console.warn('Failed to force RTL:', e);
}

SplashScreen.preventAutoHideAsync();

// Set global default font family for React Native Text
if ((Text as any).defaultProps) {
  (Text as any).defaultProps.style = [
    { fontFamily: NotoKufiArabic.regular },
    (Text as any).defaultProps.style,
  ];
} else {
  (Text as any).defaultProps = {
    style: { fontFamily: NotoKufiArabic.regular },
  };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    'NotoKufiArabic-Thin': require('../../assets/fonts/NotoKufiArabic-Thin.ttf'),
    'NotoKufiArabic-ExtraLight': require('../../assets/fonts/NotoKufiArabic-ExtraLight.ttf'),
    'NotoKufiArabic-Light': require('../../assets/fonts/NotoKufiArabic-Light.ttf'),
    'NotoKufiArabic-Regular': require('../../assets/fonts/NotoKufiArabic-Regular.ttf'),
    'NotoKufiArabic-Medium': require('../../assets/fonts/NotoKufiArabic-Medium.ttf'),
    'NotoKufiArabic-SemiBold': require('../../assets/fonts/NotoKufiArabic-SemiBold.ttf'),
    'NotoKufiArabic-Bold': require('../../assets/fonts/NotoKufiArabic-Bold.ttf'),
    'NotoKufiArabic-ExtraBold': require('../../assets/fonts/NotoKufiArabic-ExtraBold.ttf'),
    'NotoKufiArabic-Black': require('../../assets/fonts/NotoKufiArabic-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </AuthProvider>
    </ThemeProvider>
  );
}
