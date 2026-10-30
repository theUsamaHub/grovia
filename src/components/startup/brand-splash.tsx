import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AppText } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
export function BrandSplash({ onComplete }: { onComplete: () => void }) {
  const { palette } = useAppTheme();
  const [opacity] = useState(() => new Animated.Value(1));
  const [growth] = useState(() => new Animated.Value(0));
  const complete = useRef(false);
  const hideNative = useCallback(() => {
    void SplashScreen.hideAsync().catch(console.warn);
  }, []);
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    const finish = () => {
      if (active && !complete.current) {
        complete.current = true;
        hideNative();
        onComplete();
      }
    };
    const skip = () => {
      animation?.stop();
      finish();
    };
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (enabled) skip();
      },
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (!active) return;
        if (reduced) {
          skip();
          return;
        }
        const native = Platform.OS !== 'web';
        animation = Animated.sequence([
          Animated.timing(growth, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: native,
          }),
          Animated.delay(120),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: native,
          }),
        ]);
        animation.start(({ finished }) => {
          if (finished) finish();
        });
      })
      .catch(skip);
    // A lost animation callback must never strand the user on the launch screen.
    const fallback = setTimeout(finish, 1400);
    return () => {
      active = false;
      animation?.stop();
      listener.remove();
      clearTimeout(fallback);
    };
  }, [growth, opacity, onComplete, hideNative]);
  return (
    <Animated.View
      onLayout={hideNative}
      accessibilityLabel="Grovia. Focus. Grow. Thrive."
      accessibilityRole="progressbar"
      style={[
        StyleSheet.absoluteFill,
        styles.container,
        { backgroundColor: palette.background, opacity },
      ]}
    >
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [
            {
              scale: growth.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
            {
              translateY: growth.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        }}
      >
        <View style={[styles.halo, { backgroundColor: palette.surfaceMuted }]}>
          <Image
            source={require('../../../assets/images/grovia-adaptive.png')}
            style={{ width: 220, height: 220 }}
            accessible={false}
          />
        </View>
        <AppText
          variant="title"
          style={{
            fontSize: 44,
            lineHeight: 56,
            color: palette.primary,
            marginTop: 24,
          }}
        >
          Grovia
        </AppText>
        <AppText muted style={{ marginTop: 8 }}>
          Focus. Grow. Thrive.
        </AppText>
      </Animated.View>
      <AppText
        muted
        variant="label"
        style={{ position: 'absolute', bottom: 56, letterSpacing: 2 }}
      >
        SMALL STEPS. STEADY ROOTS.
      </AppText>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  halo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
