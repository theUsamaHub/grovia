import { useState } from 'react';
import { View } from 'react-native';
import { AppText, AppButton, Card } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import type { RecordEntry } from '../focus/engine';
import { trends, weeklySummary } from './model';
import { shareBackup } from '../backup/files';
export function TrendsPanel({ rows }: { rows: RecordEntry[] }) {
  const { palette } = useAppTheme();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const data = trends(rows);
  const max = Math.max(60000, ...data.months.map((b) => b.ms));
  const delta = Math.floor((data.current.total - data.previous.total) / 60000);
  async function share() {
    setBusy(true);
    try {
      await shareBackup(weeklySummary(rows), 'summary');
      setMessage('Summary ready to save.');
    } catch {
      setMessage('Could not export the summary. Try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Card>
        <AppText variant="heading">Your weekly reflection</AppText>
        <AppText>
          {Math.floor(data.current.total / 60000)} minutes in the last 7 days
        </AppText>
        <AppText muted>
          {delta === 0
            ? 'The same recorded time as the previous 7 days.'
            : Math.abs(delta) +
              ' minutes ' +
              (delta > 0 ? 'more' : 'less') +
              ' than the previous 7 days.'}
        </AppText>
        <AppText>
          {data.current.completed} completed sessions ·{' '}
          {data.current.buckets.filter((b) => b.ms > 0).length} active days
        </AppText>
        <AppButton
          label="Export weekly summary"
          disabled={busy}
          onPress={() => void share()}
        />
        {!!message && <AppText accessibilityRole="alert">{message}</AppText>}
      </Card>
      <Card>
        <AppText variant="heading">A year of small steps</AppText>
        <AppText muted>
          Last 365 days, grouped by calendar month. The first and last months
          may be partial.
        </AppText>
        {data.months.map((b) => (
          <View key={b.month} style={{ gap: 4 }}>
            <AppText>
              {b.month} · {Math.floor(b.ms / 60000)} min
            </AppText>
            <View
              style={{
                height: 8,
                backgroundColor: palette.surfaceMuted,
                borderRadius: 4,
              }}
            >
              <View
                style={{
                  height: 8,
                  width: (b.ms / max) * 100 + '%',
                  backgroundColor: palette.primary,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        ))}
        <AppText>
          Best day:{' '}
          {data.bestDay.ms
            ? data.bestDay.day +
              ' · ' +
              Math.floor(data.bestDay.ms / 60000) +
              ' min'
            : 'Your first day is ahead'}
        </AppText>
        <AppText>
          Most active finishing hour:{' '}
          {data.peakHour === null
            ? 'No sessions yet'
            : String(data.peakHour).padStart(2, '0') +
              ':00–' +
              String(data.peakHour).padStart(2, '0') +
              ':59'}
        </AppText>
        <AppText muted>
          Sessions are attributed to the local time they ended, including early
          finishes.
        </AppText>
      </Card>
      <Card>
        <AppText variant="heading">Your activity garden</AppText>
        <AppText muted>
          Last 91 days · chronological from left to right. Darker cells mean
          more recorded minutes; empty days are welcome too.
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          {data.year.buckets.slice(-91).map((b) => (
            <View
              accessible
              key={b.day}
              accessibilityLabel={
                b.day + ': ' + Math.floor(b.ms / 60000) + ' minutes'
              }
              style={{
                width: 24,
                height: 24,
                borderRadius: 5,
                backgroundColor: b.ms ? palette.primary : palette.surfaceMuted,
                opacity: b.ms ? 0.35 + 0.65 * Math.min(1, b.ms / 3600000) : 1,
              }}
            />
          ))}
        </View>
        <AppText muted>
          {data.year.buckets.at(-91)?.day} — {data.year.buckets.at(-1)?.day}
        </AppText>
      </Card>
    </>
  );
}
