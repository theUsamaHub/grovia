import { useCallback, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AppText, AppButton, Card } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import { useFocus } from '../focus/provider';
import { readValue, saveValue, allSessions } from '../journal/repository';
import { loadPlanner } from '../tasks/repository';
import { localDay } from '../tasks/model';
import { goalStats, validGoal, type Goal } from './model';
import type { RecordEntry } from '../focus/engine';
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function GoalPanel() {
  const { palette } = useAppTheme();
  const focus = useFocus();
  const [policies, setPolicies] = useState<Goal[]>([]);
  const [rows, setRows] = useState<RecordEntry[]>([]);
  const [type, setType] = useState<Goal['type']>('minutes');
  const [target, setTarget] = useState('60');
  const [restDays, setRestDays] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void revision;
      void focus.history;
      Promise.all([
        readValue<Goal[]>('goals', []),
        allSessions(),
        loadPlanner(),
      ])
        .then(([saved, history, planner]) => {
          if (!alive) return;
          const current = saved.at(-1) ?? {
            from: localDay(),
            type: 'minutes' as const,
            target: planner.goalMinutes,
            restDays: [],
          };
          setPolicies(saved.length ? saved : [current]);
          setRows(history);
          setType(current.type);
          setTarget(String(current.target));
          setRestDays(current.restDays);
        })
        .catch(() => {
          if (alive)
            setMessage('Could not load your goals. Retry to continue.');
        });
      return () => {
        alive = false;
      };
    }, [focus.history, revision]),
  );
  const stats = goalStats(rows, policies);
  const active = policies.at(-1);
  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      const next = validGoal({
        from: localDay(),
        type,
        target: Number(target),
        restDays,
      });
      const updated = [...policies.filter((g) => g.from < next.from), next];
      await saveValue('goals', updated);
      setPolicies(updated);
      setMessage(
        'Saved. Changes apply from today; earlier goals stay unchanged.',
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <AppText variant="heading">Your gentle goal</AppText>
      {active ? (
        <>
          <AppText>
            {Math.floor(stats.todayValue)} / {stats.todayTarget} {active.type}{' '}
            today{stats.todayRest ? ' · Rest day' : ''}
          </AppText>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: stats.todayTarget,
              now: Math.min(stats.todayValue, stats.todayTarget),
            }}
            style={{
              height: 8,
              backgroundColor: palette.surfaceMuted,
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 8,
                width:
                  Math.min(100, (stats.todayValue / stats.todayTarget) * 100) +
                  '%',
                backgroundColor: palette.primary,
              }}
            />
          </View>
          <AppText>
            {stats.streak} goal-day streak · Best {stats.best} ·{' '}
            {stats.achieved} goals met
          </AppText>
          <AppText muted>
            Rest days preserve your streak. An unfinished day only breaks it
            after midnight. Tracking begins when you save your first goal.
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['minutes', 'sessions'] as const).map((t) => (
              <AppButton
                key={t}
                label={(type === t ? '✓ ' : '') + t}
                onPress={() => {
                  setType(t);
                  setTarget(t === 'minutes' ? '60' : '3');
                }}
              />
            ))}
          </View>
          <TextInput
            accessibilityLabel="Daily goal target"
            keyboardType="number-pad"
            value={target}
            onChangeText={setTarget}
            maxLength={4}
            style={{
              color: palette.text,
              borderColor: palette.border,
              borderWidth: 1,
              padding: 12,
              borderRadius: 12,
            }}
          />
          <AppText>Weekly rest days</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {weekdays.map((d, i) => (
              <AppButton
                key={d}
                label={(restDays.includes(i) ? '✓ ' : '') + d}
                onPress={() =>
                  setRestDays((v) =>
                    v.includes(i) ? v.filter((x) => x !== i) : [...v, i],
                  )
                }
              />
            ))}
          </View>
          <AppButton
            label="Save goal and rest days"
            disabled={busy}
            onPress={() => void save()}
          />
        </>
      ) : (
        <AppButton
          label="Retry loading goals"
          onPress={() => setRevision((n) => n + 1)}
        />
      )}
      {!!message && <AppText accessibilityRole="alert">{message}</AppText>}
    </Card>
  );
}
