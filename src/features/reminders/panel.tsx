import { useCallback, useRef, useState } from 'react';
import { Switch, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AppText, AppButton, Card } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import { readValue, saveValue } from '../journal/repository';
import { defaultReminder, validateReminder, type Reminder } from './model';
import { applySchedule, supported } from './schedule';
const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function ReminderPanel() {
  const { palette } = useAppTheme();
  const [value, setValue] = useState(defaultReminder);
  const [time, setTime] = useState('09:00');
  const saved = useRef(defaultReminder);
  const lock = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void revision;
      readValue<Reminder>('schedule', defaultReminder)
        .then((v) => {
          if (alive) {
            saved.current = v;
            setValue(v);
            setTime(
              String(v.hour).padStart(2, '0') +
                ':' +
                String(v.minute).padStart(2, '0'),
            );
            setReady(true);
          }
        })
        .catch(() => {
          if (alive) setMessage('Could not load reminders. Retry.');
        });
      return () => {
        alive = false;
      };
    }, [revision]),
  );
  async function save() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    let changed = false;
    try {
      if (!/^\d{2}:\d{2}$/.test(time))
        throw Error('Use 24-hour time, for example 09:30.');
      const [hour, minute] = time.split(':').map(Number);
      const next = validateReminder({ ...value, hour, minute });
      changed = true;
      await applySchedule(next, true);
      await saveValue('schedule', next);
      saved.current = next;
      setValue(next);
      setMessage(
        next.enabled
          ? 'Weekly reminders saved. Delivery follows your device settings.'
          : 'Reminders turned off.',
      );
    } catch (e) {
      let rollback = '';
      if (changed) {
        try {
          await applySchedule(saved.current);
        } catch {
          rollback =
            ' Could not restore the previous schedule. Turn reminders off and save to clear it.';
        }
      }
      setMessage(
        (e instanceof Error ? e.message : 'Could not save reminders.') +
          rollback,
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (!supported)
    return (
      <Card>
        <AppText variant="heading">Gentle reminders</AppText>
        <AppText muted>
          Choose a weekly reminder schedule in the Android or iOS app. Browser
          reminders are unavailable.
        </AppText>
      </Card>
    );
  return (
    <Card>
      <AppText variant="heading">Gentle reminders</AppText>
      <AppText muted>
        A local reminder at your chosen time on selected weekdays.
      </AppText>
      {ready ? (
        <>
          <Switch
            accessibilityLabel="Enable scheduled reminders"
            value={value.enabled}
            disabled={busy}
            onValueChange={(enabled) => setValue({ ...value, enabled })}
          />
          <TextInput
            accessibilityLabel="Reminder time in 24-hour HH:mm format"
            value={time}
            onChangeText={setTime}
            editable={!busy}
            maxLength={5}
            style={{
              color: palette.text,
              borderColor: palette.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {names.map((name, i) => (
              <AppButton
                key={name}
                label={(value.days.includes(i) ? '✓ ' : '') + name}
                disabled={busy}
                onPress={() =>
                  setValue((v) => ({
                    ...v,
                    days: v.days.includes(i)
                      ? v.days.filter((d) => d !== i)
                      : [...v.days, i],
                  }))
                }
              />
            ))}
          </View>
          <AppButton
            label="Save reminder schedule"
            disabled={busy}
            onPress={() => void save()}
          />
        </>
      ) : (
        <AppButton label="Retry" onPress={() => setRevision((n) => n + 1)} />
      )}
      {!!message && <AppText accessibilityRole="alert">{message}</AppText>}
    </Card>
  );
}
