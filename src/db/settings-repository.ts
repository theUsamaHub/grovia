import type { SqlConnection } from './migrations';
export async function readSetting(
  db: SqlConnection,
  key: string,
): Promise<unknown> {
  const row = await db.getFirstAsync<{ value_json: string }>(
    'SELECT value_json FROM app_settings WHERE key = ?',
    key,
  );
  if (!row) return null;
  try {
    return JSON.parse(row.value_json);
  } catch {
    return null;
  }
}
export async function writeSetting(
  db: SqlConnection,
  key: string,
  value: unknown,
) {
  const json = JSON.stringify(value);
  if (json === undefined) throw new Error('Setting must be JSON serializable.');
  await db.runAsync(
    'INSERT INTO app_settings (key, value_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at',
    key,
    json,
    new Date().toISOString(),
  );
}
