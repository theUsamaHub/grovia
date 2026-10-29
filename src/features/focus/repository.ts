import { validateState } from './validation';
import { saveFocus } from './storage';
import { getDatabase } from '@/db/connection';
import { readSetting } from '@/db/settings-repository';
import { emptyState, type FocusState, type RecordEntry } from './engine';
export async function loadFocus(): Promise<{
  state: FocusState;
  history: RecordEntry[];
}> {
  const db = await getDatabase();
  const raw = await readSetting(db, 'focus.state');
  const rows = await db.getAllAsync<{
    category: string | null;
    notes: string | null;
    id: string;
    task_id: string | null;
    task_title: string | null;
    kind: RecordEntry['kind'];
    mode: RecordEntry['mode'];
    started_at: number;
    ended_at: number;
    actual_ms: number;
    planned_ms: number;
    outcome: RecordEntry['outcome'];
  }>('SELECT * FROM focus_sessions ORDER BY ended_at DESC LIMIT 30');
  return {
    state: raw === null ? emptyState : validateState(raw),
    history: rows.map((r) => ({
      category: r.category ?? undefined,
      notes: r.notes ?? undefined,
      id: r.id,
      taskId: r.task_id ?? undefined,
      taskTitle: r.task_title ?? undefined,
      kind: r.kind,
      mode: r.mode,
      startedAt: r.started_at,
      endedAt: r.ended_at,
      actualMs: r.actual_ms,
      plannedMs: r.planned_ms,
      outcome: r.outcome,
    })),
  };
}
export async function persistFocus(state: FocusState, record?: RecordEntry) {
  await saveFocus(await getDatabase(), state, record);
}
