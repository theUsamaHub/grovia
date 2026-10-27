import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';
import { loadThemePreference, saveThemePreference } from '@/db/preferences';
import { colors } from './index';
import { resolveTheme, type ThemePreference } from './preference';
type ThemeContextValue = {
  preference: ThemePreference;
  mode: 'light' | 'dark';
  palette: typeof colors.light | typeof colors.dark;
  ready: boolean;
  saving: boolean;
  error: string | null;
  setPreference: (next: ThemePreference) => Promise<void>;
  retry: () => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function AppThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const [preference, setStoredPreference] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  useEffect(() => {
    let active = true;
    loadThemePreference()
      .then((value) => {
        if (active) {
          setStoredPreference(value);
          setReady(true);
        }
      })
      .catch(() => {
        if (active)
          setError(
            'We could not open your saved appearance. Please try again.',
          );
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const setPreference = useCallback(
    async (next: ThemePreference) => {
      if (busy.current || !ready) return;
      busy.current = true;
      setSaving(true);
      setError(null);
      try {
        await saveThemePreference(next);
        setStoredPreference(next);
      } catch {
        setError('Your appearance could not be saved. Please try again.');
      } finally {
        busy.current = false;
        setSaving(false);
      }
    },
    [ready],
  );
  const mode = resolveTheme(preference, system);
  return (
    <ThemeContext.Provider
      value={{
        preference,
        mode,
        palette: colors[mode],
        ready,
        saving,
        error,
        setPreference,
        retry: () => {
          setError(null);
          setAttempt((a) => a + 1);
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme requires AppThemeProvider');
  return value;
}
