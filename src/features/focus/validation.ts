import { z } from 'zod';
import type { FocusState } from './engine';
const mode = z.enum(['pomodoro', 'deep', 'quick', 'custom', 'stopwatch']);
const kind = z.enum(['focus', 'break']);
const time = z.number().finite().nonnegative();
const record = z.object({
  id: z.string().min(1),
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
const schema = z.object({
  active: z
    .object({
      id: z.string().min(1),
      taskId: z.string().optional(),
      taskTitle: z.string().optional(),
      kind,
      mode,
      startedAt: time,
      durationMs: z.number().positive().max(86400000),
      elapsedMs: time,
      anchorMs: time.nullable(),
      breakMinutes: z.number().int().min(1).max(60),
    })
    .nullable(),
  last: record.nullable(),
  reminders: z.boolean(),
  nextBreakMinutes: z.number().int().min(1).max(60).default(5),
});
export function validateState(raw: unknown): FocusState {
  return schema.parse(raw);
}
