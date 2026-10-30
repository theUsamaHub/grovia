import { mergeBackup } from './storage';
import { getDatabase } from '@/db/connection';
import { allSessions, loadWorld, readValue } from '../journal/repository';
import { loadPlanner } from '../tasks/repository';
import { loadThemePreference } from '@/db/preferences';
import { type Backup } from './schema';
export async function exportBackup(): Promise<Backup> {
  return {
    preferences: {
      goals: await readValue('goals', undefined),
      routine: await readValue('routine', undefined),
      ambience: await readValue('ambience', undefined),
    },
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
  await mergeBackup(await getDatabase(), data);
}
