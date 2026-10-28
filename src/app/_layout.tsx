import { useFonts } from 'expo-font';
import { Stack, ThemeProvider, DefaultTheme, DarkTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { BrandSplash } from '@/components/startup/brand-splash';
import { FocusProvider } from '@/features/focus/provider';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Outfit_400Regular } from '@expo-google-fonts/outfit/400Regular';
import { Outfit_500Medium } from '@expo-google-fonts/outfit/500Medium';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Outfit_700Bold } from '@expo-google-fonts/outfit/700Bold';
import { DMSans_400Regular as DM_Sans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium as DM_Sans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold as DM_Sans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { AppThemeProvider, useAppTheme } from '@/theme/provider';
import { AppText, AppButton } from '@/components/ui/primitives';
export { ErrorBoundary } from 'expo-router';
void SplashScreen.preventAutoHideAsync().catch(console.warn);
export default function RootLayout() {
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
    if (error) void SplashScreen.hideAsync().catch(console.warn);
  }, [loaded, error]);
  if (error) throw error;
  if (!loaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <ThemedApp />
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
function ThemedApp() {
  const { mode, palette, ready, error, retry } = useAppTheme();
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);
  useEffect(() => {
    if (error) void SplashScreen.hideAsync().catch(console.warn);
  }, [ready, error]);
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          primary: palette.primary,
          background: palette.background,
          card: palette.surface,
          text: palette.text,
          border: palette.border,
          notification: palette.danger,
        },
      }}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {!ready ? (
        <View
          style={{
            flex: 1,
            padding: 24,
            gap: 16,
            justifyContent: 'center',
            backgroundColor: palette.background,
          }}
        >
          {error ? (
            <>
              <AppText variant="heading">Let’s try that again</AppText>
              <AppText>{error}</AppText>
              <AppButton label="Retry" onPress={retry} />
            </>
          ) : (
            <ActivityIndicator
              color={palette.primary}
              accessibilityLabel="Loading your preferences"
            />
          )}
        </View>
      ) : (
        <FocusProvider>
          <View style={{ flex: 1 }}>
            <View
              style={{ flex: 1 }}
              pointerEvents={introDone ? 'auto' : 'none'}
              accessibilityElementsHidden={!introDone}
              importantForAccessibility={
                introDone ? 'auto' : 'no-hide-descendants'
              }
              aria-hidden={!introDone}
            >
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: palette.background },
                }}
              />
            </View>
            {!introDone && <BrandSplash onComplete={finishIntro} />}
          </View>
        </FocusProvider>
      )}
    </ThemeProvider>
  );
}
