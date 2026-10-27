// Browser preview only. Mobile uses SQLite via preferences.ts.
import { parsePreference, type ThemePreference } from '../theme/preference';
export async function loadThemePreference() {
  return parsePreference(localStorage.getItem('grovia.appearance'));
}
export async function saveThemePreference(preference: ThemePreference) {
  localStorage.setItem('grovia.appearance', preference);
}
