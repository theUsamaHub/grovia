import { emptyWorld, growWorld, type World } from '../world/model';
import type { MigrationDatabase } from '../../db/migrations';
import { readSetting, writeSetting } from '../../db/settings-repository';
import type { FocusState, RecordEntry } from './engine';
export async function saveFocus(
  db: MigrationDatabase,
  state: FocusState,
  record?: RecordEntry,
) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    await writeSetting(tx, 'focus.state', state);
    if (record) {
      await tx.runAsync(
        'INSERT OR IGNORE INTO focus_sessions (id,kind,mode,started_at,ended_at,actual_ms,planned_ms,outcome,task_id,task_title,category,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        record.id,
        record.kind,
        record.mode,
        record.startedAt,
        record.endedAt,
        record.actualMs,
        record.plannedMs,
        record.outcome,
        record.taskId ?? null,
        record.taskTitle ?? null,
        record.category ?? null,
        record.notes ?? null,
      );
      const stats = await tx.getFirstAsync<{
        count: number;
        total: number;
        longest: number;
      }>(
        "SELECT COUNT(*) AS count, COALESCE(SUM(actual_ms),0) AS total, COALESCE(MAX(actual_ms),0) AS longest FROM focus_sessions WHERE kind='focus' AND outcome='completed'",
      );
      const world =
        ((await readSetting(tx, 'world')) as World | null) ?? emptyWorld;
      await writeSetting(
        tx,
        'world',
        growWorld(
          world,
          stats?.count ?? 0,
          stats?.total ?? 0,
          stats?.longest ?? 0,
        ),
      );
    }
  });
}
