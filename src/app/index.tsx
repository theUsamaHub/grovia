import { StyleSheet, Text, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
export default function HomeScreen() {
  const palette = colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: palette.primary }]}
      >
        Grovia
      </Text>
      <Text style={[styles.tagline, { color: palette.text }]}>
        Focus. Grow. Thrive.
      </Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: 32,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
