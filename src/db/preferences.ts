import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { migrateDatabase } from './migrations';
import { readSetting, writeSetting } from './settings-repository';
import { parsePreference, type ThemePreference } from '../theme/preference';
let connection: Promise<SQLiteDatabase> | undefined;
async function getDatabase() {
  if (!connection)
    connection = (async () => {
      const db = await openDatabaseAsync('grovia.db');
      try {
        await migrateDatabase(db);
        return db;
      } catch (error) {
        await db.closeAsync();
        throw error;
      }
    })().catch((error) => {
      connection = undefined;
      throw error;
    });
  return connection;
}
export async function loadThemePreference() {
  return parsePreference(await readSetting(await getDatabase(), 'appearance'));
}
export async function saveThemePreference(preference: ThemePreference) {
  await writeSetting(await getDatabase(), 'appearance', preference);
}
