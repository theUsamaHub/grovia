import type { RecordEntry } from '../focus/engine';
import { localDay } from '../tasks/model';
export function summarize(
  rows: RecordEntry[],
  days: number,
  now = new Date(),
  category = 'All',
) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  const sessions = rows.filter(
    (r) =>
      r.kind === 'focus' &&
      r.endedAt >= start.getTime() &&
      r.endedAt < end.getTime() &&
      (category === 'All' || (r.category || 'Personal') === category),
  );
  const buckets = Array.from({ length: days }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const day = localDay(date);
    return {
      day,
      ms: sessions
        .filter((r) => localDay(new Date(r.endedAt)) === day)
        .reduce((n, r) => n + r.actualMs, 0),
    };
  });
  const categories: Record<string, number> = Object.create(null);
  for (const r of sessions) {
    const k = r.category || 'Personal';
    categories[k] = (categories[k] ?? 0) + r.actualMs;
  }
  return {
    sessions,
    buckets,
    categories,
    total: sessions.reduce((n, r) => n + r.actualMs, 0),
    completed: sessions.filter((r) => r.outcome === 'completed').length,
  };
}
