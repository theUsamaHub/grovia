import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';
import { AppText, AppButton, Card } from '@/components/ui/primitives';
import { readValue, saveValue } from '../journal/repository';
const tracks = ['Rain texture', 'Soft wind', 'Ocean texture'];
type Mix = {
  enabled: boolean[];
  volumes: number[];
  master: number;
  muted: boolean;
};
const defaults: Mix = {
  enabled: [true, false, false],
  volumes: [0.4, 0.4, 0.4],
  master: 0.5,
  muted: false,
};
export function Ambience() {
  const rain = useAudioPlayer(require('../../../assets/audio/rain.wav'));
  const wind = useAudioPlayer(require('../../../assets/audio/wind.wav'));
  const ocean = useAudioPlayer(require('../../../assets/audio/ocean.wav'));
  const players = useMemo(() => [rain, wind, ocean], [rain, wind, ocean]);
  const rainStatus = useAudioPlayerStatus(rain),
    windStatus = useAudioPlayerStatus(wind),
    oceanStatus = useAudioPlayerStatus(ocean);
  const playing =
    rainStatus.playing || windStatus.playing || oceanStatus.playing;
  const [mix, setMix] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    let alive = true;
    readValue<Mix>('ambience', defaults)
      .then((value) => {
        if (alive) {
          setMix(value);
          setReady(true);
        }
      })
      .catch(() => {
        if (alive) {
          setReady(true);
          setMessage('Saved mix could not load. Default levels are available.');
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  // Expo players expose imperative native setters rather than React state.
  useEffect(() => {
    players.forEach((player, i) => {
      player.loop = true;
      player.volume = mix.muted ? 0 : mix.master * mix.volumes[i];
      if (!mix.enabled[i]) player.pause();
    });
  }, [players, mix]);
  useEffect(() => {
    const invalidate = () => {
      generation.current++;
    };
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        generation.current++;
        players.forEach((p) => p.pause());
      }
    });
    return () => {
      invalidate();
      sub.remove();
      players.forEach((p) => p.pause());
    };
  }, [players]);
  async function toggle() {
    if (lock.current) return;
    if (playing) {
      generation.current++;
      players.forEach((p) => p.pause());
      return;
    }
    lock.current = true;
    setBusy(true);
    const token = ++generation.current;
    try {
      await setAudioModeAsync({
        playsInSilentMode: false,
        shouldPlayInBackground: false,
        interruptionMode: 'doNotMix',
      });
      if (
        token === generation.current &&
        (AppState.currentState === 'active' || AppState.currentState === null)
      )
        players.forEach((player, i) => {
          if (mix.enabled[i]) player.play();
        });
      setMessage('');
    } catch {
      setMessage(
        'Audio could not start. Check your device sound settings and retry.',
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    try {
      await saveValue('ambience', mix);
      setMessage('Mix saved. Playback always starts manually.');
    } catch {
      setMessage('Could not save this mix. Try again.');
    } finally {
      setBusy(false);
    }
  }
  const change = (value: number, delta: number) =>
    Math.max(0, Math.min(1, Math.round((value + delta) * 10) / 10));
  return (
    <Card>
      <AppText variant="heading">Your soundscape</AppText>
      <AppText muted>
        Blend original rain, wind and ocean textures. Select layers, then play
        the mix. Audio pauses in the background and respects silent mode.
      </AppText>
      {tracks.map((name, i) => (
        <View key={name} style={{ gap: 8 }}>
          <AppButton
            label={(mix.enabled[i] ? '✓ ' : '') + name}
            disabled={!ready || busy}
            onPress={() =>
              setMix((v) => ({
                ...v,
                enabled: v.enabled.map((b, j) => (j === i ? !b : b)),
              }))
            }
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <AppButton
              label={'Quieter ' + name}
              disabled={!ready || mix.volumes[i] === 0}
              onPress={() =>
                setMix((v) => ({
                  ...v,
                  volumes: v.volumes.map((n, j) =>
                    j === i ? change(n, -0.1) : n,
                  ),
                }))
              }
            />
            <AppText>{Math.round(mix.volumes[i] * 100)}%</AppText>
            <AppButton
              label={'Louder ' + name}
              disabled={!ready || mix.volumes[i] === 1}
              onPress={() =>
                setMix((v) => ({
                  ...v,
                  volumes: v.volumes.map((n, j) =>
                    j === i ? change(n, 0.1) : n,
                  ),
                }))
              }
            />
          </View>
        </View>
      ))}
      <AppText>Master volume · {Math.round(mix.master * 100)}%</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <AppButton
          label="Lower master"
          disabled={!ready || mix.master === 0}
          onPress={() =>
            setMix((v) => ({ ...v, master: change(v.master, -0.1) }))
          }
        />
        <AppButton
          label="Raise master"
          disabled={!ready || mix.master === 1}
          onPress={() =>
            setMix((v) => ({ ...v, master: change(v.master, 0.1) }))
          }
        />
        <AppButton
          label={mix.muted ? 'Unmute mix' : 'Mute mix'}
          disabled={!ready}
          onPress={() => setMix((v) => ({ ...v, muted: !v.muted }))}
        />
      </View>
      <AppButton
        label={playing ? 'Pause all sounds' : 'Play selected sounds'}
        disabled={!ready || busy || !mix.enabled.some(Boolean)}
        onPress={() => void toggle()}
      />
      <AppButton
        label="Save mix"
        disabled={!ready || busy}
        onPress={() => void save()}
      />
      {!!message && <AppText accessibilityRole="alert">{message}</AppText>}
    </Card>
  );
}
