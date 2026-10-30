import { useCallback, useState } from 'react';
import { ImageBackground, View, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Svg, { Path, Circle, Rect, Ellipse } from 'react-native-svg';
import { Screen } from '@/components/ui/screen';
import { Card, AppText, AppButton } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import { useFocus } from '@/features/focus/provider';
import {
  loadWorld,
  saveValue,
  allSessions,
} from '@/features/journal/repository';
import {
  collection,
  emptyWorld,
  growWorld,
  place,
  type World,
} from '@/features/world/model';
function Plant({ kind }: { kind: string }) {
  return (
    <Svg width={60} height={70} viewBox="0 0 60 70">
      <Ellipse cx={30} cy={64} rx={23} ry={5} fill="#476E4D" opacity={0.25} />
      {kind === 'flowers' ? (
        <>
          <Path d="M18 60V30M40 60V25" stroke="#2F6B4F" strokeWidth={4} />
          <Circle cx={18} cy={30} r={12} fill="#F4C95D" />
          <Circle cx={40} cy={24} r={10} fill="#D99589" />
          <Circle cx={18} cy={30} r={4} fill="#785400" />
        </>
      ) : (
        <>
          <Rect x={26} y={40} width={8} height={23} rx={3} fill="#78543C" />
          {kind === 'pine' ? (
            <Path d="M30 4L6 47H54Z" fill="#2F6B4F" />
          ) : (
            <>
              <Circle cx={30} cy={25} r={22} fill="#2F6B4F" />
              <Circle cx={19} cy={30} r={15} fill="#59875D" />
              <Circle cx={35} cy={18} r={13} fill="#78A676" />
            </>
          )}
        </>
      )}
    </Svg>
  );
}
export default function WorldScreen() {
  const { palette } = useAppTheme();
  const focus = useFocus();
  const [world, setWorld] = useState<World>(emptyWorld);
  const [selected, setSelected] = useState<string | null>('oak');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [count, setCount] = useState(0);
  useFocusEffect(
    useCallback(() => {
      void revision;
      void focus.history;
      let alive = true;
      Promise.all([loadWorld(), allSessions()])
        .then(async ([saved, rows]) => {
          const done = rows.filter(
            (r) => r.kind === 'focus' && r.outcome === 'completed',
          );
          const next = growWorld(
            saved,
            done.length,
            done.reduce((n, r) => n + r.actualMs, 0),
            Math.max(0, ...done.map((r) => r.actualMs)),
          );
          if (!alive) return;
          await saveValue('world', next);
          if (alive) {
            setWorld(next);
            setCount(done.length);
            setReady(true);
            setError('');
          }
        })
        .catch(() => {
          if (alive) setError('Your garden could not be opened. Please retry.');
        });
      return () => {
        alive = false;
      };
    }, [revision, focus.history]),
  );
  const plant = async (index: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const next = place(world, index, selected);
      await saveValue('world', next);
      setWorld(next);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your garden.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      title="Your little world"
      subtitle="Quiet moments leave living roots."
    >
      {!ready ? (
        <Card>
          <AppText>{error || 'Opening your garden…'}</AppText>
          <AppButton label="Retry" onPress={() => setRevision((n) => n + 1)} />
        </Card>
      ) : (
        <>
          <ImageBackground
            source={require('../../../assets/images/forest-glade.jpg')}
            imageStyle={{ opacity: 0.35 }}
            style={{
              backgroundColor: palette.surfaceMuted,
              borderRadius: 28,
              overflow: 'hidden',
              padding: 20,
              gap: 16,
            }}
          >
            <AppText variant="heading">A garden at your pace</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {world.plots.map((item, index) => (
                <Pressable
                  key={index}
                  accessibilityRole="button"
                  accessibilityLabel={
                    'Plot ' +
                    (index + 1) +
                    ', ' +
                    (item || 'empty') +
                    '. Place selected plant.'
                  }
                  disabled={busy}
                  onPress={() => void plant(index)}
                  style={{
                    width: '30%',
                    minHeight: 88,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    borderWidth: 1,
                  }}
                >
                  {item ? <Plant kind={item} /> : <AppText muted>＋</AppText>}
                </Pressable>
              ))}
            </View>
          </ImageBackground>
          <Card>
            <AppText variant="heading">Plant something lovely</AppText>
            <AppText muted>
              Select a plant, then tap a plot. Plants can be placed more than
              once.
            </AppText>
            {collection.map((item) => (
              <View
                key={item.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <Plant kind={item.id} />
                <View style={{ flex: 1, gap: 6 }}>
                  <AppText variant="label">{item.name}</AppText>
                  <AppButton
                    label={
                      world.unlocked.includes(item.id)
                        ? selected === item.id
                          ? '✓ Selected'
                          : 'Choose plant'
                        : item.need +
                          ' completed sessions · ' +
                          Math.min(count, item.need) +
                          '/' +
                          item.need
                    }
                    disabled={!world.unlocked.includes(item.id) || busy}
                    onPress={() => setSelected(item.id)}
                  />
                </View>
              </View>
            ))}
            <AppButton
              label={
                selected === null ? '✓ Clear plot selected' : 'Remove a plant'
              }
              onPress={() => setSelected(null)}
            />
          </Card>
          <Card>
            <AppText variant="heading">Milestones</AppText>
            {world.achievements.length ? (
              world.achievements.map((a) => <AppText key={a}>✦ {a}</AppText>)
            ) : (
              <AppText muted>
                Your first completed focus session plants the first roots.
              </AppText>
            )}
            <AppText muted>
              Earned plants and milestones stay yours, even when you take a
              break.
            </AppText>
          </Card>
          {!!error && <AppText accessibilityRole="alert">{error}</AppText>}
        </>
      )}
    </Screen>
  );
}
