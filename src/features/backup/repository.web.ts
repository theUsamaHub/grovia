import { allSessions, loadWorld, readValue } from '../journal/repository';
import { loadPlanner } from '../tasks/repository';
import { loadThemePreference } from '@/db/preferences';
import { loadFocus } from '../focus/repository';
import { mergeTasks, type Backup } from './schema';
export async function exportBackup(): Promise<Backup> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    planner: await loadPlanner(),
    world: await loadWorld(),
    sessions: await allSessions(),
    appearance: await loadThemePreference(),
    categories: await readValue<Backup['categories']>('categories', []),
  };
}
export async function importBackup(data: Backup) {
  const focus = await loadFocus();
  if (focus.state.active)
    throw Error('Finish the active timer before importing.');
  const planner = await loadPlanner();
  const world = await loadWorld();
  const keys = [
    'grovia.focus',
    'grovia.planner',
    'grovia.world',
    'grovia.categories',
  ];
  const categories = await readValue<Backup['categories']>('categories', []);
  const previous = Object.fromEntries(
    keys.map((k) => [k, localStorage.getItem(k)]),
  );
  localStorage.setItem('grovia.importRollback', JSON.stringify(previous));
  try {
    if (data.categories.length)
      localStorage.setItem(
        'grovia.categories',
        JSON.stringify(mergeTasks(categories, data.categories)),
      );
    localStorage.setItem(
      'grovia.focus',
      JSON.stringify({
        ...focus,
        history: mergeTasks(focus.history, data.sessions).sort(
          (a, b) => b.endedAt - a.endedAt,
        ),
      }),
    );
    localStorage.setItem(
      'grovia.planner',
      JSON.stringify({
        ...planner,
        tasks: mergeTasks(planner.tasks, data.planner.tasks),
      }),
    );
    localStorage.setItem(
      'grovia.world',
      JSON.stringify({
        ...world,
        unlocked: [...new Set([...world.unlocked, ...data.world.unlocked])],
        achievements: [
          ...new Set([...world.achievements, ...data.world.achievements]),
        ],
      }),
    );
    localStorage.removeItem('grovia.importRollback');
  } catch (e) {
    for (const [k, v] of Object.entries(previous)) {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    }
    localStorage.removeItem('grovia.importRollback');
    throw e;
  }
}
