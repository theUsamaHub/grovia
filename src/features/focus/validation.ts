import { z } from 'zod';
import type { FocusState } from './engine';
const mode = z.enum(['pomodoro', 'deep', 'quick', 'custom', 'stopwatch']);
const kind = z.enum(['focus', 'break']);
const time = z.number().finite().nonnegative();
const record = z.object({
  id: z.string().min(1),
  category: z.string().max(60).optional(),
  notes: z.string().max(2000).optional(),
  taskId: z.string().optional(),
  taskTitle: z.string().optional(),
  kind,
  mode,
  startedAt: time,
  endedAt: time,
  actualMs: time,
  plannedMs: z.number().positive(),
  outcome: z.enum(['completed', 'stopped']),
});
const sessionSchema = z.object({
  id: z.string().min(1),
  category: z.string().max(60).optional(),
  notes: z.string().max(2000).optional(),
  taskId: z.string().optional(),
  taskTitle: z.string().optional(),
  kind,
  mode,
  startedAt: time,
  durationMs: z.number().positive().max(86400000),
  elapsedMs: time,
  anchorMs: time.nullable(),
  breakMinutes: z.number().int().min(1).max(60),
});
const schema = z.object({
  routine: z
    .object({
      autoAdvance: z.boolean(),
      cycles: z.number().int().min(1).max(8),
      longBreakMinutes: z.number().int().min(1).max(60),
      completed: z.number().int().nonnegative(),
      focus: sessionSchema,
    })
    .optional(),
  active: sessionSchema.nullable(),
  last: record.nullable(),
  reminders: z.boolean(),
  nextBreakMinutes: z.number().int().min(1).max(60).default(5),
});
export function validateState(raw: unknown): FocusState {
  return schema.parse(raw);
}
