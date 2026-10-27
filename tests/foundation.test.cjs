const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'grovia-tests-'));
for (const file of [
  'db/migrations',
  'db/settings-repository',
  'theme/preference',
  'theme/index',
]) {
  const source = fs.readFileSync(
    path.join(__dirname, '../src', file + '.ts'),
    'utf8',
  );
  fs.writeFileSync(
    path.join(temp, path.basename(file) + '.js'),
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  );
}
const { migrateDatabase } = require(path.join(temp, 'migrations.js'));
const { readSetting, writeSetting } = require(
  path.join(temp, 'settings-repository.js'),
);
const { parsePreference, resolveTheme } = require(
  path.join(temp, 'preference.js'),
);
const { colors } = require(path.join(temp, 'index.js'));
after(() => fs.rmSync(temp, { recursive: true, force: true }));
function adapter(db) {
  const api = {
    execAsync: async (sql) => {
      db.exec(sql);
    },
    getFirstAsync: async (sql, ...params) =>
      db.prepare(sql).get(...params) ?? null,
    runAsync: async (sql, ...params) => db.prepare(sql).run(...params),
    withExclusiveTransactionAsync: async (task) => {
      db.exec('BEGIN IMMEDIATE');
      try {
        await task(api);
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return api;
}
test('migration runs once and preferences survive a database reopen', async () => {
  const filename = path.join(temp, 'persist.db');
  let db = new DatabaseSync(filename);
  let api = adapter(db);
  await migrateDatabase(api);
  await writeSetting(api, 'appearance', 'dark');
  await migrateDatabase(api);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1);
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.equal(db.prepare('PRAGMA journal_mode').get().journal_mode, 'wal');
  db.close();
  db = new DatabaseSync(filename);
  api = adapter(db);
  assert.equal(await readSetting(api, 'appearance'), 'dark');
  db.close();
});
test('upsert keeps one row and parameterized keys cannot execute SQL', async () => {
  const db = new DatabaseSync(':memory:');
  const api = adapter(db);
  await migrateDatabase(api);
  const key = "appearance'); DROP TABLE app_settings; --";
  await writeSetting(api, key, 'light');
  await writeSetting(api, key, 'system');
  assert.equal(await readSetting(api, key), 'system');
  assert.equal(
    db.prepare('SELECT COUNT(*) AS count FROM app_settings').get().count,
    1,
  );
  db.close();
});
test('a failed migration rolls back its schema and version', async () => {
  const db = new DatabaseSync(':memory:');
  const api = adapter(db);
  const original = api.execAsync;
  api.execAsync = async (sql) => {
    if (sql.startsWith('PRAGMA user_version ='))
      throw new Error('injected failure');
    return original(sql);
  };
  await assert.rejects(migrateDatabase(api), /injected failure/);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 0);
  assert.equal(
    db
      .prepare("SELECT name FROM sqlite_master WHERE name = 'app_settings'")
      .get(),
    undefined,
  );
  db.close();
});
test('a newer database is rejected without data loss', async () => {
  const db = new DatabaseSync(':memory:');
  const api = adapter(db);
  await migrateDatabase(api);
  await writeSetting(api, 'appearance', 'light');
  db.exec('PRAGMA user_version = 99');
  await assert.rejects(migrateDatabase(api), /newer version/);
  assert.equal(await readSetting(api, 'appearance'), 'light');
  db.close();
});
test('invalid saved preferences fall back to the live system theme', () => {
  for (const value of [null, undefined, {}, 'invalid', 42])
    assert.equal(parsePreference(value), 'system');
  assert.equal(resolveTheme('system', 'dark'), 'dark');
  assert.equal(resolveTheme('system', 'light'), 'light');
  assert.equal(resolveTheme('dark', 'light'), 'dark');
  assert.equal(resolveTheme('light', 'dark'), 'light');
  assert.equal(resolveTheme('system', null), 'light');
});
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((x) => parseInt(x, 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test('both themes provide readable text and action contrast', () => {
  for (const palette of Object.values(colors)) {
    for (const surface of ['background', 'surface', 'surfaceMuted'])
      for (const foreground of ['text', 'textMuted', 'primary', 'danger'])
        assert.ok(
          contrast(palette[foreground], palette[surface]) >= 4.5,
          foreground + ' on ' + surface,
        );
    assert.ok(contrast(palette.primary, palette.onPrimary) >= 4.5);
  }
});
