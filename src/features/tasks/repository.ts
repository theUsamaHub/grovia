import { getDatabase } from '@/db/connection';
import { readSetting, writeSetting } from '@/db/settings-repository';
import { initialPlanner, type Planner } from './model';
export async function loadPlanner(): Promise<Planner> {
  return (
    ((await readSetting(await getDatabase(), 'planner')) as Planner | null) ??
    initialPlanner
  );
}
export async function savePlanner(planner: Planner) {
  await writeSetting(await getDatabase(), 'planner', planner);
}
export async function focusTotals(dayStart: number, dayEnd: number) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ task_id: string; total: number }>(
    "SELECT task_id, SUM(actual_ms) AS total FROM focus_sessions WHERE kind='focus' AND task_id IS NOT NULL GROUP BY task_id",
  );
  const daily = await db.getFirstAsync<{ total: number }>(
    "SELECT COALESCE(SUM(actual_ms),0) AS total FROM focus_sessions WHERE kind='focus' AND ended_at>=? AND ended_at<?",
    dayStart,
    dayEnd,
  );
  return {
    tasks: Object.fromEntries(rows.map((r) => [r.task_id, r.total])),
    daily: daily?.total ?? 0,
  };
}
