import type { MigrationDatabase } from '../../db/migrations';
import { readSetting, writeSetting } from '../../db/settings-repository';
import { initialPlanner, type Planner } from '../tasks/model';
import { emptyWorld, type World } from '../world/model';
import { mergeTasks, type Backup } from './schema';
export async function mergeBackup(db: MigrationDatabase, data: Backup) {
  await db.withExclusiveTransactionAsync(async (tx) => {
    const state = (await readSetting(tx, 'focus.state')) as {
      active?: unknown;
    } | null;
    if (state?.active) throw Error('Finish the active timer before importing.');
    const planner =
      ((await readSetting(tx, 'planner')) as Planner | null) ?? initialPlanner;
    await writeSetting(tx, 'planner', {
      ...planner,
      tasks: mergeTasks(planner.tasks, data.planner.tasks),
    });
    const categories =
      ((await readSetting(tx, 'categories')) as Backup['categories'] | null) ??
      [];
    if (data.categories.length)
      await writeSetting(
        tx,
        'categories',
        mergeTasks(categories, data.categories),
      );
    const world =
      ((await readSetting(tx, 'world')) as World | null) ?? emptyWorld;
    await writeSetting(tx, 'world', {
      ...world,
      unlocked: [...new Set([...world.unlocked, ...data.world.unlocked])],
      achievements: [
        ...new Set([...world.achievements, ...data.world.achievements]),
      ],
    });
    for (const r of data.sessions)
      await tx.runAsync(
        'INSERT OR IGNORE INTO focus_sessions (id,kind,mode,started_at,ended_at,actual_ms,planned_ms,outcome,task_id,task_title,category,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        r.id,
        r.kind,
        r.mode,
        r.startedAt,
        r.endedAt,
        r.actualMs,
        r.plannedMs,
        r.outcome,
        r.taskId ?? null,
        r.taskTitle ?? null,
        r.category ?? null,
        r.notes ?? null,
      );
  });
}
