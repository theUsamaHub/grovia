import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextProps,
  type ViewProps,
} from 'react-native';
import { useAppTheme } from '@/theme/provider';
import { typography, radii, spacing } from '@/theme';
export function AppText({
  variant = 'body',
  muted = false,
  style,
  ...props
}: TextProps & {
  variant?: 'body' | 'label' | 'heading' | 'title';
  muted?: boolean;
}) {
  const { palette } = useAppTheme();
  const variants = {
    body: { fontFamily: typography.fonts.body, fontSize: 16, lineHeight: 25 },
    label: {
      fontFamily: typography.fonts.bodyBold,
      fontSize: 12,
      lineHeight: 19,
    },
    heading: {
      fontFamily: typography.fonts.headingMedium,
      fontSize: 22,
      lineHeight: 29,
    },
    title: {
      fontFamily: typography.fonts.heading,
      fontSize: 36,
      lineHeight: 43,
    },
  };
  return (
    <Text
      {...props}
      style={[
        variants[variant],
        { color: muted ? palette.textMuted : palette.text },
        style,
      ]}
    />
  );
}
export function Card({ style, ...props }: ViewProps) {
  const { palette } = useAppTheme();
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderWidth: 1,
          borderRadius: radii.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
        style,
      ]}
    />
  );
}
export function AppButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { palette } = useAppTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        {
          minHeight: 52,
          borderRadius: radii.md,
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: disabled ? palette.disabled : palette.primary,
          borderWidth: 2,
          borderColor: focused ? palette.focus : 'transparent',
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: typography.fonts.bodyBold,
          fontSize: 16,
          color: disabled ? palette.textMuted : palette.onPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export const uiStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  section: { gap: 16 },
});
