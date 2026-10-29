import { loadFocus } from '../focus/repository';
import type { RecordEntry } from '../focus/engine';
import { emptyWorld, type World } from '../world/model';
export async function readValue<T>(key: string, fallback: T): Promise<T> {
  const raw = localStorage.getItem('grovia.' + key);
  return raw ? JSON.parse(raw) : fallback;
}
export async function saveValue<T>(key: string, value: T) {
  if (key === 'world') {
    const raw = localStorage.getItem('grovia.world');
    const previous: World = raw ? JSON.parse(raw) : emptyWorld;
    const next = value as World;
    localStorage.setItem(
      'grovia.world',
      JSON.stringify({
        ...next,
        unlocked: [...new Set([...previous.unlocked, ...next.unlocked])],
        achievements: [
          ...new Set([...previous.achievements, ...next.achievements]),
        ],
      }),
    );
  } else localStorage.setItem('grovia.' + key, JSON.stringify(value));
}
export async function allSessions() {
  return (await loadFocus()).history;
}
export async function editSession(record: RecordEntry | null, id: string) {
  const data = await loadFocus();
  data.history = record
    ? data.history.map((r) => (r.id === id ? record : r))
    : data.history.filter((r) => r.id !== id);
  if (data.state.last?.id === id) data.state.last = record;
  localStorage.setItem('grovia.focus', JSON.stringify(data));
}
export const loadWorld = () => readValue<World>('world', emptyWorld);
