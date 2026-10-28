import { useCallback, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText, AppButton, Card } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import { useFocus } from '@/features/focus/provider';
import { elapsed, formatTime, type FocusMode } from '@/features/focus/engine';
const modes: {
  key: FocusMode;
  label: string;
  minutes: number;
  rest: number;
}[] = [
  { key: 'pomodoro', label: 'Pomodoro', minutes: 25, rest: 5 },
  { key: 'deep', label: 'Deep focus', minutes: 50, rest: 10 },
  { key: 'quick', label: 'Quick focus', minutes: 10, rest: 2 },
  { key: 'custom', label: 'Custom', minutes: 25, rest: 5 },
  { key: 'stopwatch', label: 'Stopwatch', minutes: 25, rest: 5 },
];
export default function FocusScreen() {
  const { palette, mode } = useAppTheme();
  const focus = useFocus();
  const { state, now, busy, ready } = focus;
  const [selected, setSelected] = useState<FocusMode>('pomodoro');
  const [minutes, setMinutes] = useState('25');
  const [rest, setRest] = useState('5');
  const [confirm, setConfirm] = useState<'stop' | 'restart' | null>(null);
  const [reduce, setReduce] = useState(true);
  const [scale] = useState(() => new Animated.Value(1));
  const session = state.active;
  const running = !!session && session.anchorMs !== null;
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduce,
    );
    return () => listener.remove();
  }, []);
  useFocusEffect(
    useCallback(() => {
      if (reduce || !running) return;
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.035,
            duration: 2600,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 2600,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      );
      animation.start();
      return () => {
        animation.stop();
        scale.setValue(1);
      };
    }, [reduce, running, scale]),
  );
  const choice = modes.find((item) => item.key === selected)!;
  const duration = selected === 'custom' ? Number(minutes) : choice.minutes;
  const breakMinutes = selected === 'custom' ? Number(rest) : choice.rest;
  const valid =
    Number.isInteger(duration) &&
    duration >= 1 &&
    duration <= 180 &&
    Number.isInteger(breakMinutes) &&
    breakMinutes >= 1 &&
    breakMinutes <= 60;
  const spent = session ? elapsed(session, now) : 0;
  const stopwatch = (session?.mode ?? selected) === 'stopwatch';
  const remaining = session ? session.durationMs - spent : duration * 60000;
  return (
    <Screen title="Grovia" subtitle="A little focus. A little growth.">
      {!ready ? (
        <Card>
          <AppText>{focus.error ?? 'Opening your quiet space…'}</AppText>
          {focus.error && <AppButton label="Try again" onPress={focus.retry} />}
        </Card>
      ) : (
        <>
          <View style={styles.options}>
            {modes.map((item) => (
              <Pressable
                key={item.key}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: (session?.mode ?? selected) === item.key,
                  disabled: !!session || busy,
                }}
                disabled={!!session || busy}
                onPress={() => setSelected(item.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      (session?.mode ?? selected) === item.key
                        ? palette.primary
                        : palette.surface,
                  },
                ]}
              >
                <AppText
                  variant="label"
                  style={{
                    color:
                      (session?.mode ?? selected) === item.key
                        ? palette.onPrimary
                        : palette.text,
                  }}
                >
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
          {!session && selected === 'custom' && (
            <Card>
              <AppText variant="heading">Make room for your rhythm</AppText>
              <View style={styles.options}>
                {[
                  {
                    label: 'Focus minutes (1–180)',
                    value: minutes,
                    set: setMinutes,
                  },
                  { label: 'Break minutes (1–60)', value: rest, set: setRest },
                ].map((field) => (
                  <View
                    key={field.label}
                    style={{ flex: 1, minWidth: 140, gap: 8 }}
                  >
                    <AppText variant="label">{field.label}</AppText>
                    <TextInput
                      accessibilityLabel={field.label}
                      keyboardType="number-pad"
                      value={field.value}
                      onChangeText={field.set}
                      maxLength={3}
                      style={[
                        styles.input,
                        { color: palette.text, borderColor: palette.border },
                      ]}
                    />
                  </View>
                ))}
              </View>
              {!valid && (
                <AppText style={{ color: palette.danger }}>
                  Enter whole minutes within the ranges above.
                </AppText>
              )}
            </Card>
          )}
          <ImageBackground
            source={require('../../../assets/images/forest-glade.jpg')}
            imageStyle={{ opacity: mode === 'dark' ? 0.3 : 0.65 }}
            style={[styles.scene, { backgroundColor: palette.surfaceMuted }]}
          >
            <AppText
              variant="label"
              style={[styles.badge, { backgroundColor: palette.surface }]}
            >
              {session?.kind === 'break'
                ? 'Time to recharge'
                : session
                  ? running
                    ? 'Your forest is growing'
                    : 'Take your time · paused'
                  : 'Find your quiet moment'}
            </AppText>
            <View
              style={[
                styles.timer,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.accent,
                },
              ]}
            >
              <Animated.Image
                source={require('../../../assets/images/grovia-adaptive.png')}
                style={{ width: 112, height: 96, transform: [{ scale }] }}
                accessibilityIgnoresInvertColors
              />
              <AppText
                accessibilityLabel={
                  (stopwatch ? 'Elapsed time ' : 'Time remaining ') +
                  formatTime(
                    stopwatch
                      ? spent
                      : Number.isFinite(remaining)
                        ? remaining
                        : 0,
                  )
                }
                style={{
                  fontSize: 48,
                  lineHeight: 58,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {formatTime(
                  stopwatch
                    ? spent
                    : Number.isFinite(remaining)
                      ? remaining
                      : 0,
                )}
              </AppText>
              <AppText style={{ color: palette.textMuted }}>
                {stopwatch
                  ? 'One moment at a time'
                  : session?.kind === 'break'
                    ? 'Breathe. Stretch. Reset.'
                    : 'Let everything else wait.'}
              </AppText>
            </View>
            <View style={{ width: '100%', gap: 12 }}>
              {session?.taskTitle && (
                <AppText variant="label">
                  Focusing on: {session.taskTitle}
                </AppText>
              )}
              {!session ? (
                <AppButton
                  label={stopwatch ? 'Start stopwatch' : 'Start focus'}
                  disabled={busy || !valid}
                  onPress={() =>
                    void focus.start(selected, duration, breakMinutes)
                  }
                />
              ) : (
                <>
                  <AppButton
                    label={running ? 'Pause session' : 'Resume session'}
                    disabled={busy}
                    onPress={() =>
                      void focus.command(running ? 'pause' : 'resume')
                    }
                  />
                  <View style={styles.options}>
                    {(['stop', 'restart'] as const).map((action) => (
                      <Pressable
                        key={action}
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={() => setConfirm(action)}
                        style={[
                          styles.secondary,
                          { backgroundColor: palette.surface },
                        ]}
                      >
                        <AppText variant="label">
                          {action === 'stop' ? 'Finish session' : 'Restart'}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </View>
          </ImageBackground>
          {!session && state.last && (
            <Card>
              <AppText variant="heading">
                {state.last.kind === 'break'
                  ? 'Welcome back'
                  : state.last.outcome === 'completed'
                    ? 'A moment well spent'
                    : 'Every moment counts'}
              </AppText>
              <AppText>
                {formatTime(state.last.actualMs)} of{' '}
                {state.last.kind === 'break' ? 'rest' : 'focus'} saved on this
                device.
              </AppText>
              {state.last.kind === 'focus' && (
                <AppButton
                  label={'Take a ' + state.nextBreakMinutes + ' minute break'}
                  disabled={busy}
                  onPress={() => void focus.command('break')}
                />
              )}
              <AppButton
                label="Done"
                disabled={busy}
                onPress={() => void focus.command('dismiss')}
              />
            </Card>
          )}
          {focus.error && (
            <AppText
              accessibilityRole="alert"
              style={{ color: palette.danger }}
            >
              {focus.error}
            </AppText>
          )}
          {focus.notice && (
            <AppText accessibilityRole="alert">{focus.notice}</AppText>
          )}
          <Card>
            <View style={styles.setting}>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="label">Completion reminder</AppText>
                <AppText style={{ color: palette.textMuted }}>
                  {Platform.OS === 'web'
                    ? 'Available in the mobile app.'
                    : 'A gentle notification when your timer ends.'}
                </AppText>
              </View>
              <Switch
                accessibilityLabel="Completion reminder"
                value={state.reminders}
                disabled={busy || Platform.OS === 'web'}
                onValueChange={() => void focus.toggleReminders()}
                trackColor={{ true: palette.primary }}
              />
            </View>
          </Card>
          <Card>
            <AppText variant="heading">Recent moments</AppText>
            {focus.history.length === 0 ? (
              <AppText style={{ color: palette.textMuted }}>
                Your first session starts a new story.
              </AppText>
            ) : (
              focus.history.slice(0, 5).map((record) => (
                <View
                  key={record.id}
                  style={[styles.history, { borderColor: palette.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <AppText variant="label">
                      {record.kind === 'break'
                        ? 'Rest'
                        : modes.find((item) => item.key === record.mode)?.label}
                    </AppText>
                    <AppText style={{ fontSize: 12, color: palette.textMuted }}>
                      {record.taskTitle ? record.taskTitle + ' · ' : ''}
                      {new Date(record.endedAt).toLocaleDateString()} ·{' '}
                      {record.outcome === 'completed'
                        ? 'Completed'
                        : 'Finished'}
                    </AppText>
                  </View>
                  <AppText>{formatTime(record.actualMs)}</AppText>
                </View>
              ))
            )}
          </Card>
        </>
      )}
      <Modal
        visible={confirm !== null}
        transparent
        animationType={reduce ? 'none' : 'fade'}
        onRequestClose={() => setConfirm(null)}
      >
        <View style={styles.scrim}>
          <View
            accessibilityViewIsModal
            style={[styles.dialog, { backgroundColor: palette.surface }]}
          >
            <AppText variant="heading">
              {confirm === 'restart' ? 'Start fresh?' : 'Finish this moment?'}
            </AppText>
            <AppText>
              Your time so far will be saved.{' '}
              {confirm === 'restart'
                ? 'A new timer will begin.'
                : 'You can return whenever you’re ready.'}
            </AppText>
            <AppButton
              label={
                confirm === 'restart' ? 'Save and restart' : 'Save and finish'
              }
              disabled={busy}
              onPress={() => {
                const action = confirm;
                setConfirm(null);
                if (action) void focus.command(action);
              }}
            />
            <AppButton label="Keep going" onPress={() => setConfirm(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
const styles = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    minHeight: 44,
  },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 48 },
  scene: {
    borderRadius: 30,
    overflow: 'hidden',
    padding: 20,
    alignItems: 'center',
    gap: 24,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: 'center',
  },
  timer: {
    width: 250,
    height: 250,
    maxWidth: '100%',
    borderRadius: 125,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  secondary: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  setting: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  history: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  scrim: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    padding: 24,
    borderRadius: 24,
    gap: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
});
