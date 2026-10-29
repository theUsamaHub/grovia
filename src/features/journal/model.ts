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
  const byDay = new Map<string, number>();
  for (const r of sessions) {
    const key = localDay(new Date(r.endedAt));
    byDay.set(key, (byDay.get(key) ?? 0) + r.actualMs);
  }
  const buckets = Array.from({ length: days }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const day = localDay(date);
    return {
      day,
      ms: byDay.get(day) ?? 0,
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

export function trends(rows: RecordEntry[], now = new Date()) {
  const current = summarize(rows, 7, now);
  const before = new Date(now);
  before.setDate(before.getDate() - 7);
  const previous = summarize(rows, 7, before);
  const year = summarize(rows, 365, now);
  const months = new Map<string, number>();
  const hours = Array<number>(24).fill(0);
  for (const b of year.buckets)
    months.set(b.day.slice(0, 7), (months.get(b.day.slice(0, 7)) ?? 0) + b.ms);
  for (const r of year.sessions)
    hours[new Date(r.endedAt).getHours()] += r.actualMs;
  const bestDay = year.buckets.reduce(
    (a, b) => (b.ms > a.ms ? b : a),
    year.buckets[0],
  );
  const peakHour = hours.some(Boolean)
    ? hours.indexOf(Math.max(...hours))
    : null;
  return {
    current,
    previous,
    year,
    months: [...months].map(([month, ms]) => ({ month, ms })),
    hours,
    bestDay,
    peakHour,
  };
}
export function weeklySummary(rows: RecordEntry[], now = new Date()) {
  const { current, previous } = trends(rows, now);
  const minutes = (ms: number) => Math.floor(ms / 60000);
  return [
    'Grovia · Weekly reflection',
    current.buckets[0].day + ' — ' + current.buckets.at(-1)?.day,
    minutes(current.total) + ' recorded focus minutes',
    current.completed + ' completed sessions',
    'Previous 7 days: ' + minutes(previous.total) + ' minutes',
    ...Object.entries(current.categories).map(
      ([name, ms]) => name + ': ' + minutes(ms) + ' minutes',
    ),
    'Recorded activity only. Breaks excluded. Dates use local time.',
  ].join('\n');
}
