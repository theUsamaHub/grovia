import { TrendsPanel } from '@/features/journal/trends-panel';
import { useCallback, useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { AppText, AppButton, Card } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import { useFocus } from '@/features/focus/provider';
import { allSessions, editSession } from '@/features/journal/repository';
import { summarize } from '@/features/journal/model';
import { formatTime, type RecordEntry } from '@/features/focus/engine';
export default function Insights() {
  const { palette } = useAppTheme();
  const focus = useFocus();
  const [rows, setRows] = useState<RecordEntry[]>([]);
  const [days, setDays] = useState(7);
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const [draft, setDraft] = useState<RecordEntry | null>(null);
  const [minutes, setMinutes] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [limit, setLimit] = useState(20);
  useFocusEffect(
    useCallback(() => {
      void revision;
      void focus.history;
      let alive = true;
      allSessions()
        .then((data) => {
          if (alive) {
            setRows(data);
            setReady(true);
            setError('');
          }
        })
        .catch(() => {
          if (alive)
            setError('Your history could not be opened. Please retry.');
        });
      return () => {
        alive = false;
      };
    }, [revision, focus.history]),
  );
  const report = summarize(rows, days, new Date(), category);
  const max = Math.max(60000, ...report.buckets.map((b) => b.ms));
  const categories = [...new Set(rows.map((r) => r.category || 'Personal'))];
  const save = async (remove = false) => {
    if (!draft || busy) return;
    setError('');
    const value = Number(minutes);
    if (
      !remove &&
      (!Number.isFinite(value) || value < 0 || value > draft.plannedMs / 60000)
    ) {
      setError(
        'Minutes must be between zero and the planned session duration.',
      );
      return;
    }
    setBusy(true);
    try {
      await editSession(
        remove ? null : { ...draft, actualMs: Math.round(value * 60000) },
        draft.id,
      );
      setDraft(null);
      setRevision((r) => r + 1);
      focus.retry();
    } catch {
      setError('Your change could not be saved. Try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      title="Your rhythm"
      subtitle="A reflection of the time you chose to give."
    >
      {!ready ? (
        <Card>
          <AppText>{error || 'Opening your history…'}</AppText>
          <AppButton label="Retry" onPress={() => setRevision((r) => r + 1)} />
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {[1, 7, 30].map((n) => (
              <AppButton
                key={n}
                label={
                  (days === n ? '✓ ' : '') + (n === 1 ? 'Today' : n + ' days')
                }
                onPress={() => {
                  setDays(n);
                  setLimit(20);
                }}
              />
            ))}
          </View>
          <Card>
            <AppText variant="title">
              {Math.floor(report.total / 60000)} minutes
            </AppText>
            <AppText muted>
              {report.completed} completed ·{' '}
              {report.sessions.length
                ? Math.round((report.completed / report.sessions.length) * 100)
                : 0}
              % completion rate
            </AppText>
            <AppText muted>
              Recorded focus activity, including early finishes. Breaks are
              excluded.
            </AppText>
            <View
              style={{
                height: 130,
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: days > 7 ? 2 : 8,
              }}
            >
              {report.buckets.map((b) => (
                <View
                  key={b.day}
                  accessibilityLabel={
                    b.day + ': ' + Math.floor(b.ms / 60000) + ' minutes'
                  }
                  style={{
                    flex: 1,
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      height: Math.max(2, (b.ms / max) * 100),
                      backgroundColor: palette.primary,
                      borderRadius: 5,
                    }}
                  />
                  {days <= 7 && (
                    <AppText style={{ fontSize: 10, textAlign: 'center' }}>
                      {b.day.slice(-2)}
                    </AppText>
                  )}
                </View>
              ))}
            </View>
            <AppText muted>
              {report.buckets[0].day} — {report.buckets.at(-1)?.day}
            </AppText>
          </Card>
          <Card>
            <AppText variant="heading">Focus by category</AppText>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {['All', ...categories].map((c) => (
                <AppButton
                  key={c}
                  label={(category === c ? '✓ ' : '') + c}
                  onPress={() => setCategory(c)}
                />
              ))}
            </View>
            {Object.entries(report.categories).map(([c, ms]) => (
              <AppText key={c}>
                {c} · {Math.floor(ms / 60000)} min
              </AppText>
            ))}
          </Card>
          <TrendsPanel rows={rows} />
          <Card>
            <AppText variant="heading">Session journal</AppText>
            {report.sessions.length === 0 && (
              <AppText muted>No focus sessions in this view yet.</AppText>
            )}
            {report.sessions.slice(0, limit).map((row) => (
              <View
                key={row.id}
                style={{
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderColor: palette.border,
                  gap: 6,
                }}
              >
                <AppText variant="label">
                  {row.taskTitle || row.category || 'A quiet moment'}
                </AppText>
                <AppText>
                  {formatTime(row.actualMs)} ·{' '}
                  {row.outcome === 'completed' ? 'Completed' : 'Finished early'}
                </AppText>
                <AppText muted>
                  {new Date(row.endedAt).toLocaleString()}
                </AppText>
                {!!row.notes && <AppText>{row.notes}</AppText>}
                <AppButton
                  label="Edit / delete entry"
                  disabled={!!focus.state.active}
                  onPress={() => {
                    setDraft(row);
                    setMinutes(String(Math.round(row.actualMs / 600) / 100));
                    setDeleting(false);
                    setError('');
                  }}
                />
              </View>
            ))}
            {report.sessions.length > limit && (
              <AppButton
                label="Show more"
                onPress={() => setLimit((n) => n + 20)}
              />
            )}{' '}
            {!!focus.state.active && (
              <AppText muted>
                Finish your active session before correcting history.
              </AppText>
            )}
          </Card>
        </>
      )}
      <Modal
        visible={!!draft}
        transparent
        animationType="none"
        onRequestClose={() => {
          if (!busy) setDraft(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: '#00000080',
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: '90%' }}
          >
            <Card>
              <AppText variant="heading">
                {deleting ? 'Delete this entry?' : 'Correct your record'}
              </AppText>
              {deleting ? (
                <AppText>
                  This removes the session from your history and statistics.
                  Earned plants remain yours.
                </AppText>
              ) : (
                <>
                  <AppText>Focus minutes</AppText>
                  <TextInput
                    accessibilityLabel="Corrected focus minutes"
                    keyboardType="decimal-pad"
                    value={minutes}
                    onChangeText={setMinutes}
                    style={{
                      color: palette.text,
                      borderColor: palette.border,
                      borderWidth: 1,
                      padding: 12,
                      borderRadius: 12,
                    }}
                  />
                  <AppText>Category</AppText>
                  <TextInput
                    accessibilityLabel="Session category"
                    maxLength={60}
                    value={draft?.category ?? ''}
                    onChangeText={(category) =>
                      draft && setDraft({ ...draft, category })
                    }
                    style={{
                      color: palette.text,
                      borderColor: palette.border,
                      borderWidth: 1,
                      padding: 12,
                      borderRadius: 12,
                    }}
                  />
                  <AppText>Notes</AppText>
                  <TextInput
                    accessibilityLabel="Session notes"
                    multiline
                    maxLength={2000}
                    value={draft?.notes ?? ''}
                    onChangeText={(notes) =>
                      draft && setDraft({ ...draft, notes })
                    }
                    style={{
                      color: palette.text,
                      borderColor: palette.border,
                      borderWidth: 1,
                      padding: 12,
                      borderRadius: 12,
                    }}
                  />
                </>
              )}
              {!!error && <AppText accessibilityRole="alert">{error}</AppText>}
              <AppButton
                label={deleting ? 'Confirm deletion' : 'Save correction'}
                disabled={busy}
                onPress={() => void save(deleting)}
              />
              {!deleting && (
                <AppButton
                  label="Delete entry"
                  disabled={busy}
                  onPress={() => setDeleting(true)}
                />
              )}
              <AppButton
                label="Cancel"
                disabled={busy}
                onPress={() => setDraft(null)}
              />
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}
