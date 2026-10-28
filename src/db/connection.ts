import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { migrateDatabase } from './migrations';
let connection: Promise<SQLiteDatabase> | undefined;
export async function getDatabase() {
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
