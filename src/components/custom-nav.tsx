import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';

export function CustomNav({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (!state || !state.routes) return null;

  // Hide the navigation bar completely on the login screen
  const activeRoute = state.routes[state.index];
  if (activeRoute && activeRoute.name === 'login') {
    return null;
  }

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
        // Exclude hidden screens or routes starting with _ or call-actions
        if (
          route.name === 'login' ||
          route.name.startsWith('_') ||
          route.name.startsWith('call-actions') ||
          route.name === 'explore' ||
          route.name === 'analytics' ||
          route.name === 'settings'
        ) {
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

        let label = 'Home';
        let iconName: keyof typeof Ionicons.glyphMap = isFocused ? 'home' : 'home-outline';

        if (route.name === 'index') {
          label = 'Home';
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'calls') {
          label = 'Calls';
          iconName = isFocused ? 'call' : 'call-outline';
        } else if (route.name === 'leads') {
          label = 'Leads';
          iconName = isFocused ? 'people' : 'people-outline';
        } else if (route.name === 'lead-actions') {
          label = 'Actions';
          iconName = isFocused ? 'flash' : 'flash-outline';
        }

        const activeColor = colors.accent;
        const inactiveColor = colors.textSecondary;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && { opacity: 0.7 },
            ]}>
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? activeColor : inactiveColor}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isFocused ? activeColor : inactiveColor,
                  fontWeight: isFocused ? '700' : '500',
                },
              ]}>
              {label}
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
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
});
