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
  'features/backup/schema',
  'features/backup/storage',
  'features/world/model',
  'features/journal/model',
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
    ts
      .transpileModule(
        fs.readFileSync(path.join(__dirname, '../src', file + '.ts'), 'utf8'),
        {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
          },
        },
      )
      .outputText.replace(
        'require("zod")',
        'require(' + JSON.stringify(require.resolve('zod')) + ')',
      ),
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

const { growWorld, emptyWorld, place } = require(
  path.join(temp, 'features/world/model'),
);
const { summarize } = require(path.join(temp, 'features/journal/model'));
const { parseBackup, mergeTasks } = require(
  path.join(temp, 'features/backup/schema'),
);
const { mergeBackup } = require(path.join(temp, 'features/backup/storage'));
test('world unlocks are idempotent and never removed after missed days or corrected history', () => {
  const earned = growWorld(emptyWorld, 10, 3600000, 3600000);
  assert.equal(earned.unlocked.length, 3);
  assert.deepEqual(growWorld(earned, 0, 0, 0), earned);
  assert.deepEqual(growWorld(earned, 10, 3600000, 3600000), earned);
  assert.throws(() => place(emptyWorld, 0, 'oak'));
  assert.equal(place(earned, 0, 'oak').plots[0], 'oak');
  assert.equal(place(place(earned, 0, 'oak'), 0, null).plots[0], null);
});
test('analytics uses local day ranges, excludes breaks and supports arbitrary category labels', () => {
  const now = new Date(2026, 9, 28, 12);
  const base = {
    ...finish(
      createSession('quick', 10, 2, now.getTime() - 600000, 'report'),
      now.getTime(),
      'completed',
    ),
    category: '__proto__',
  };
  const result = summarize(
    [
      base,
      { ...base, id: 'break', kind: 'break' },
      { ...base, id: 'old', endedAt: new Date(2026, 9, 20).getTime() },
    ],
    1,
    now,
  );
  assert.equal(result.total, 600000);
  assert.equal(result.sessions.length, 1);
  assert.equal(result.categories['__proto__'], 600000);
  assert.equal(result.buckets[0].ms, 600000);
});
function backup() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    planner: { tasks: [task], goalMinutes: 60 },
    world: growWorld(emptyWorld, 1, 600000, 600000),
    sessions: [
      finish(
        createSession('quick', 10, 2, 1000, 'imported'),
        601000,
        'completed',
      ),
    ],
    appearance: 'dark',
    categories: [],
  };
}
test('backup validation rejects future schemas, malformed records and impossible task dates', () => {
  assert.equal(parseBackup(JSON.stringify(backup())).version, 1);
  assert.throws(() => parseBackup(JSON.stringify({ ...backup(), version: 2 })));
  const bad = backup();
  bad.sessions[0].actualMs = -1;
  assert.throws(() => parseBackup(JSON.stringify(bad)));
  const badDate = backup();
  badDate.planner.tasks = [{ ...task, due: '2026-02-30' }];
  assert.throws(() => parseBackup(JSON.stringify(badDate)));
  assert.equal(
    mergeTasks(
      [{ id: 'a', title: 'existing' }],
      [
        { id: 'a', title: 'incoming' },
        { id: 'b', title: 'new' },
        { id: 'b', title: 'duplicate' },
      ],
    ).length,
    2,
  );
});
test('backup merge rolls back all writes on failure, preserves duplicates, and blocks active timers', async () => {
  const db = new DatabaseSync(':memory:');
  const api = adapter(db);
  await migrateDatabase(api);
  await writeSetting(api, 'planner', {
    tasks: [{ ...task, title: 'existing' }],
    goalMinutes: 90,
  });
  const run = api.runAsync;
  api.runAsync = async (sql, ...args) => {
    if (sql.includes('focus_sessions')) throw Error('disk full');
    return run(sql, ...args);
  };
  await assert.rejects(mergeBackup(api, backup()), /disk full/);
  assert.equal(await readSetting(api, 'world'), null);
  assert.equal((await readSetting(api, 'planner')).goalMinutes, 90);
  api.runAsync = run;
  await mergeBackup(api, backup());
  await mergeBackup(api, backup());
  assert.equal(
    db.prepare('SELECT COUNT(*) AS n FROM focus_sessions').get().n,
    1,
  );
  assert.equal((await readSetting(api, 'planner')).tasks[0].title, 'existing');
  await writeSetting(api, 'focus.state', {
    ...emptyState,
    active: createSession('quick', 10, 2, 1000, 'active'),
  });
  await assert.rejects(mergeBackup(api, backup()), /Finish the active timer/);
  db.close();
});

const { completeSession } = require(path.join(temp, 'features/focus/engine'));
test('automatic routines take long breaks and never invent sessions after delayed returns', () => {
  const focus = createSession('pomodoro', 25, 5, 1000, 'routine');
  const state = {
    ...emptyState,
    active: focus,
    routine: {
      autoAdvance: true,
      cycles: 2,
      longBreakMinutes: 15,
      completed: 1,
      focus,
    },
  };
  const result = completeSession(state, focus, 1501000, 'rest', true);
  assert.equal(result.state.active.kind, 'break');
  assert.equal(result.state.active.durationMs, 900000);
  assert.equal(result.state.routine.completed, 2);
  const next = completeSession(
    result.state,
    result.state.active,
    2401000,
    'next',
    true,
  );
  assert.equal(next.state.active.kind, 'focus');
  assert.equal(next.state.active.durationMs, 1500000);
  assert.equal(
    completeSession(state, focus, 1601000, 'late', true).state.active,
    null,
  );
  assert.equal(
    completeSession(state, focus, 1501000, 'cold', false).state.active,
    null,
  );
});
