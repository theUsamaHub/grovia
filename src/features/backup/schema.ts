import { validGoal } from '../goals/model';
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
  preferences: z
    .object({
      goals: z
        .array(
          z
            .object({
              from: z
                .string()
                .regex(/^\d{4}-\d{2}-\d{2}$/)
                .refine((v) => {
                  const d = new Date(v + 'T12:00:00');
                  return (
                    Number.isFinite(d.getTime()) &&
                    d.getFullYear() >= 2000 &&
                    d.getFullYear() <= 2100 &&
                    d.getDate() === Number(v.slice(-2))
                  );
                }),
              type: z.enum(['minutes', 'sessions']),
              target: z.number(),
              restDays: z.array(z.number()).max(6),
            })
            .refine((v) => {
              try {
                validGoal(v);
                return true;
              } catch {
                return false;
              }
            }),
        )
        .max(10000)
        .optional(),
      routine: z
        .object({
          autoAdvance: z.boolean(),
          cycles: z.number().int().min(1).max(8),
          longBreakMinutes: z.number().int().min(1).max(60),
        })
        .optional(),
      ambience: z
        .object({
          enabled: z.array(z.boolean()).length(3),
          volumes: z.array(z.number().min(0).max(1)).length(3),
          master: z.number().min(0).max(1),
          muted: z.boolean(),
        })
        .optional(),
    })
    .optional(),
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
