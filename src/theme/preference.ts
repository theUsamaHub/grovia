export type ThemePreference = 'system' | 'light' | 'dark';
export function parsePreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}
export function resolveTheme(
  preference: ThemePreference,
  system: string | null | undefined,
): 'light' | 'dark' {
  return preference === 'system'
    ? system === 'dark'
      ? 'dark'
      : 'light'
    : preference;
}
