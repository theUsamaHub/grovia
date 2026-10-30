import { getDatabase } from '@/db/connection';
import { readSetting, writeSetting } from '@/db/settings-repository';
import type { RecordEntry } from '../focus/engine';
import { emptyWorld, type World } from '../world/model';
export async function readValue<T>(key: string, fallback: T): Promise<T> {
  return (
    ((await readSetting(await getDatabase(), key)) as T | null) ?? fallback
  );
}
export async function saveValue<T>(key: string, value: T) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    if (key === 'world') {
      const previous =
        ((await readSetting(tx, key)) as World | null) ?? emptyWorld;
      const next = value as World;
      await writeSetting(tx, key, {
        ...next,
        unlocked: [...new Set([...previous.unlocked, ...next.unlocked])],
        achievements: [
          ...new Set([...previous.achievements, ...next.achievements]),
        ],
      });
    } else await writeSetting(tx, key, value);
  });
}
export async function allSessions(): Promise<RecordEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    kind: RecordEntry['kind'];
    mode: RecordEntry['mode'];
    started_at: number;
    ended_at: number;
    actual_ms: number;
    planned_ms: number;
    outcome: RecordEntry['outcome'];
    task_id: string | null;
    task_title: string | null;
    category: string | null;
    notes: string | null;
  }>('SELECT * FROM focus_sessions ORDER BY ended_at DESC');
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    mode: r.mode,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    actualMs: r.actual_ms,
    plannedMs: r.planned_ms,
    outcome: r.outcome,
    taskId: r.task_id ?? undefined,
    taskTitle: r.task_title ?? undefined,
    category: r.category ?? undefined,
    notes: r.notes ?? undefined,
  }));
}
export async function editSession(record: RecordEntry | null, id: string) {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    if (record)
      await tx.runAsync(
        'UPDATE focus_sessions SET actual_ms=?,category=?,notes=? WHERE id=?',
        record.actualMs,
        record.category ?? 'Personal',
        record.notes ?? '',
        id,
      );
    else await tx.runAsync('DELETE FROM focus_sessions WHERE id=?', id);
    const state = (await readSetting(tx, 'focus.state')) as {
      last?: RecordEntry;
    } | null;
    if (state?.last?.id === id)
      await writeSetting(tx, 'focus.state', { ...state, last: record });
  });
}
export const loadWorld = () => readValue<World>('world', emptyWorld);
