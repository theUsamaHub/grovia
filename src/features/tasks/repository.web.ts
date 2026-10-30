import { loadFocus } from '../focus/repository';
import { initialPlanner, type Planner } from './model';
export async function loadPlanner(): Promise<Planner> {
  const raw = localStorage.getItem('grovia.planner');
  return raw ? JSON.parse(raw) : initialPlanner;
}
export async function savePlanner(planner: Planner) {
  localStorage.setItem('grovia.planner', JSON.stringify(planner));
}
export async function focusTotals(dayStart: number, dayEnd: number) {
  const { history } = await loadFocus();
  const tasks: Record<string, number> = Object.create(null);
  let daily = 0;
  for (const row of history) {
    if (row.kind !== 'focus') continue;
    if (row.taskId) tasks[row.taskId] = (tasks[row.taskId] ?? 0) + row.actualMs;
    if (row.endedAt >= dayStart && row.endedAt < dayEnd) daily += row.actualMs;
  }
  return { tasks, daily };
}
