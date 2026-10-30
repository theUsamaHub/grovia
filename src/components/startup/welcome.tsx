import { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import { Card, AppText, AppButton } from '@/components/ui/primitives';
import { readValue, saveValue } from '@/features/journal/repository';
const pages = [
  {
    title: 'A little focus. A little growth.',
    text: 'Choose one intention, start a timer, and make room for what matters.',
  },
  {
    title: 'Your quiet moments take root',
    text: 'Completed sessions unlock plants for your own little garden. Taking a break never takes them away.',
  },
  {
    title: 'A space that stays yours',
    text: 'No account or internet connection needed. Your data stays on this device. Use backups in You to keep a copy.',
  },
];
export function Welcome() {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    readValue('welcome', false)
      .then((seen) => {
        if (alive) setVisible(!seen);
      })
      .catch(() => {
        if (alive) setVisible(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  const finish = async () => {
    try {
      await saveValue('welcome', true);
      setVisible(false);
    } catch {
      setError(
        'We could not save this preference. You can still close this introduction.',
      );
    }
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => setVisible(false)}
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
          <AppText muted>{page + 1} / 3</AppText>
          <AppText variant="title">{pages[page].title}</AppText>
          <AppText>{pages[page].text}</AppText>
          <AppButton
            label={page === 2 ? 'Start growing' : 'Next'}
            onPress={() => (page === 2 ? void finish() : setPage((p) => p + 1))}
          />
          <AppButton label="Skip introduction" onPress={() => void finish()} />
          {!!error && (
            <>
              <AppText accessibilityRole="alert">{error}</AppText>
              <AppButton label="Close" onPress={() => setVisible(false)} />
            </>
          )}
        </Card>
      </View>
    </Modal>
  );
}
