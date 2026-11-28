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
    { id: 'auth-session', state: 'published', pr: 'https://example.test/pr/1', items: ['STORY-1'], file: 'queue/archive/2026-11.yml' },
    { id: 'passkeys', state: 'done', pr: null, items: ['SPIKE-1'], file: 'queue/archive/2026-11.yml' },
  ]);
  const archive = parse(fs.readFileSync(path.join(root, '.architecture-guard', 'queue', 'archive', '2026-11.yml'), 'utf8'));
  assert.deepStrictEqual(archive.groups.map((group: { id: string }) => group.id), ['auth-session', 'passkeys']);
  assert.ok(fs.existsSync(path.join(root, '.architecture-guard', 'queue', 'archive', 'passkeys.discovery.md')));
  assert.ok(!fs.existsSync(path.join(root, '.architecture-guard', 'queue', 'passkeys.discovery.md')));

  // A resume never plans archived items again
  assert.deepStrictEqual(diffQueue(queue, [story, bug]).archived, [{ id: 'STORY-1', group: 'auth-session' }]);
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
