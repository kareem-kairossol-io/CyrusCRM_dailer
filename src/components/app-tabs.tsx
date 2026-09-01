import { Tabs } from 'expo-router';

import { CustomNav } from '@/components/custom-nav';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomNav {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'الرئيسية' }} />
      <Tabs.Screen name="calls" options={{ title: 'المكالمات' }} />
      <Tabs.Screen name="leads" options={{ title: 'العملاء والمتابعات' }} />
      <Tabs.Screen name="lead-actions" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ title: 'الحساب' }} />
      <Tabs.Screen name="login" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
