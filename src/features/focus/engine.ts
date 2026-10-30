export type FocusMode = 'pomodoro' | 'deep' | 'quick' | 'custom' | 'stopwatch';
export type Session = {
  category?: string;
  notes?: string;
  taskId?: string;
  taskTitle?: string;
  id: string;
  kind: 'focus' | 'break';
  mode: FocusMode;
  startedAt: number;
  durationMs: number;
  elapsedMs: number;
  anchorMs: number | null;
  breakMinutes: number;
};
export type RecordEntry = {
  category?: string;
  notes?: string;
  taskId?: string;
  taskTitle?: string;
  id: string;
  kind: Session['kind'];
  mode: FocusMode;
  startedAt: number;
  endedAt: number;
  actualMs: number;
  plannedMs: number;
  outcome: 'completed' | 'stopped';
};
export type Routine = {
  autoAdvance: boolean;
  cycles: number;
  longBreakMinutes: number;
  completed: number;
  focus: Session;
};
export type FocusState = {
  routine?: Routine;
  active: Session | null;
  last: RecordEntry | null;
  reminders: boolean;
  nextBreakMinutes: number;
};
export const emptyState: FocusState = {
  active: null,
  last: null,
  reminders: false,
  nextBreakMinutes: 5,
};
export function elapsed(session: Session, now: number) {
  return Math.min(
    session.durationMs,
    session.elapsedMs +
      (session.anchorMs === null ? 0 : Math.max(0, now - session.anchorMs)),
  );
}
export function checkpoint(session: Session, now: number): Session {
  return {
    ...session,
    elapsedMs: elapsed(session, now),
    anchorMs: session.anchorMs === null ? null : now,
  };
}
export function pause(session: Session, now: number): Session {
  return { ...checkpoint(session, now), anchorMs: null };
}
export function resume(session: Session, now: number): Session {
  return session.anchorMs !== null ? session : { ...session, anchorMs: now };
}
export function finish(
  session: Session,
  now: number,
  outcome: RecordEntry['outcome'],
): RecordEntry {
  const actualMs = elapsed(session, now);
  const completed = actualMs >= session.durationMs;
  const endedAt =
    completed && session.anchorMs !== null
      ? session.anchorMs + session.durationMs - session.elapsedMs
      : now;
  return {
    id: session.id,
    category: session.category,
    notes: session.notes,
    taskId: session.taskId,
    taskTitle: session.taskTitle,
    kind: session.kind,
    mode: session.mode,
    startedAt: session.startedAt,
    endedAt: Math.max(session.startedAt, endedAt),
    actualMs,
    plannedMs: session.durationMs,
    outcome: completed ? 'completed' : outcome,
  };
}
export function createSession(
  mode: FocusMode,
  minutes: number,
  breakMinutes: number,
  now: number,
  id: string,
  kind: Session['kind'] = 'focus',
): Session {
  if (
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 180 ||
    !Number.isInteger(breakMinutes) ||
    breakMinutes < 1 ||
    breakMinutes > 60
  )
    throw new Error('Choose 1–180 focus minutes and 1–60 break minutes.');
  return {
    id,
    kind,
    mode,
    startedAt: now,
    durationMs:
      mode === 'stopwatch' && kind === 'focus' ? 86400000 : minutes * 60000,
    elapsedMs: 0,
    anchorMs: now,
    breakMinutes,
  };
}
export function formatTime(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  return String(m).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

export function completeSession(
  previous: FocusState,
  session: Session,
  now: number,
  id: string,
  allowAuto = false,
): { state: FocusState; record: RecordEntry } {
  const record = finish(session, now, 'completed');
  const routine = previous.routine;
  const completed =
    (routine?.completed ?? 0) + (session.kind === 'focus' ? 1 : 0);
  const rest =
    routine && completed % routine.cycles === 0
      ? routine.longBreakMinutes
      : session.breakMinutes;
  const next: FocusState = {
    ...previous,
    active: null,
    last: record,
    nextBreakMinutes:
      session.kind === 'focus' ? rest : previous.nextBreakMinutes,
    routine: routine ? { ...routine, completed } : undefined,
  };
  // No unseen focus is invented after a delayed wake-up or a cold launch.
  if (routine?.autoAdvance && allowAuto && now - record.endedAt <= 2000) {
    if (session.kind === 'focus')
      next.active = createSession('custom', rest, rest, now, id, 'break');
    else {
      const source = routine.focus;
      next.active = {
        ...createSession(
          source.mode,
          source.mode === 'stopwatch' ? 25 : source.durationMs / 60000,
          source.breakMinutes,
          now,
          id,
        ),
        taskId: source.taskId,
        taskTitle: source.taskTitle,
        category: source.category,
      };
    }
    next.last = null;
  }
  return { state: next, record };
}
