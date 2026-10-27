import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Outfit_400Regular } from '@expo-google-fonts/outfit/400Regular';
import { Outfit_500Medium } from '@expo-google-fonts/outfit/500Medium';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Outfit_700Bold } from '@expo-google-fonts/outfit/700Bold';
import { DMSans_400Regular as DM_Sans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium as DM_Sans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold as DM_Sans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { colors } from '@/theme';
export { ErrorBoundary } from 'expo-router';
void SplashScreen.preventAutoHideAsync().catch(console.warn);
export default function RootLayout() {
  const mode = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    DM_Sans_400Regular,
    DM_Sans_500Medium,
    DM_Sans_600SemiBold,
  });
  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync().catch(console.warn);
  }, [loaded, error]);
  if (error) throw error;
  if (!loaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors[mode].background },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
