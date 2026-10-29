import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';
import { AppText, AppButton, Card } from '@/components/ui/primitives';
const tracks = [
  { name: 'Rain texture', source: require('../../../assets/audio/rain.wav') },
  { name: 'Soft wind', source: require('../../../assets/audio/wind.wav') },
  { name: 'Ocean texture', source: require('../../../assets/audio/ocean.wav') },
];
export function Ambience() {
  const [track, setTrack] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const [error, setError] = useState('');
  const player = useAudioPlayer(tracks[track].source);
  const status = useAudioPlayerStatus(player);
  // Expo Audio exposes imperative native setters; this object is not React state.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    player.loop = true;
    player.volume = volume;
  }, [player, volume]);
  /* eslint-enable react-hooks/immutability */
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') player.pause();
    });
    return () => listener.remove();
  }, [player]);
  const toggle = async () => {
    try {
      if (status.playing) player.pause();
      else {
        await setAudioModeAsync({
          playsInSilentMode: false,
          shouldPlayInBackground: false,
          interruptionMode: 'doNotMix',
        });
        player.play();
      }
      setError('');
    } catch {
      setError(
        'Audio could not start. Try again or check your device sound settings.',
      );
    }
  };
  return (
    <Card>
      <AppText variant="heading">A softer background</AppText>
      <AppText muted>
        Original sound textures. Audio pauses when the app leaves the foreground
        and respects silent mode.
      </AppText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {tracks.map((t, i) => (
          <AppButton
            key={t.name}
            label={(track === i ? '✓ ' : '') + t.name}
            onPress={() => {
              player.pause();
              setTrack(i);
            }}
          />
        ))}
      </View>
      <AppButton
        label={status.playing ? 'Pause ambience' : 'Play ambience'}
        onPress={() => void toggle()}
      />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <AppButton
          label="Quieter"
          disabled={volume === 0}
          onPress={() =>
            setVolume((v) => Math.max(0, Math.round((v - 0.1) * 10) / 10))
          }
        />
        <AppText>{Math.round(volume * 100)}%</AppText>
        <AppButton
          label="Louder"
          disabled={volume === 1}
          onPress={() =>
            setVolume((v) => Math.min(1, Math.round((v + 0.1) * 10) / 10))
          }
        />
      </View>
      <AppButton label="Mute" onPress={() => setVolume(0)} />
      {!!error && <AppText accessibilityRole="alert">{error}</AppText>}
    </Card>
  );
}
