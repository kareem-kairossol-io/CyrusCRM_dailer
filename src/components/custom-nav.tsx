import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors, NotoKufiArabic } from '@/constants/theme';

export function CustomNav({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (!state || !state.routes) return null;

  // Hide the navigation bar completely on the login screen
  const activeRoute = state.routes[state.index];
  const activeRouteName = activeRoute?.name || '';
  if (activeRouteName === 'login' || activeRouteName.includes('login')) {
    return null;
  }

  // Exact mapping of allowed tabs in the bottom navigation bar
  const tabConfigs: Record<
    string,
    { label: string; activeIcon: keyof typeof Ionicons.glyphMap; inactiveIcon: keyof typeof Ionicons.glyphMap }
  > = {
    index: { label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
    calls: { label: 'Calls', activeIcon: 'call', inactiveIcon: 'call-outline' },
    leads: { label: 'Leads', activeIcon: 'people', inactiveIcon: 'people-outline' },
    'lead-actions': { label: 'Actions', activeIcon: 'flash', inactiveIcon: 'flash-outline' },
    profile: { label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
  };

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.backgroundElement,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}>
      {state.routes.map((route: any, index: number) => {
        const config = tabConfigs[route.name];

        // Do NOT render any route that is not explicitly in tabConfigs!
        if (!config) {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const activeColor = colors.accent;
        const inactiveColor = colors.textSecondary;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.7 }]}>
            <Ionicons
              name={isFocused ? config.activeIcon : config.inactiveIcon}
              size={22}
              color={isFocused ? activeColor : inactiveColor}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isFocused ? activeColor : inactiveColor,
                  fontFamily: isFocused ? NotoKufiArabic.bold : NotoKufiArabic.medium,
                },
              ]}>
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
  },
});
