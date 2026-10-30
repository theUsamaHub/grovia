import { useEffect, useState } from 'react';
import { Switch, TextInput, View } from 'react-native';
import { Card, AppText, AppButton } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import { readValue, saveValue } from '../journal/repository';
export function RoutinePanel() {
  const { palette } = useAppTheme();
  const [auto, setAuto] = useState(false);
  const [cycles, setCycles] = useState('4');
  const [rest, setRest] = useState('15');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let alive = true;
    readValue('routine', {
      autoAdvance: false,
      cycles: 4,
      longBreakMinutes: 15,
    })
      .then((value) => {
        if (alive) {
          setAuto(value.autoAdvance);
          setCycles(String(value.cycles));
          setRest(String(value.longBreakMinutes));
          setReady(true);
        }
      })
      .catch(() => {
        if (alive)
          setMessage(
            'Routine preferences could not be opened. Reopen the app to retry.',
          );
      });
    return () => {
      alive = false;
    };
  }, []);
  const save = async () => {
    const n = Number(cycles),
      minutes = Number(rest);
    if (
      !Number.isInteger(n) ||
      n < 1 ||
      n > 8 ||
      !Number.isInteger(minutes) ||
      minutes < 1 ||
      minutes > 60
    ) {
      setMessage('Choose 1–8 cycles and a 1–60 minute long break.');
      return;
    }
    setBusy(true);
    try {
      await saveValue('routine', {
        autoAdvance: auto,
        cycles: n,
        longBreakMinutes: minutes,
      });
      setMessage('Saved for the next focus routine.');
    } catch {
      setMessage('Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <AppText variant="heading">Your focus routine</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <AppText style={{ flex: 1 }}>
          Auto-start the next focus or break
        </AppText>
        <Switch
          accessibilityLabel="Auto-start next timer"
          value={auto}
          onValueChange={setAuto}
          disabled={!ready || busy}
        />
      </View>
      <AppText muted>
        Automatic transitions happen while the app is open. After a late return
        or restart, the completed timer waits for you. Stopwatch sessions stay
        manual.
      </AppText>
      {[
        {
          label: 'Focus cycles before a long break (1–8)',
          value: cycles,
          set: setCycles,
        },
        { label: 'Long break minutes (1–60)', value: rest, set: setRest },
      ].map((f) => (
        <View key={f.label} style={{ gap: 6 }}>
          <AppText variant="label">{f.label}</AppText>
          <TextInput
            accessibilityLabel={f.label}
            keyboardType="number-pad"
            maxLength={2}
            value={f.value}
            onChangeText={f.set}
            style={{
              minHeight: 48,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.border,
              color: palette.text,
            }}
          />
        </View>
      ))}
      <AppButton
        label="Save routine"
        disabled={!ready || busy}
        onPress={() => void save()}
      />
      {!!message && <AppText accessibilityRole="alert">{message}</AppText>}
    </Card>
  );
}
