import { validateTask } from '../tasks/model';
import { z } from 'zod';
const time = z.number().finite().nonnegative();
const id = z.string().min(1).max(200);
const task = z
  .object({
    id,
    title: z.string().trim().min(1).max(120),
    description: z.string().max(2000),
    category: z.string().max(60),
    priority: z.enum(['low', 'normal', 'high']),
    estimate: z.number().int().min(1).max(1440).nullable(),
    due: z.string().max(10),
    completed: z.boolean(),
    createdAt: time,
  })
  .refine((value) => {
    try {
      validateTask(value);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid task date or estimate');
const record = z
  .object({
    id,
    kind: z.enum(['focus', 'break']),
    mode: z.enum(['pomodoro', 'deep', 'quick', 'custom', 'stopwatch']),
    startedAt: time,
    endedAt: time,
    actualMs: time.max(86400000),
    plannedMs: z.number().positive().max(86400000),
    outcome: z.enum(['completed', 'stopped']),
    taskId: id.optional(),
    taskTitle: z.string().max(120).optional(),
    category: z.string().max(60).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((r) => r.endedAt >= r.startedAt && r.actualMs <= r.plannedMs);
export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  planner: z.object({
    tasks: z.array(task).max(50000),
    goalMinutes: z.number().int().min(1).max(1440),
  }),
  world: z.object({
    unlocked: z.array(
      z.string().refine((value) => ['oak', 'pine', 'flowers'].includes(value)),
    ),
    plots: z
      .array(
        z
          .string()
          .refine((value) => ['oak', 'pine', 'flowers'].includes(value))
          .nullable(),
      )
      .length(9),
    achievements: z.array(z.string().max(100)).max(100),
  }),
  sessions: z.array(record).max(100000),
  categories: z
    .array(
      z.object({
        id,
        name: z.string().trim().min(1).max(60),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        icon: z.string().max(8),
        archived: z.boolean(),
      }),
    )
    .max(1000)
    .default([]),
  appearance: z.enum(['light', 'dark', 'system']),
});
export type Backup = z.infer<typeof backupSchema>;
export function parseBackup(text: string): Backup {
  if (text.length > 10000000)
    throw Error('Choose a backup smaller than 10 MB.');
  return backupSchema.parse(JSON.parse(text));
}
export function mergeTasks<T extends { id: string }>(
  existing: T[],
  incoming: T[],
): T[] {
  const seen = new Set(existing.map((x) => x.id));
  return [
    ...existing,
    ...incoming.filter((x) => {
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    }),
  ];
}
