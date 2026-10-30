import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Animated, Platform } from 'react-native';
import { ScrollView, View, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './primitives';
import { useAppTheme } from '@/theme/provider';
export function Screen({
  title,
  subtitle,
  children,
}: ViewProps & { title: string; subtitle?: string }) {
  const { palette } = useAppTheme();
  const [opacity] = useState(() => new Animated.Value(1));
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      let animation: Animated.CompositeAnimation | undefined;
      void AccessibilityInfo.isReduceMotionEnabled()
        .then((reduce) => {
          if (!alive || reduce) return;
          opacity.setValue(0.75);
          animation = Animated.timing(opacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: Platform.OS !== 'web',
          });
          animation.start();
        })
        .catch(() => {});
      const sub = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (reduce) => {
          if (reduce) {
            animation?.stop();
            opacity.setValue(1);
          }
        },
      );
      return () => {
        alive = false;
        animation?.stop();
        opacity.setValue(1);
        sub.remove();
      };
    }, [opacity]),
  );
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: palette.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.content, { opacity }]}>
          <View style={{ gap: 4 }}>
            <AppText
              accessibilityRole="header"
              variant="title"
              style={{ fontSize: 28, lineHeight: 36 }}
            >
              {title}
            </AppText>
            {subtitle && <AppText muted>{subtitle}</AppText>}
          </View>
          {children}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 28 },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', gap: 24 },
});
