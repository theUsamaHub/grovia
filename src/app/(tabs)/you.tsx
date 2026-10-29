import { ReminderPanel } from '@/features/reminders/panel';
import { RoutinePanel } from '@/features/focus/routine-panel';
import { CategoryPanel } from '@/features/categories/panel';
import { BackupPanel } from '@/features/backup/panel';
import { Breathing } from '@/features/wellbeing/breathing';
import { Ambience } from '@/features/wellbeing/ambience';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { AppText, Card, uiStyles } from '@/components/ui/primitives';
import { useAppTheme } from '@/theme/provider';
import type { ThemePreference } from '@/theme/preference';
import { radii, spacing } from '@/theme';
const choices: {
  value: ThemePreference;
  label: string;
  description: string;
  icon: 'sun' | 'moon' | 'smartphone';
}[] = [
  {
    value: 'system',
    label: 'System',
    description: 'Follow your device',
    icon: 'smartphone',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'A little daylight',
    icon: 'sun',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'An evening calm',
    icon: 'moon',
  },
];
function AppearanceOption({ option }: { option: (typeof choices)[number] }) {
  const { palette, preference, setPreference, saving } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const selected = preference === option.value;
  return (
    <Pressable
      accessibilityRole="radio"
      aria-checked={selected}
      aria-disabled={saving}
      accessibilityState={{ checked: selected, disabled: saving }}
      accessibilityLabel={option.label + ', ' + option.description}
      disabled={saving}
      onPress={() => void setPreference(option.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? palette.surfaceMuted : palette.surface,
          borderColor: selected || focused ? palette.focus : palette.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Feather name={option.icon} size={22} color={palette.primary} />
      <View style={{ flex: 1 }}>
        <AppText>{option.label}</AppText>
        <AppText muted style={{ fontSize: 13 }}>
          {option.description}
        </AppText>
      </View>
      <Feather
        name={selected ? 'check-circle' : 'circle'}
        size={22}
        color={selected ? palette.primary : palette.textMuted}
      />
    </Pressable>
  );
}
export default function YouScreen() {
  const { palette, mode, error, saving } = useAppTheme();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: palette.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View
            style={[
              uiStyles.row,
              { justifyContent: 'space-between', flexWrap: 'wrap' },
            ]}
          >
            <View style={uiStyles.row}>
              <Image
                source={require('../../../assets/images/grovia-icon.png')}
                style={styles.logo}
                accessibilityLabel="Grovia tree icon"
              />
              <AppText variant="heading">You</AppText>
            </View>
            <View
              style={[styles.badge, { backgroundColor: palette.surfaceMuted }]}
            >
              <Feather name="feather" color={palette.primary} size={14} />
              <AppText variant="label">YOUR OWN PACE</AppText>
            </View>
          </View>
          <View
            style={[styles.hero, { backgroundColor: palette.surfaceMuted }]}
          >
            <Image
              source={require('../../../assets/images/grovia-adaptive.png')}
              style={styles.tree}
              accessibilityIgnoresInvertColors
              accessible={false}
            />
            <AppText
              variant="label"
              style={{ color: palette.primary, letterSpacing: 2 }}
            >
              FOCUS. GROW. THRIVE.
            </AppText>
            <AppText variant="title" style={{ textAlign: 'center' }}>
              Your space, your pace.
            </AppText>

            <AppText muted style={{ textAlign: 'center', maxWidth: 340 }}>
              A calmer space for your attention. Make it feel like yours.
            </AppText>
          </View>
          <RoutinePanel />
          <ReminderPanel />
          <CategoryPanel />
          <BackupPanel />
          <Breathing />
          <Ambience />
          <Card>
            <View style={uiStyles.row}>
              <View style={{ flex: 1 }}>
                <AppText variant="heading">Your atmosphere</AppText>
                <AppText muted>Find your comfortable light.</AppText>
              </View>
              <Feather
                name={mode === 'dark' ? 'moon' : 'sun'}
                size={24}
                color={palette.primary}
              />
            </View>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Appearance"
              style={{ gap: 10 }}
            >
              {choices.map((option) => (
                <AppearanceOption key={option.value} option={option} />
              ))}
            </View>
            <AppText
              muted
              style={{ fontSize: 13 }}
              accessibilityLiveRegion="polite"
            >
              {saving
                ? 'Saving your preference…'
                : 'Your choice is remembered on this device.'}
            </AppText>
            {error && (
              <AppText
                accessibilityRole="alert"
                style={{ color: palette.danger }}
              >
                {error}
              </AppText>
            )}
          </Card>
          <Card
            style={{ backgroundColor: palette.surfaceMuted, borderWidth: 0 }}
          >
            <View style={uiStyles.row}>
              <Feather name="shield" color={palette.primary} size={22} />
              <AppText variant="heading" style={{ fontSize: 18 }}>
                A space that stays yours
              </AppText>
            </View>
            <AppText muted>
              {Platform.OS === 'web'
                ? 'This browser preview saves appearance in this browser. The mobile app keeps it in an on-device database.'
                : 'Your preferences stay on your device. No account needed, and no connection required.'}
            </AppText>
          </Card>
          <AppText muted style={{ textAlign: 'center', fontSize: 12 }}>
            Small steps. Steady roots.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.lg },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 24,
    paddingBottom: 24,
  },
  logo: { width: 44, height: 44, borderRadius: 14 },
  badge: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  hero: { borderRadius: 32, alignItems: 'center', padding: 24, gap: 12 },
  tree: { width: 120, height: 120 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 2,
  },
});
