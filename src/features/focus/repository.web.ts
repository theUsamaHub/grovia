import { emptyWorld, growWorld, type World } from '../world/model';
import { emptyState, type FocusState, type RecordEntry } from './engine';
import { validateState } from './validation';
const key = 'grovia.focus';
export async function loadFocus(): Promise<{
  state: FocusState;
  history: RecordEntry[];
}> {
  const raw = localStorage.getItem(key);
  if (!raw) return { state: emptyState, history: [] };
  const data = JSON.parse(raw);
  return { state: validateState(data.state), history: data.history };
}
export async function persistFocus(state: FocusState, record?: RecordEntry) {
  const previous = await loadFocus();
  const history = record
    ? [record, ...previous.history.filter((r) => r.id !== record.id)]
    : previous.history;
  localStorage.setItem(key, JSON.stringify({ state, history }));
  if (record) {
    try {
      const done = history.filter(
        (r) => r.kind === 'focus' && r.outcome === 'completed',
      );
      const raw = localStorage.getItem('grovia.world');
      const world: World = raw ? JSON.parse(raw) : emptyWorld;
      localStorage.setItem(
        'grovia.world',
        JSON.stringify(
          growWorld(
            world,
            done.length,
            done.reduce((n, r) => n + r.actualMs, 0),
            Math.max(0, ...done.map((r) => r.actualMs)),
          ),
        ),
      );
    } catch {
      // History is authoritative. World recomputes missing unlocks on its next load.
    }
  }
}
