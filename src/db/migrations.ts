export interface SqlConnection {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<T | null>;
  runAsync(
    sql: string,
    ...params: (string | number | null)[]
  ): Promise<unknown>;
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
  {
    version: 2,
    sql: `CREATE TABLE focus_sessions (id TEXT PRIMARY KEY NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('focus','break')), mode TEXT NOT NULL, started_at INTEGER NOT NULL, ended_at INTEGER NOT NULL, actual_ms INTEGER NOT NULL CHECK(actual_ms >= 0), planned_ms INTEGER NOT NULL CHECK(planned_ms > 0), outcome TEXT NOT NULL CHECK(outcome IN ('completed','stopped'))); CREATE INDEX focus_sessions_ended_at ON focus_sessions(ended_at);`,
  },
  {
    version: 3,
    sql: 'ALTER TABLE focus_sessions ADD COLUMN task_id TEXT; ALTER TABLE focus_sessions ADD COLUMN task_title TEXT; CREATE INDEX focus_sessions_task ON focus_sessions(task_id);',
  },
  {
    version: 4,
    sql: 'ALTER TABLE focus_sessions ADD COLUMN category TEXT; ALTER TABLE focus_sessions ADD COLUMN notes TEXT;',
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
