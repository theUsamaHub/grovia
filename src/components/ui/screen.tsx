import { ScrollView, View, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './primitives';
import { useAppTheme } from '@/theme/provider';
export function Screen({
  title,
  subtitle,
  children,
}: ViewProps & { title: string; subtitle?: string }) {
  const { palette } = useAppTheme();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: palette.background }}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={{ gap: 4 }}>
            <AppText
              accessibilityRole="header"
              variant="title"
              style={{ fontSize: 28, lineHeight: 36 }}
            >
              {title}
            </AppText>
            {subtitle && <AppText muted>{subtitle}</AppText>}
          </View>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 28 },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', gap: 24 },
});
