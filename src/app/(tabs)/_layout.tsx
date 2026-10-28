import { Tabs } from 'expo-router/js-tabs';
import { BottomBar } from '@/components/navigation/bottom-bar';
import { useAppTheme } from '@/theme/provider';
export default function TabLayout() {
  const { palette } = useAppTheme();
  return (
    <Tabs
      backBehavior="history"
      tabBar={(props) => <BottomBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        animation: 'none',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Focus' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="world" options={{ title: 'World' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
