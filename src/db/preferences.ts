import { getDatabase } from './connection';
import { readSetting, writeSetting } from './settings-repository';
import { parsePreference, type ThemePreference } from '../theme/preference';
export async function loadThemePreference() {
  return parsePreference(await readSetting(await getDatabase(), 'appearance'));
}
export async function saveThemePreference(preference: ThemePreference) {
  await writeSetting(await getDatabase(), 'appearance', preference);
}
