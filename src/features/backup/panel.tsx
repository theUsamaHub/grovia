import { useState } from 'react';
import { Modal, View } from 'react-native';
import { Card, AppText, AppButton } from '@/components/ui/primitives';
import { useFocus } from '../focus/provider';
import { exportBackup, importBackup } from './repository';
import { parseBackup, type Backup } from './schema';
import { shareBackup, chooseBackup } from './files';
export function BackupPanel() {
  const focus = useFocus();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<Backup | null>(null);
  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : 'Could not complete the backup operation.',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <AppText variant="heading">Keep a copy of your roots</AppText>
      <AppText muted>
        Your data lives on this device. Uninstalling the app or losing the
        device may lose it. Save a JSON backup somewhere safe.
      </AppText>
      <AppButton
        label="Export backup"
        disabled={busy || !focus.ready || focus.busy || !!focus.state.active}
        onPress={() =>
          void run(async () => {
            await shareBackup(JSON.stringify(await exportBackup(), null, 2));
            setMessage('Backup prepared. Keep the saved file in a safe place.');
          })
        }
      />
      <AppButton
        label="Import backup"
        disabled={busy || !!focus.state.active}
        onPress={() =>
          void run(async () => {
            const text = await chooseBackup();
            if (text) setPreview(parseBackup(text));
          })
        }
      />
      {!!focus.state.active && (
        <AppText muted>
          Finish your timer before backing up or importing.
        </AppText>
      )}
      {!!message && <AppText accessibilityRole="alert">{message}</AppText>}
      <Modal
        visible={!!preview}
        transparent
        onRequestClose={() => {
          if (!busy) setPreview(null);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: '#00000080',
          }}
        >
          <Card>
            <AppText variant="heading">Merge this backup?</AppText>
            <AppText>
              {preview?.planner.tasks.length} tasks · {preview?.sessions.length}{' '}
              sessions
            </AppText>
            <AppText>
              New tasks, sessions, plants and achievements will be added.
              Existing entries with the same ID, your garden layout, daily goal
              and appearance are kept. The active timer is never imported.
            </AppText>
            <AppButton
              label="Merge backup"
              disabled={busy}
              onPress={() =>
                void run(async () => {
                  if (preview) await importBackup(preview);
                  setPreview(null);
                  focus.retry();
                  setMessage(
                    'Backup merged. Your existing entries were preserved.',
                  );
                })
              }
            />
            <AppButton
              label="Cancel"
              disabled={busy}
              onPress={() => setPreview(null)}
            />
            {!!message && (
              <AppText accessibilityRole="alert">{message}</AppText>
            )}
          </Card>
        </View>
      </Modal>
    </Card>
  );
}
