import { Pressable, View, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import Feather from '@expo/vector-icons/Feather';
import { useAppTheme } from '@/theme/provider';
import { AppText } from '@/components/ui/primitives';
const icons: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'feather',
  tasks: 'check-square',
  world: 'globe',
  insights: 'bar-chart-2',
  you: 'user',
};
export function BottomBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const { palette } = useAppTheme();
  return (
    <View
      style={{
        backgroundColor: palette.surface,
        borderTopColor: palette.border,
        borderTopWidth: 1,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View accessibilityRole="tablist" style={styles.row}>
        {state.routes.map((route, index) => {
          const selected = state.index === index;
          const label = descriptors[route.key].options.title ?? route.name;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              aria-selected={selected}
              testID={'tab-' + route.name}
              onPress={() => {
                const event = emitter.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!selected && !event.defaultPrevented)
                  navigateToTab(route.key);
              }}
              onLongPress={() =>
                emitter.emit({ type: 'tabLongPress', target: route.key })
              }
              style={({ pressed }) => [
                styles.tab,
                { opacity: pressed ? 0.7 : 1, borderColor: 'transparent' },
              ]}
            >
              <View
                style={[
                  styles.icon,
                  {
                    backgroundColor: selected
                      ? palette.surfaceMuted
                      : 'transparent',
                  },
                ]}
              >
                <Feather
                  name={icons[route.name] ?? 'circle'}
                  size={21}
                  color={selected ? palette.primary : palette.textMuted}
                />
              </View>
              <AppText
                variant="label"
                style={{
                  fontSize: 12,
                  color: selected ? palette.primary : palette.textMuted,
                }}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 62,
    gap: 2,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 4,
  },
  icon: {
    width: 42,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
