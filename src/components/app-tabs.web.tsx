import { Tabs } from 'expo-router';

import { CustomNav } from '@/components/custom-nav';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomNav {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="calls" options={{ title: 'Calls' }} />
      <Tabs.Screen name="leads" options={{ title: 'Leads' }} />
      <Tabs.Screen name="lead-actions" options={{ title: 'Actions' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
