// Browser preview only. Mobile uses SQLite via preferences.ts.
import { parsePreference, type ThemePreference } from '../theme/preference';
export async function loadThemePreference() {
  const rollback = localStorage.getItem('grovia.importRollback');
  if (rollback) {
    const entries = JSON.parse(rollback) as Record<string, string | null>;
    for (const key of [
      'grovia.focus',
      'grovia.planner',
      'grovia.world',
      'grovia.categories',
    ]) {
      const value = entries[key];
      if (value === null) localStorage.removeItem(key);
      else if (typeof value === 'string') localStorage.setItem(key, value);
    }
    localStorage.removeItem('grovia.importRollback');
  }
  return parsePreference(localStorage.getItem('grovia.appearance'));
}
export async function saveThemePreference(preference: ThemePreference) {
  localStorage.setItem('grovia.appearance', preference);
}
