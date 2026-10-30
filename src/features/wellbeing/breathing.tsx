import { useEffect, useState, useRef, useCallback } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Platform,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, AppText, AppButton } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
export function Breathing() {
  const { palette } = useAppTheme();
  const [minutes, setMinutes] = useState(1);
  const [box, setBox] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);
  const [reduce, setReduce] = useState(true);
  const [scale] = useState(() => new Animated.Value(1));
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduce,
    );
    return () => sub.remove();
  }, []);
  useFocusEffect(useCallback(() => () => setRunning(false), []));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') setRunning(false);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!running) return;
    const anchor = Date.now() - elapsedRef.current;
    const timer = setInterval(() => {
      const value = Math.min(minutes * 60000, Date.now() - anchor);
      setElapsed(value);
      if (value >= minutes * 60000) setRunning(false);
    }, 200);
    return () => clearInterval(timer);
  }, [running, minutes]); // elapsed is captured at each start/resume.
  const phase = Math.floor(elapsed / 4000) % (box ? 4 : 2);
  const label =
    elapsed >= minutes * 60000
      ? 'A moment for yourself'
      : (box
          ? ['Breathe in', 'Hold gently', 'Breathe out', 'Rest']
          : ['Breathe in', 'Breathe out'])[phase];
  useEffect(() => {
    const animation = Animated.timing(scale, {
      toValue:
        running && !reduce && (phase === 0 || (box && phase === 1)) ? 1.18 : 1,
      duration: reduce ? 0 : 3800,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [phase, box, running, reduce, scale]);
  return (
    <Card>
      <AppText variant="heading">Take a breathing break</AppText>
      <AppText muted>
        A gentle relaxation exercise. Breathe comfortably; stop whenever you
        wish.
      </AppText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {[1, 3, 5].map((n) => (
          <AppButton
            key={n}
            label={(n === minutes ? '✓ ' : '') + n + ' min'}
            disabled={running}
            onPress={() => {
              setMinutes(n);
              setElapsed(0);
            }}
          />
        ))}
      </View>
      <AppButton
        label={
          box
            ? 'Box breathing · 4 / 4 / 4 / 4'
            : 'Easy breathing · 4 in / 4 out'
        }
        disabled={running}
        onPress={() => {
          setBox(!box);
          setElapsed(0);
        }}
      />
      <View
        style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}
      >
        <Animated.View
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: palette.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale }],
          }}
        >
          <AppText variant="label" style={{ textAlign: 'center' }}>
            {label}
          </AppText>
        </Animated.View>
      </View>
      <AppText muted>
        {Math.ceil(Math.max(0, minutes * 60000 - elapsed) / 1000)} seconds
        remaining
      </AppText>
      <AppButton
        label={
          running
            ? 'Pause breathing'
            : elapsed >= minutes * 60000
              ? 'Start again'
              : elapsed
                ? 'Resume breathing'
                : 'Start breathing'
        }
        onPress={() => {
          if (elapsed >= minutes * 60000) setElapsed(0);
          setRunning(!running);
        }}
      />
      <AppButton
        label="Reset"
        onPress={() => {
          setRunning(false);
          setElapsed(0);
        }}
      />
    </Card>
  );
}
