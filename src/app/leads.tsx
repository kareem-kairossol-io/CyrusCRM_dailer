import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';
import { LeadActionService } from '@/services/LeadActionService';

export interface Lead {
  id: number;
  refCode: string;
  name: string;
  number: string;
  status: string;
}

export const DUMMY_LEADS: Lead[] = [
  {
    id: 101,
    refCode: 'REF-8492',
    name: 'Mohamed Ali',
    number: '+20 12 25609831',
    status: 'VIP Lead',
  },
  {
    id: 102,
    refCode: 'REF-3910',
    name: 'Sara Ibrahim',
    number: '01550552371',
    status: 'New Lead',
  },
  {
    id: 103,
    refCode: 'REF-5521',
    name: 'Omar Khaled',
    number: '0114588203',
    status: 'Follow Up',
  },
  {
    id: 104,
    refCode: 'REF-9904',
    name: 'Sphinx Commercial Co.',
    number: '+20 12 25609831', // Repeated number with different name & ref
    status: 'Enterprise',
  },
  {
    id: 105,
    refCode: 'REF-7128',
    name: 'Youssef Mahmoud',
    number: '01550552371', // Repeated number with different name & ref
    status: 'Hot Lead',
  },
];

export default function LeadsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [callingId, setCallingId] = useState<number | null>(null);

  const handleCallAndLogAction = async (lead: Lead) => {
    try {
      setCallingId(lead.id);
      // 1. Commit action to SQLite first
      const rowId = await LeadActionService.createAction(lead.id, lead.number);
      console.log(`Action #${rowId} logged for lead ID #${lead.id} (${lead.number})`);
      
      // 2. Open external phone dialer
      await Linking.openURL(`tel:${lead.number}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to log lead call action.');
    } finally {
      setCallingId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={DUMMY_LEADS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Leads</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Tap the call button to place a call and log the action.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const initial = item.name.charAt(0).toUpperCase();

          return (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                scheme === 'dark' && { borderWidth: 1 },
              ]}>
              {/* Left Avatar */}
              <View style={[styles.avatar, { backgroundColor: colors.badgeBackground }]}>
                <Text style={[styles.avatarText, { color: colors.accent }]}>{initial}</Text>
              </View>

              {/* Middle Lead Info */}
              <View style={styles.leadMeta}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: colors.badgeBackground }]}>
                    <Text style={[styles.badgeText, { color: colors.accent }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.refText, { color: colors.textSecondary }]}>
                  ID: #{item.id} • {item.number}
                </Text>
              </View>

              {/* Right Side: Circular Call Icon Button (No Shadow) */}
              <Pressable
                onPress={() => handleCallAndLogAction(item)}
                disabled={callingId === item.id}
                style={({ pressed }) => [
                  styles.callCircleBtn,
                  { backgroundColor: colors.accent },
                  pressed && { opacity: 0.8 },
                ]}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  leadMeta: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  refText: {
    fontSize: 13,
    fontWeight: '400',
  },
  callCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
    shadowOpacity: 0,
  },
});
