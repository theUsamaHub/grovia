export const collection = [
  { id: 'oak', name: 'Quiet oak', need: 1, icon: 'tree' },
  { id: 'flowers', name: 'Wildflowers', need: 5, icon: 'flower' },
  { id: 'pine', name: 'Mountain pine', need: 10, icon: 'pine' },
] as const;
export type World = {
  unlocked: string[];
  plots: (string | null)[];
  achievements: string[];
};
export const emptyWorld: World = {
  unlocked: [],
  plots: Array(9).fill(null),
  achievements: [],
};
export function growWorld(
  world: World,
  count: number,
  total: number,
  longest: number,
): World {
  const unlocked = [
    ...new Set([
      ...world.unlocked,
      ...collection.filter((i) => count >= i.need).map((i) => i.id),
    ]),
  ];
  const achievements = [
    ...new Set([
      ...world.achievements,
      ...(count >= 1 ? ['First roots'] : []),
      ...(count >= 10 ? ['Ten quiet moments'] : []),
      ...(longest >= 3600000 ? ['An hour of attention'] : []),
      ...(total >= 360000000 ? ['A hundred hours'] : []),
    ]),
  ];
  return { ...world, unlocked, achievements };
}
export function place(world: World, index: number, item: string | null): World {
  if (!Number.isInteger(index) || index < 0 || index >= 9)
    throw Error('Choose a garden plot.');
  if (item !== null && !world.unlocked.includes(item))
    throw Error('Complete more focus sessions to unlock this plant.');
  return {
    ...world,
    plots: world.plots.map((p, i) => (i === index ? item : p)),
  };
}
