import { useCallback, useState } from 'react';
import { View, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, AppText, AppButton } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import { readValue, saveValue } from '../journal/repository';
export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  archived: boolean;
};
export const defaults: Category[] = [
  'Study',
  'Coding',
  'Reading',
  'Work',
  'Personal',
].map((name, i) => ({
  id: String(i),
  name,
  color: ['#2F6B4F', '#785400', '#A33232', '#58675C', '#4769A1'][i],
  icon: ['◆', '⌘', '▣', '◇', '○'][i],
  archived: false,
}));
export function CategoryPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [items, setItems] = useState(defaults);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      readValue('categories', defaults)
        .then((data) => {
          if (alive) setItems(data);
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }, []),
  );
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="label">Category · {value || 'Personal'}</AppText>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {items
          .filter((c) => !c.archived)
          .map((c) => (
            <AppButton
              key={c.id}
              label={(value === c.name ? '✓ ' : '') + c.icon + ' ' + c.name}
              disabled={disabled}
              onPress={() => onChange(c.name)}
            />
          ))}
      </View>
    </View>
  );
}
export function CategoryPanel() {
  const { palette } = useAppTheme();
  const [items, setItems] = useState(defaults);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [color, setColor] = useState('#2F6B4F');
  const [icon, setIcon] = useState('◆');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      readValue('categories', defaults)
        .then((data) => {
          if (alive) {
            setItems(data);
            setReady(true);
          }
        })
        .catch(() => {
          if (alive)
            setError(
              'Categories could not be opened. Reopen this page to retry.',
            );
        });
      return () => {
        alive = false;
      };
    }, []),
  );
  const save = async (next: Category[]) => {
    if (busy) return;
    setBusy(true);
    try {
      await saveValue('categories', next);
      setItems(next);
      setName('');
      setEditing(null);
      setError('');
    } catch {
      setError('Categories could not be saved. Try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <AppText variant="heading">Your categories</AppText>
      <AppText muted>
        Renaming or archiving a category keeps historical session labels intact.
      </AppText>
      {items.map((c) => (
        <View
          key={c.id}
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: c.color,
            }}
          />
          <AppText>
            {c.icon} {c.name}
            {c.archived ? ' · archived' : ''}
          </AppText>
          <AppButton
            label="Rename"
            disabled={busy || !ready}
            onPress={() => {
              setEditing(c.id);
              setName(c.name);
              setColor(c.color);
              setIcon(c.icon);
            }}
          />
          <AppButton
            label={c.archived ? 'Restore' : 'Archive'}
            disabled={busy || !ready}
            onPress={() =>
              void save(
                items.map((i) =>
                  i.id === c.id ? { ...i, archived: !i.archived } : i,
                ),
              )
            }
          />
        </View>
      ))}
      <TextInput
        accessibilityLabel="Category name"
        placeholder="New category"
        placeholderTextColor={palette.textMuted}
        value={name}
        onChangeText={setName}
        maxLength={60}
        style={{
          padding: 12,
          minHeight: 48,
          borderWidth: 1,
          borderColor: palette.border,
          color: palette.text,
          borderRadius: 12,
        }}
      />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {['#2F6B4F', '#785400', '#A33232', '#4769A1'].map((c) => (
          <AppButton
            key={c}
            label={
              (color === c ? '✓ ' : '') +
              {
                '#2F6B4F': 'Forest',
                '#785400': 'Gold',
                '#A33232': 'Rose',
                '#4769A1': 'Blue',
              }[c]
            }
            onPress={() => setColor(c)}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['◆', '○', '◇', '▣'].map((i) => (
          <AppButton
            key={i}
            label={(icon === i ? '✓ ' : '') + i}
            onPress={() => setIcon(i)}
          />
        ))}
      </View>
      <AppButton
        label={editing ? 'Save category' : 'Add category'}
        disabled={busy || !ready}
        onPress={() => {
          const title = name.trim();
          if (!title) {
            setError('Enter a category name.');
            return;
          }
          if (
            items.some(
              (c) =>
                c.id !== editing &&
                c.name.toLowerCase() === title.toLowerCase(),
            )
          ) {
            setError('That category already exists.');
            return;
          }
          void save(
            editing
              ? items.map((c) =>
                  c.id === editing ? { ...c, name: title, color, icon } : c,
                )
              : [
                  ...items,
                  {
                    id: Date.now().toString(36),
                    name: title,
                    color,
                    icon,
                    archived: false,
                  },
                ],
          );
        }}
      />
      {!!editing && (
        <AppButton
          label="Cancel editing"
          onPress={() => {
            setEditing(null);
            setName('');
          }}
        />
      )}
      {!!error && <AppText accessibilityRole="alert">{error}</AppText>}
    </Card>
  );
}
