import { test } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { itemHash, leanSnapshot, changedFields, diffQueue, queueStatus, queueRoot, archiveGroups, readQueue, readStdin } from './cli/queue';
import { listBacklog, showBacklog, backlogSizeWarning, validateBacklog, BACKLOG_WARN_ITEMS } from './cli/validate-backlog';

const story = { id: 'STORY-1', type: 'story', priority: 'high', size: 'm', depends_on: [], title: 'Remember me', description: 'Stay signed in.', acceptance: ['Checkbox shown'] };
const bug = { id: 'BUG-3', type: 'bug', priority: 'highest', size: 's', depends_on: [], title: 'Expired session 500', acceptance: ['Redirects to sign-in'] };

function workspace(queue?: unknown) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-queue-'));
  fs.mkdirSync(path.join(root, '.architecture-guard', 'queue'), { recursive: true });
  if (queue !== undefined) fs.writeFileSync(path.join(root, '.architecture-guard', 'queue.yml'), stringify(queue));
  return root;
}

function git(cwd: string, ...args: string[]) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.strictEqual(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test('item hash ignores line endings, surrounding whitespace, and key order, and changes with the text', () => {
  const copy = { ...story, description: '  Stay signed in.\r\n', origins: [], criterion_mappings: [] };
  assert.strictEqual(itemHash(copy), itemHash(story));
  assert.strictEqual(itemHash({ acceptance: story.acceptance, title: story.title, description: story.description }), itemHash(story));
  assert.notStrictEqual(itemHash({ ...story, acceptance: ['Checkbox shown', 'Lasts 30 days'] }), itemHash(story));
  assert.match(itemHash(story), /^sha256:[0-9a-f]{16}$/);
});

test('lean snapshots keep ordering and lane fields and drop the item text', () => {
  const lean = leanSnapshot(story);
  assert.deepStrictEqual(Object.keys(lean), ['id', 'type', 'priority', 'size', 'depends_on', 'hash']);
  assert.strictEqual(changedFields(lean, story).length, 0);
  assert.deepStrictEqual(changedFields(lean, { ...story, title: 'Remember me on sign-in' }), ['content']);
  assert.deepStrictEqual(changedFields(lean, { ...story, priority: 'low', depends_on: ['BUG-3'] }), ['priority', 'depends_on']);
});

test('compact backlog list rows diff and snapshot by their own hash, not by their missing text', () => {
  const row = { id: story.id, type: story.type, priority: story.priority, size: story.size, depends_on: [], title: story.title, hash: itemHash(story) };
  assert.deepStrictEqual(changedFields(leanSnapshot(story), row), [], 'an unchanged item is not flagged');
  assert.deepStrictEqual(changedFields(story, row), [], 'a full snapshot from an older run compares by hash');
  assert.deepStrictEqual(changedFields(leanSnapshot(story), { ...row, hash: itemHash({ ...story, title: 'Other' }) }), ['content']);
  assert.deepStrictEqual(leanSnapshot(row), leanSnapshot(story));
});

test('full snapshots from older runs still diff field by field', () => {
  assert.deepStrictEqual(changedFields(story, { ...story, description: 'Stay signed in for 30 days.' }), ['description']);
  assert.deepStrictEqual(changedFields(story, { ...story, depends_on: [] }), []);
});

test('queue diff reports new, changed, removed, and archived items', () => {
  const queue = {
    groups: [{ id: 'auth-session', state: 'planned', items: [leanSnapshot(story), bug] }],
    archived: [{ id: 'billing', state: 'published', pr: null, items: ['TASK-7'], file: 'queue/archive/2026-11.yml' }],
  };
  const diff = diffQueue(queue, [{ ...story, size: 'l' }, { id: 'TASK-7', type: 'task', priority: 'medium', title: 'Logging' }, { id: 'CHORE-2', type: 'chore', priority: 'low', title: 'Upgrade' }]);
  assert.deepStrictEqual(diff.new, ['CHORE-2']);
  assert.deepStrictEqual(diff.changed, [{ id: 'STORY-1', group: 'auth-session', fields: ['size'] }]);
  assert.deepStrictEqual(diff.removed, [{ id: 'BUG-3', group: 'auth-session' }]);
  assert.deepStrictEqual(diff.archived, [{ id: 'TASK-7', group: 'billing' }]);
  assert.strictEqual(diff.unchanged, 0);
});

test('queue status counts parked groups as active and finished groups as not', () => {
  const missing = workspace();
  assert.strictEqual(queueStatus(missing).active, false);
  assert.strictEqual(queueStatus(missing).queue, null);

  const finished = workspace({ groups: [{ id: 'a', state: 'done' }, { id: 'b', state: 'skipped' }] });
  assert.strictEqual(queueStatus(finished).active, false);
  assert.deepStrictEqual(queueStatus(finished).finished, ['a', 'b']);

  const parked = workspace({ source: 'local', base: 'main', groups: [{ id: 'export', state: 'parked', reason: 'waiting on auth-session', items: [bug] }, { id: 'a', state: 'done' }] });
  const status = queueStatus(parked);
  assert.strictEqual(status.active, true);
  assert.deepStrictEqual(status.counts, { parked: 1, done: 1 });
  assert.deepStrictEqual(status.groups, [{ id: 'export', state: 'parked', lane: null, reason: 'waiting on auth-session', branch: null, worktree: null, pr: null, stacked_on: null, items: ['BUG-3'] }]);
  assert.ok(!JSON.stringify(status).includes('Redirects to sign-in'), 'status carries no item text');

  const awaitingMerge = workspace({ groups: [{ id: 'auth-session', state: 'published', pr: 'https://example.test/pr/1' }, { id: 'a', state: 'done' }] });
  assert.strictEqual(queueStatus(awaitingMerge).active, false, 'published groups wait only for a merge');
  assert.deepStrictEqual(queueStatus(awaitingMerge).groups.map(group => group.id), ['auth-session'], 'they are still listed');
});

test('queue ids that are not kebab-case are rejected, so they never become paths', () => {
  const root = workspace({ groups: [{ id: '../../etc', state: 'done' }] });
  assert.throws(() => readQueue(path.join(root, '.architecture-guard', 'queue.yml')), /not lowercase kebab-case/);
});

test('queue root resolves to the main checkout from a linked worktree', () => {
  const main = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ag-queue-main-')));
  git(main, 'init', '-b', 'main');
  git(main, 'config', 'user.email', 'test@example.com');
  git(main, 'config', 'user.name', 'Test');
  fs.mkdirSync(path.join(main, '.architecture-guard'));
  fs.writeFileSync(path.join(main, '.architecture-guard', 'config.yml'), 'schema_version: "1.0"\n');
  git(main, 'add', '.');
  git(main, 'commit', '-m', 'init');
  const linked = `${main}-wt`;
  git(main, 'worktree', 'add', '-b', 'feat/x', linked);
  try {
    assert.strictEqual(queueRoot(linked), main);
    assert.strictEqual(queueRoot(main), main);
  } finally {
    fs.rmSync(linked, { recursive: true, force: true });
    fs.rmSync(main, { recursive: true, force: true });
  }
});

test('queue root resolves to the enclosing workspace from a worktree of a listed application repository', () => {
  const ws = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ag-queue-ws-')));
  fs.mkdirSync(path.join(ws, '.architecture-guard'));
  fs.writeFileSync(path.join(ws, '.architecture-guard', 'config.yml'), 'schema_version: "1.0"\nrepositories:\n  - name: app\n    path: src\n    roles: [code]\n');
  const app = path.join(ws, 'src');
  fs.mkdirSync(app);
  git(app, 'init', '-b', 'main');
  git(app, 'config', 'user.email', 'test@example.com');
  git(app, 'config', 'user.name', 'Test');
  fs.writeFileSync(path.join(app, 'index.ts'), 'export {};\n');
  git(app, 'add', '.');
  git(app, 'commit', '-m', 'init');
  const linked = `${ws}-group-wt`;
  git(app, 'worktree', 'add', '-b', 'feat/group', linked);
  try {
    assert.strictEqual(queueRoot(linked), ws);
    assert.strictEqual(queueRoot(app), ws);
  } finally {
    fs.rmSync(linked, { recursive: true, force: true });
    fs.rmSync(ws, { recursive: true, force: true });
  }
});

test('archive moves finished and merged groups out, keeps their item ids, and moves discovery summaries', () => {
  const root = workspace({
    source: 'local',
    groups: [
      { id: 'auth-session', state: 'published', pr: 'https://example.test/pr/1', items: [leanSnapshot(story)] },
      { id: 'passkeys', state: 'done', items: [{ id: 'SPIKE-1', type: 'spike', priority: 'medium' }] },
      { id: 'export', state: 'implementing', items: [bug] },
    ],
  });
  fs.writeFileSync(path.join(root, '.architecture-guard', 'queue', 'passkeys.discovery.md'), '# summary\n');
  const now = new Date('2026-11-28T00:00:00Z');

  const dry = archiveGroups(root, ['auth-session'], { dryRun: true, now });
  assert.deepStrictEqual(dry.groups, ['auth-session', 'passkeys']);
  assert.strictEqual(readQueue(path.join(root, '.architecture-guard', 'queue.yml')).groups.length, 3, 'dry run writes nothing');

  archiveGroups(root, ['auth-session'], { now });
  const queue = readQueue(path.join(root, '.architecture-guard', 'queue.yml'));
  assert.deepStrictEqual(queue.groups.map(group => group.id), ['export']);
  assert.deepStrictEqual(queue.archived, [
    { id: 'auth-session', state: 'published', pr: 'https://example.test/pr/1', items: ['STORY-1'], file: 'queue/archive/2026-11.yml', discovery: null },
    { id: 'passkeys', state: 'done', pr: null, items: ['SPIKE-1'], file: 'queue/archive/2026-11.yml', discovery: 'queue/archive/passkeys.discovery.md' },
  ]);
  const archive = parse(fs.readFileSync(path.join(root, '.architecture-guard', 'queue', 'archive', '2026-11.yml'), 'utf8'));
  assert.deepStrictEqual(archive.groups.map((group: { id: string }) => group.id), ['auth-session', 'passkeys']);
  assert.ok(fs.existsSync(path.join(root, '.architecture-guard', 'queue', 'archive', 'passkeys.discovery.md')));
  assert.ok(!fs.existsSync(path.join(root, '.architecture-guard', 'queue', 'passkeys.discovery.md')));

  // A resume never plans archived items again
  assert.deepStrictEqual(diffQueue(queue, [story, bug]).archived, [{ id: 'STORY-1', group: 'auth-session' }]);
});

test('a reused group id with the same fields is a new archive and keeps the earlier summary', () => {
  const now = new Date('2026-11-28T00:00:00Z');
  const group = { id: 'passkeys', state: 'done', items: [{ id: 'SPIKE-1', type: 'spike', priority: 'medium' }] };
  const root = workspace({ groups: [group] });
  const queueDir = path.join(root, '.architecture-guard', 'queue');
  const archiveFile = path.join(queueDir, 'archive', '2026-11.yml');
  // queue.yml was rebuilt after an earlier group with the same id and fields was archived this month
  fs.mkdirSync(path.join(queueDir, 'archive'));
  fs.writeFileSync(path.join(queueDir, 'archive', 'passkeys.discovery.md'), '# first summary\n');
  fs.writeFileSync(archiveFile, stringify({ groups: [{ ...group, archived_at: '2026-11-01T00:00:00.000Z', discovery: 'queue/archive/passkeys.discovery.md' }] }));
  fs.writeFileSync(path.join(queueDir, 'passkeys.discovery.md'), '# second summary\n');

  archiveGroups(root, [], { now });
  assert.strictEqual(fs.readFileSync(path.join(queueDir, 'archive', 'passkeys.discovery.md'), 'utf8'), '# first summary\n', 'the earlier summary is kept');
  assert.strictEqual(fs.readFileSync(path.join(queueDir, 'archive', 'passkeys-2.discovery.md'), 'utf8'), '# second summary\n');
  const records = parse(fs.readFileSync(archiveFile, 'utf8')).groups;
  assert.deepStrictEqual(records.map((record: { discovery: string }) => record.discovery), ['queue/archive/passkeys.discovery.md', 'queue/archive/passkeys-2.discovery.md']);
  const queue = readQueue(path.join(root, '.architecture-guard', 'queue.yml'));
  assert.strictEqual(queue.archived?.[0].discovery, 'queue/archive/passkeys-2.discovery.md');
  assert.ok(!('archiving' in records[1]), 'the stamp stays out of the archive record');
});

test('a retried archive finishes the archive it started without duplicating records', () => {
  const now = new Date('2026-11-28T00:00:00Z');
  const stamp = { at: '2026-11-27T00:00:00.000Z', file: 'queue/archive/2026-11.yml', discovery: 'queue/archive/passkeys-2.discovery.md' };
  const group = { id: 'passkeys', state: 'done', items: [{ id: 'SPIKE-1', type: 'spike', priority: 'medium' }] };
  // The earlier run stamped the group and wrote its record, then stopped before moving the summary and writing queue.yml
  const root = workspace({ groups: [{ ...group, archiving: stamp }] });
  const queueDir = path.join(root, '.architecture-guard', 'queue');
  const archiveFile = path.join(queueDir, 'archive', '2026-11.yml');
  fs.mkdirSync(path.join(queueDir, 'archive'));
  fs.writeFileSync(path.join(queueDir, 'archive', 'passkeys.discovery.md'), '# first summary\n');
  fs.writeFileSync(archiveFile, stringify({ groups: [
    { ...group, archived_at: '2026-11-01T00:00:00.000Z', discovery: 'queue/archive/passkeys.discovery.md' },
    { ...group, archived_at: stamp.at, discovery: stamp.discovery },
  ] }));
  fs.writeFileSync(path.join(queueDir, 'passkeys.discovery.md'), '# second summary\n');

  archiveGroups(root, [], { now });
  assert.strictEqual(parse(fs.readFileSync(archiveFile, 'utf8')).groups.length, 2, 'the retry reuses the record it already wrote');
  assert.strictEqual(fs.readFileSync(path.join(queueDir, 'archive', 'passkeys-2.discovery.md'), 'utf8'), '# second summary\n');
  assert.strictEqual(fs.readFileSync(path.join(queueDir, 'archive', 'passkeys.discovery.md'), 'utf8'), '# first summary\n');
  const queue = readQueue(path.join(root, '.architecture-guard', 'queue.yml'));
  assert.deepStrictEqual(queue.groups, []);
  assert.deepStrictEqual(queue.archived?.map(entry => entry.discovery), ['queue/archive/passkeys-2.discovery.md']);
});

test('a stamp naming a path outside the archive is refused', () => {
  const root = workspace({ groups: [{ id: 'a', state: 'done', archiving: { at: '2026-11-01T00:00:00.000Z', file: '../outside.yml', discovery: null } }] });
  assert.throws(() => archiveGroups(root, []), /outside/);
});

test('archive leaves no temporary files behind', () => {
  const root = workspace({ groups: [{ id: 'a', state: 'done' }, { id: 'b', state: 'implementing' }] });
  archiveGroups(root, [], { now: new Date('2026-11-28T00:00:00Z') });
  const leftovers = [path.join(root, '.architecture-guard'), path.join(root, '.architecture-guard', 'queue', 'archive')]
    .flatMap(dir => fs.readdirSync(dir).filter(name => name.endsWith('.tmp')));
  assert.deepStrictEqual(leftovers, []);
  assert.deepStrictEqual(readQueue(path.join(root, '.architecture-guard', 'queue.yml')).groups.map(group => group.id), ['b']);
});

test('archive keeps a skipped group that a remaining group is stacked on, and archives the rest', () => {
  const root = workspace({ groups: [
    { id: 'parent', state: 'skipped' },
    { id: 'grandparent', state: 'done' },
    { id: 'middle', state: 'done', stacked_on: 'grandparent' },
    { id: 'child', state: 'parked', reason: 'waiting on parent', stacked_on: 'parent' },
    { id: 'finished', state: 'done' },
  ] });
  const result = archiveGroups(root, [], { now: new Date('2026-11-28T00:00:00Z') });
  assert.deepStrictEqual(result.kept, ['parent']);
  assert.deepStrictEqual(result.groups, ['grandparent', 'middle', 'finished']);
  const queue = readQueue(path.join(root, '.architecture-guard', 'queue.yml'));
  assert.deepStrictEqual(queue.groups.map(group => group.id), ['parent', 'child']);
});

test('archive keeps a whole chain of finished groups under a remaining stacked group', () => {
  const root = workspace({ groups: [
    { id: 'base', state: 'done' },
    { id: 'skipped-mid', state: 'skipped', stacked_on: 'base' },
    { id: 'child', state: 'parked', stacked_on: 'skipped-mid' },
  ] });
  const result = archiveGroups(root, []);
  assert.deepStrictEqual([...result.kept].sort(), ['base', 'skipped-mid']);
  assert.deepStrictEqual(result.groups, []);
});

test('a dry-run archive creates nothing', () => {
  const root = workspace({ groups: [{ id: 'a', state: 'done' }] });
  archiveGroups(root, [], { dryRun: true });
  assert.ok(!fs.existsSync(path.join(root, '.architecture-guard', 'queue', 'archive')));
});

test('archive refuses groups that are still in flight', () => {
  const root = workspace({ groups: [{ id: 'export', state: 'implementing', items: [bug] }] });
  assert.throws(() => archiveGroups(root, ['export']), /only published groups whose work has merged/);
  assert.throws(() => archiveGroups(root, ['missing']), /not in/);
});

test('backlog list gives compact rows with hashes, show gives full items, and large backlogs warn', () => {
  const root = workspace();
  const file = path.join(root, '.architecture-guard', 'backlog.yml');
  fs.copyFileSync(path.join(__dirname, '..', 'examples', 'backlog.yml'), file);
  const cwd = process.cwd();
  process.chdir(root);
  try {
    const rows = listBacklog(file);
    assert.strictEqual(rows.length, 5);
    assert.deepStrictEqual(rows[0], { id: 'STORY-1', type: 'story', priority: 'high', size: 'm', group: 'auth-session', depends_on: [], title: 'Remember me on sign-in', hash: itemHash(validateBacklog(file).items[0]) });
    assert.ok(!JSON.stringify(rows).includes('trusted devices'), 'list carries no description');
    assert.strictEqual(showBacklog(file, ['STORY-1'])[0].description, 'Let users stay signed in for 30 days on trusted devices.');
    assert.throws(() => showBacklog(file, ['NOPE-1']), /Unknown backlog item NOPE-1/);
    assert.strictEqual(backlogSizeWarning(file, validateBacklog(file)), null);

    const items = Array.from({ length: BACKLOG_WARN_ITEMS + 1 }, (_, index) => ({ id: `TASK-${index}`, type: 'task', priority: 'low', title: `Task ${index}` }));
    fs.writeFileSync(file, stringify({ items }));
    assert.match(backlogSizeWarning(file, validateBacklog(file)) ?? '', /201 items.*architecture-guard backlog list/);
  } finally {
    process.chdir(cwd);
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('queue snapshot reads items piped from another process', () => {
  const root = workspace();
  const items = path.join(root, 'items.json');
  fs.writeFileSync(items, JSON.stringify([story]));
  const cli = path.join(__dirname, 'bin', 'cli.js');
  try {
    const result = spawnSync('sh', ['-c', `(sleep 0.3; cat "${items}") | "${process.execPath}" "${cli}" queue snapshot`], { cwd: root, encoding: 'utf8' });
    assert.strictEqual(result.status, 0, result.stderr);
    assert.deepStrictEqual(JSON.parse(result.stdout), [leanSnapshot(story)]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('stdin reading retries EAGAIN from a non-blocking pipe instead of failing', () => {
  const original = fs.readSync;
  const chunks = [Buffer.from('[{"id":'), Buffer.from('"A"}]')];
  let calls = 0;
  (fs as { readSync: unknown }).readSync = (_fd: number, buffer: Buffer) => {
    calls += 1;
    if (calls === 1) throw Object.assign(new Error('EAGAIN: resource temporarily unavailable, read'), { code: 'EAGAIN' });
    const next = chunks.shift();
    if (!next) return 0;
    next.copy(buffer);
    return next.length;
  };
  try {
    assert.strictEqual(readStdin(99), '[{"id":"A"}]');
    assert.strictEqual(calls, 4);
  } finally {
    (fs as { readSync: unknown }).readSync = original;
  }
});
