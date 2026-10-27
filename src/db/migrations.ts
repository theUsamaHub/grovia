export interface SqlConnection {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(
    sql: string,
    ...params: (string | number)[]
  ): Promise<T | null>;
  runAsync(sql: string, ...params: (string | number)[]): Promise<unknown>;
}
export interface MigrationDatabase extends SqlConnection {
  withExclusiveTransactionAsync(
    task: (tx: SqlConnection) => Promise<void>,
  ): Promise<void>;
}
export const migrations = [
  {
    version: 1,
    sql: `
  CREATE TABLE app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value_json TEXT NOT NULL CHECK(json_valid(value_json)),
    updated_at TEXT NOT NULL
  );
`,
  },
];
export async function migrateDatabase(db: MigrationDatabase) {
  await db.execAsync(
    'PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;',
  );
  await db.withExclusiveTransactionAsync(async (tx) => {
    const row = await tx.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version',
    );
    const version = row?.user_version ?? 0;
    if (version > migrations.length)
      throw new Error('This database needs a newer version of Grovia.');
    for (const migration of migrations) {
      if (migration.version <= version) continue;
      await tx.execAsync(migration.sql);
      await tx.execAsync('PRAGMA user_version = ' + migration.version);
    }
  });
}
