import type { RecordEntry } from '../focus/engine';
import { localDay } from '../tasks/model';
export type Goal = {
  from: string;
  type: 'minutes' | 'sessions';
  target: number;
  restDays: number[];
};
export function validGoal(g: Goal) {
  if (
    !['minutes', 'sessions'].includes(g.type) ||
    !Number.isInteger(g.target) ||
    g.target < 1 ||
    g.target > (g.type === 'minutes' ? 1440 : 24) ||
    g.restDays.length > 6 ||
    g.restDays.some((d) => !Number.isInteger(d) || d < 0 || d > 6)
  )
    throw Error('Choose a valid goal and keep at least one focus day.');
  return g;
}
export function goalStats(
  rows: RecordEntry[],
  policies: Goal[],
  now = new Date(),
) {
  const sorted = [...policies].sort((a, b) => a.from.localeCompare(b.from));
  const days = new Map<string, { ms: number; completed: number }>();
  for (const r of rows) {
    if (r.kind !== 'focus' || r.endedAt > now.getTime()) continue;
    const day = localDay(new Date(r.endedAt));
    const entry = days.get(day) ?? { ms: 0, completed: 0 };
    entry.ms += r.actualMs;
    entry.completed += Number(r.outcome === 'completed');
    days.set(day, entry);
  }
  const today = localDay(now);
  let streak = 0,
    best = 0,
    achieved = 0;
  const first = sorted[0]?.from ?? today;
  const cursor = new Date(first + 'T12:00:00');
  let todayValue = 0,
    todayRest = false,
    todayTarget = 0;
  let policyIndex = -1;
  while (localDay(cursor) <= today) {
    const day = localDay(cursor);
    while (
      policyIndex + 1 < sorted.length &&
      sorted[policyIndex + 1].from <= day
    )
      policyIndex++;
    const policy = sorted[policyIndex];
    if (policy) {
      const data = days.get(day) ?? { ms: 0, completed: 0 };
      const value =
        policy.type === 'minutes' ? data.ms / 60000 : data.completed;
      const rest = policy.restDays.includes(cursor.getDay());
      if (day === today) {
        todayValue = value;
        todayRest = rest;
        todayTarget = policy.target;
      }
      if (value >= policy.target) {
        streak++;
        achieved++;
        best = Math.max(best, streak);
      } else if (!rest && day !== today) streak = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return { streak, best, achieved, todayValue, todayRest, todayTarget };
}
