/* global __dirname */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os'),
  ts = require('typescript');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'grovia-focus-'));
for (const file of [
  'features/tasks/model',
  'features/focus/engine',
  'features/focus/storage',
  'db/migrations',
  'db/settings-repository',
]) {
  const dest = path.join(temp, file + '.js');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(
    dest,
    ts.transpileModule(
      fs.readFileSync(path.join(__dirname, '../src', file + '.ts'), 'utf8'),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  );
}
after(() => fs.rmSync(temp, { recursive: true, force: true }));
const {
  createSession,
  elapsed,
  pause,
  resume,
  finish,
  formatTime,
  emptyState,
} = require(path.join(temp, 'features/focus/engine'));
const { saveFocus } = require(path.join(temp, 'features/focus/storage'));
const { migrateDatabase, migrations } = require(
  path.join(temp, 'db/migrations'),
);
const { readSetting, writeSetting } = require(
  path.join(temp, 'db/settings-repository'),
);
function adapter(db) {
  const api = {
    execAsync: async (sql) => {
      db.exec(sql);
    },
    getFirstAsync: async (sql, ...args) => db.prepare(sql).get(...args) ?? null,
    runAsync: async (sql, ...args) => db.prepare(sql).run(...args),
    withExclusiveTransactionAsync: async (task) => {
      db.exec('BEGIN IMMEDIATE');
      try {
        await task(api);
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
  return api;
}
test('pause survives relaunch, excludes paused time, resume is idempotent', () => {
  const s = createSession('pomodoro', 25, 5, 1000, 'a');
  const paused = JSON.parse(JSON.stringify(pause(s, 61000)));
  assert.equal(elapsed(paused, 999000), 60000);
  const running = resume(paused, 1000000);
  assert.deepEqual(resume(running, 1001000), running);
  assert.equal(elapsed(running, 1030000), 90000);
});
test('background completion uses the deadline and caps actual duration', () => {
  const s = JSON.parse(
    JSON.stringify(createSession('quick', 10, 2, 1000, 'a')),
  );
  const record = finish(s, 900000, 'stopped');
  assert.equal(record.endedAt, 601000);
  assert.equal(record.actualMs, 600000);
  assert.equal(record.outcome, 'completed');
  assert.equal(formatTime(s.durationMs - elapsed(s, 900000)), '00:00');
});
test('early finish records actual time; restart has an independent identity', () => {
  const s = createSession('deep', 50, 10, 1000, 'old');
  const record = finish(s, 31000, 'stopped');
  const next = createSession(s.mode, 50, s.breakMinutes, 31000, 'new');
  assert.equal(record.actualMs, 30000);
  assert.equal(record.outcome, 'stopped');
  assert.notEqual(record.id, next.id);
  assert.equal(elapsed(next, 31000), 0);
});
test('backward clocks never produce negative time; breaks stay distinguishable', () => {
  const s = createSession('custom', 5, 5, 1000, 'break', 'break');
  assert.equal(elapsed(s, 0), 0);
  assert.equal(finish(s, 5000, 'stopped').kind, 'break');
  assert.equal(formatTime(-2000), '00:00');
});
test('duration validation rejects fractions and out of range values', () => {
  for (const n of [0, -1, 181, 1.5, NaN])
    assert.throws(() => createSession('custom', n, 5, 1000, 'a'));
  assert.throws(() => createSession('custom', 25, 61, 1000, 'a'));
  assert.equal(
    createSession('stopwatch', 25, 5, 1000, 's').durationMs,
    86400000,
  );
});
test('v1 upgrade preserves appearance and completion writes are atomic and idempotent', async () => {
  const filename = path.join(temp, 'focus.db');
  let db = new DatabaseSync(filename);
  let api = adapter(db);
  db.exec(migrations[0].sql);
  db.exec('PRAGMA user_version = 1');
  await writeSetting(api, 'appearance', 'dark');
  await migrateDatabase(api);
  assert.equal(await readSetting(api, 'appearance'), 'dark');
  const s = createSession('quick', 10, 2, 1000, 'session');
  await saveFocus(api, { ...emptyState, active: s });
  const record = finish(s, 601000, 'completed');
  const done = { ...emptyState, last: record };
  const run = api.runAsync;
  api.runAsync = async (sql, ...args) => {
    if (sql.includes('focus_sessions')) throw new Error('disk full');
    return run(sql, ...args);
  };
  await assert.rejects(saveFocus(api, done, record), /disk full/);
  assert.equal((await readSetting(api, 'focus.state')).active.id, s.id);
  assert.equal(
    db.prepare('SELECT COUNT(*) AS n FROM focus_sessions').get().n,
    0,
  );
  api.runAsync = run;
  await saveFocus(api, done, record);
  await saveFocus(api, done, record);
  assert.equal(
    db.prepare('SELECT COUNT(*) AS n FROM focus_sessions').get().n,
    1,
  );
  db.close();
  db = new DatabaseSync(filename);
  api = adapter(db);
  assert.equal((await readSetting(api, 'focus.state')).active, null);
  assert.equal((await readSetting(api, 'focus.state')).last.id, s.id);
  db.close();
});

const { validateTask, visibleTasks } = require(
  path.join(temp, 'features/tasks/model'),
);
const task = {
  id: 't1',
  title: '  Read  ',
  description: '',
  category: 'Study',
  priority: 'normal',
  estimate: 25,
  due: '2026-10-28',
  completed: false,
  createdAt: 1,
};
test('task validation trims titles and rejects invalid dates and estimates', () => {
  assert.equal(validateTask(task).title, 'Read');
  for (const due of ['2026-02-30', '2026-13-01', 'tomorrow'])
    assert.throws(() => validateTask({ ...task, due }));
  assert.throws(() => validateTask({ ...task, title: ' ' }));
  assert.throws(() => validateTask({ ...task, estimate: 1.5 }));
});
test('planner views include overdue and undated tasks today and isolate completed tasks', () => {
  const rows = [
    task,
    { ...task, id: 'overdue', due: '2026-10-01' },
    { ...task, id: 'undated', due: '' },
    { ...task, id: 'future', due: '2026-10-29' },
    { ...task, id: 'done', completed: true },
  ];
  assert.deepEqual(
    visibleTasks(rows, 'Today', '2026-10-28').map((t) => t.id),
    ['t1', 'overdue', 'undated'],
  );
  assert.deepEqual(
    visibleTasks(rows, 'Upcoming', '2026-10-28').map((t) => t.id),
    ['future'],
  );
  assert.deepEqual(
    visibleTasks(rows, 'Completed', '2026-10-28').map((t) => t.id),
    ['done'],
  );
});
test('task deletion preserves linked session snapshot and once-only accumulated duration', async () => {
  const db = new DatabaseSync(':memory:');
  const api = adapter(db);
  await migrateDatabase(api);
  await writeSetting(api, 'planner', { tasks: [task], goalMinutes: 60 });
  const session = {
    ...createSession('pomodoro', 25, 5, 1000, 'linked'),
    taskId: task.id,
    taskTitle: task.title,
  };
  const record = finish(session, 61000, 'stopped');
  await saveFocus(api, { ...emptyState, last: record }, record);
  await saveFocus(api, { ...emptyState, last: record }, record);
  await writeSetting(api, 'planner', { tasks: [], goalMinutes: 60 });
  const row = db
    .prepare(
      'SELECT task_id,task_title,SUM(actual_ms) AS total FROM focus_sessions GROUP BY task_id',
    )
    .get();
  assert.equal(row.task_id, task.id);
  assert.equal(row.task_title, task.title);
  assert.equal(row.total, 60000);
  db.close();
});
