export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'normal' | 'high';
  estimate: number | null;
  due: string;
  completed: boolean;
  createdAt: number;
};
export type Planner = { tasks: Task[]; goalMinutes: number };
export const initialPlanner: Planner = { tasks: [], goalMinutes: 60 };
export function localDay(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
export function validateTask(task: Task): Task {
  const title = task.title.trim();
  if (!title || title.length > 120)
    throw Error('Enter a title of 1–120 characters.');
  if (task.due) {
    const date = new Date(task.due + 'T12:00:00');
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(task.due) ||
      !Number.isFinite(date.getTime()) ||
      localDay(date) !== task.due
    )
      throw Error('Use a valid due date: YYYY-MM-DD.');
  }
  if (
    task.estimate !== null &&
    (!Number.isInteger(task.estimate) ||
      task.estimate < 1 ||
      task.estimate > 1440)
  )
    throw Error('Estimate must be 1–1440 whole minutes.');
  return {
    ...task,
    title,
    description: task.description.trim(),
    category: task.category.trim(),
  };
}
export function visibleTasks(
  tasks: Task[],
  view: 'Today' | 'Upcoming' | 'Completed',
  today = localDay(),
) {
  return tasks
    .filter((t) =>
      view === 'Completed'
        ? t.completed
        : !t.completed &&
          (view === 'Upcoming' ? t.due > today : !t.due || t.due <= today),
    )
    .sort(
      (a, b) =>
        ({ high: 0, normal: 1, low: 2 })[a.priority] -
          { high: 0, normal: 1, low: 2 }[b.priority] ||
        a.createdAt - b.createdAt,
    );
}
