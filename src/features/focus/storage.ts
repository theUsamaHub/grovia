import type { MigrationDatabase } from '../../db/migrations';
import { writeSetting } from '../../db/settings-repository';
import type { FocusState, RecordEntry } from './engine';
export async function saveFocus(
  db: MigrationDatabase,
  state: FocusState,
  record?: RecordEntry,
) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    await writeSetting(tx, 'focus.state', state);
    if (record)
      await tx.runAsync(
        'INSERT OR IGNORE INTO focus_sessions (id,kind,mode,started_at,ended_at,actual_ms,planned_ms,outcome,task_id,task_title) VALUES (?,?,?,?,?,?,?,?,?,?)',
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
      );
  });
}
