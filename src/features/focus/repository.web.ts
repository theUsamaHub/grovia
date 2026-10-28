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
}
