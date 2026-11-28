import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { insideWorkspace, locateWorkspace, resolveWorkspace } from './repositories';

// Run state of ag-governed-backlog (orchestration/governed-backlog.md ## Run State). Only that skill changes it; this
// module reads it, computes lean item snapshots and diffs, and archives finished groups when the skill asks.

export const FINISHED_STATES = ['done', 'skipped'] as const;
// Delivered and waiting only for a merge: listed by `queue status`, but they do not keep the queue active.
export const AWAITING_MERGE_STATE = 'published';
const GROUP_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTENT_FIELDS = ['title', 'description', 'acceptance', 'origins', 'criterion_mappings'] as const;
const DIRECT_FIELDS = ['type', 'priority', 'size', 'depends_on'] as const;

type Item = Record<string, unknown> & { id: string };
type Group = Record<string, unknown> & { id: string; state?: string; items?: Item[] };
// Written on a group before its archive starts; paths are relative to .architecture-guard/
type Archiving = { at: string; file: string; discovery: string | null };
type ArchivedGroup = { id: string; state: string; pr: string | null; items: string[]; file: string; discovery?: string | null };
type Queue = Record<string, unknown> & { groups: Group[]; archived?: ArchivedGroup[] };

// The user's checkout holds queue.yml; from a linked worktree, map the workspace back to the main worktree. When that
// main worktree is an application repository listed under an enclosing workspace, queue.yml is in that workspace.
export function queueRoot(cwd: string): string {
  const { workspace } = locateWorkspace(cwd);
  try {
    const git = (...args: string[]) => execFileSync('git', ['-C', cwd, 'rev-parse', '--path-format=absolute', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    const commonDir = git('--git-common-dir');
    const gitDir = git('--git-dir');
    if (path.resolve(commonDir) === path.resolve(gitDir) || path.basename(commonDir) !== '.git') return workspace;
    const top = execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    const mainTop = path.dirname(commonDir);
    const enclosing = resolveWorkspace(mainTop);
    if (enclosing.repository) return enclosing.workspace;
    return path.join(mainTop, path.relative(top, workspace));
  } catch {
    return workspace;
  }
}

export const queuePath = (root: string) => path.join(root, '.architecture-guard', 'queue.yml');

export function readQueue(file: string): Queue {
  let parsed: unknown;
  try {
    parsed = parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`Unreadable queue ${file}`, { cause: e });
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as Queue).groups)) {
    throw new Error(`Unreadable queue ${file}: expected a groups list`);
  }
  const queue = parsed as Queue;
  for (const group of queue.groups) {
    if (!group || typeof group.id !== 'string' || !GROUP_ID.test(group.id)) {
      throw new Error(`Unreadable queue ${file}: group id ${JSON.stringify(group?.id)} is not lowercase kebab-case`);
    }
  }
  return queue;
}

// Line endings and surrounding whitespace differ between sources and copies; key order never matters.
function normalize(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/\r\n?/g, '\n').trim();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map(key => [key, normalize(record[key])]));
  }
  return value;
}

const contentOf = (item: Record<string, unknown>) => ({
  title: item.title ?? '',
  description: item.description ?? '',
  acceptance: item.acceptance ?? [],
  origins: item.origins ?? [],
  criterion_mappings: item.criterion_mappings ?? [],
});

export function itemHash(item: Record<string, unknown>): string {
  const digest = createHash('sha256').update(JSON.stringify(normalize(contentOf(item)))).digest('hex');
  return `sha256:${digest.slice(0, 16)}`;
}

// A compact `backlog list` row has no text but carries the hash of it; never recompute that from the missing text.
const contentHash = (item: Record<string, unknown>) => (typeof item.hash === 'string' ? item.hash : itemHash(item));

// The lean snapshot keeps what ordering and lanes need, plus a hash of the text a resume must notice changing.
export function leanSnapshot(item: Item) {
  return {
    id: item.id,
    type: item.type,
    priority: item.priority,
    ...(item.size !== undefined ? { size: item.size } : {}),
    depends_on: [...((item.depends_on as string[] | undefined) ?? [])],
    hash: contentHash(item),
  };
}

const same = (a: unknown, b: unknown) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
const sortedDeps = (value: unknown) => [...((value as string[] | undefined) ?? [])].sort();

// Snapshots written before lean snapshots carry the full text; compare those field by field.
export function changedFields(snapshot: Record<string, unknown>, item: Record<string, unknown>): string[] {
  const fields: string[] = [];
  for (const field of DIRECT_FIELDS) {
    const changed = field === 'depends_on' ? !same(sortedDeps(snapshot[field]), sortedDeps(item[field])) : !same(snapshot[field] ?? null, item[field] ?? null);
    if (changed) fields.push(field);
  }
  if (typeof snapshot.hash === 'string') {
    if (snapshot.hash !== contentHash(item)) fields.push('content');
  } else if (typeof item.hash === 'string') {
    // A full snapshot from an older run against a compact row: compare the hashes of the text
    if (itemHash(snapshot) !== item.hash) fields.push('content');
  } else {
    const before = contentOf(snapshot);
    const after = contentOf(item);
    for (const field of CONTENT_FIELDS) if (!same(before[field], after[field])) fields.push(field);
  }
  return fields;
}

const isHygieneItem = (group: string, id: string) => id.startsWith(`${group}-hygiene-`) && /^\d+$/.test(id.slice(group.length + '-hygiene-'.length));

export function diffQueue(queue: Queue, items: Item[]) {
  const recorded = new Map<string, { group: string; snapshot: Item }>();
  for (const group of queue.groups) for (const snapshot of group.items ?? []) recorded.set(snapshot.id, { group: group.id, snapshot });
  const archived = new Map<string, string>();
  for (const entry of queue.archived ?? []) for (const id of entry.items) archived.set(id, entry.id);

  const seen = new Set<string>();
  const result = { new: [] as string[], changed: [] as { id: string; group: string; fields: string[] }[], removed: [] as { id: string; group: string }[], archived: [] as { id: string; group: string }[], unchanged: 0 };
  for (const item of items) {
    seen.add(item.id);
    const entry = recorded.get(item.id);
    if (entry) {
      const fields = changedFields(entry.snapshot, item);
      if (fields.length) result.changed.push({ id: item.id, group: entry.group, fields });
      else result.unchanged += 1;
    } else if (archived.has(item.id)) {
      result.archived.push({ id: item.id, group: archived.get(item.id)! });
    } else {
      result.new.push(item.id);
    }
  }
  // Gate Q's widen items (`<group>-hygiene-<n>`) are approved locally and never exist in the source, so their absence is
  // not a removal.
  for (const [id, entry] of recorded) if (!seen.has(id) && !isHygieneItem(entry.group, id)) result.removed.push({ id, group: entry.group });
  return result;
}

export function queueStatus(root: string) {
  const file = queuePath(root);
  if (!fs.existsSync(file)) return { queue: null, active: false, counts: {}, groups: [], finished: [], archived: 0 };
  const queue = readQueue(file);
  const counts: Record<string, number> = {};
  const groups = [];
  const finished: string[] = [];
  for (const group of queue.groups) {
    const state = String(group.state ?? 'unknown');
    counts[state] = (counts[state] ?? 0) + 1;
    if ((FINISHED_STATES as readonly string[]).includes(state)) {
      finished.push(group.id);
      continue;
    }
    groups.push({
      id: group.id,
      state,
      lane: group.lane ?? null,
      reason: group.reason ?? null,
      branch: group.branch ?? null,
      worktree: group.worktree ?? null,
      pr: group.pr ?? null,
      stacked_on: group.stacked_on ?? null,
      items: (group.items ?? []).map(item => item.id),
    });
  }
  return { queue: file, source: queue.source ?? null, base: queue.base ?? null, active: groups.some(group => group.state !== AWAITING_MERGE_STATE), counts, groups, finished, archived: (queue.archived ?? []).length };
}

// Moves finished groups, and published groups the caller confirmed merged, out of queue.yml. Their item ids stay in
// an `archived` index so a resume never plans those items again.
// Write to a temporary file beside the target and rename it over the target, so an interrupted write never leaves a
// truncated queue.yml or archive file (the same pattern as cli/codex-config.ts).
function writeFileAtomic(target: string, content: string) {
  const temp = path.join(path.dirname(target), `.${path.basename(target)}.${randomUUID()}.tmp`);
  try {
    fs.writeFileSync(temp, content, { flag: 'wx' });
    fs.renameSync(temp, target);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

export function archiveGroups(root: string, mergedGroups: string[], options: { dryRun?: boolean; now?: Date } = {}) {
  const file = queuePath(root);
  const queue = readQueue(file);
  for (const id of mergedGroups) {
    const group = queue.groups.find(candidate => candidate.id === id);
    if (!group) throw new Error(`Group ${id} is not in ${file}`);
    if (group.state !== 'published' && !(FINISHED_STATES as readonly string[]).includes(String(group.state))) {
      throw new Error(`Group ${id} is ${group.state}; only published groups whose work has merged, and done or skipped groups, can be archived`);
    }
  }
  // A stamped group was being archived when an earlier run stopped, so it moves again without being named.
  const moving = queue.groups.filter(group => (FINISHED_STATES as readonly string[]).includes(String(group.state)) || mergedGroups.includes(group.id) || group.archiving !== undefined);
  // A done or skipped group that a remaining group is still stacked on stays in queue.yml, so Gate Q can show the
  // unmet stacking (a skipped parent never satisfies it); it is archived once nothing stacks on it.
  const kept: string[] = [];
  for (let changed = true; changed;) {
    changed = false;
    for (const group of [...moving]) {
      if (group.state === AWAITING_MERGE_STATE || group.archiving !== undefined) continue;
      if (queue.groups.some(other => !moving.includes(other) && other.stacked_on === group.id)) {
        moving.splice(moving.indexOf(group), 1);
        kept.push(group.id);
        changed = true;
      }
    }
  }
  const stillReferenced = queue.groups.filter(group => !moving.includes(group) && moving.some(moved => moved.id === group.stacked_on && moved.state !== 'published'));
  if (stillReferenced.length) throw new Error(`Groups ${stillReferenced.map(group => group.id).join(', ')} are stacked on a group being archived`);

  const archivedAt = (options.now ?? new Date()).toISOString();
  const archiveDir = path.join(root, '.architecture-guard', 'queue', 'archive');
  const relative = (target: string) => path.relative(path.join(root, '.architecture-guard'), target).split(path.sep).join('/');
  const inArchive = (recordedPath: string) => {
    const full = path.join(root, '.architecture-guard', recordedPath);
    if (path.dirname(full) !== archiveDir) throw new Error(`Archive path ${recordedPath} is outside ${archiveDir}`);
    return full;
  };
  // Names already used, on disk or by an archive another group has started
  const taken = new Set([
    ...(fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir) : []),
    ...queue.groups.map(group => (group.archiving as Archiving | undefined)?.discovery).filter((name): name is string => typeof name === 'string').map(name => path.basename(name)),
  ]);

  const plan = moving.map(group => {
    const source = path.join(root, '.architecture-guard', 'queue', `${group.id}.discovery.md`);
    // An archive that stopped part way left its stamp on the group: finish that archive instead of starting another.
    // A group without one is a new archive instance, even when an earlier group had the same id and fields.
    let stamp = group.archiving as Archiving | undefined;
    if (!stamp) {
      let discovery: string | null = null;
      if (fs.existsSync(source)) {
        // A reused group id must not overwrite an earlier summary.
        let name = `${group.id}.discovery.md`;
        for (let n = 2; taken.has(name); n += 1) name = `${group.id}-${n}.discovery.md`;
        taken.add(name);
        discovery = relative(path.join(archiveDir, name));
      }
      stamp = { at: archivedAt, file: relative(path.join(archiveDir, `${archivedAt.slice(0, 7)}.yml`)), discovery };
    }
    inArchive(stamp.file);
    if (stamp.discovery) inArchive(stamp.discovery);
    return { group, stamp, source: fs.existsSync(source) ? source : null };
  });
  const result = {
    archive: plan.length ? inArchive(plan[0].stamp.file) : path.join(archiveDir, `${archivedAt.slice(0, 7)}.yml`),
    groups: plan.map(entry => entry.group.id),
    kept,
    discoveryMoved: plan.filter(entry => entry.source).map(entry => entry.group.id),
    dryRun: Boolean(options.dryRun),
  };
  if (options.dryRun || moving.length === 0) return result;

  // Stamp first, so a retry after a crash recognizes its own records and summary paths.
  for (const entry of plan) entry.group.archiving = entry.stamp;
  writeFileAtomic(file, stringify(queue));

  fs.mkdirSync(archiveDir, { recursive: true });
  const files = new Map<string, Group[]>();
  for (const { group, stamp } of plan) {
    const archiveFile = inArchive(stamp.file);
    if (!files.has(archiveFile)) {
      const existing = fs.existsSync(archiveFile) ? (parse(fs.readFileSync(archiveFile, 'utf8')) as { groups?: Group[] } | null) : null;
      files.set(archiveFile, existing?.groups ?? []);
    }
    const records = files.get(archiveFile)!;
    if (!records.some(record => record.id === group.id && record.archived_at === stamp.at)) {
      const { archiving: _stamp, ...rest } = group;
      records.push({ ...rest, archived_at: stamp.at, discovery: stamp.discovery });
    }
  }
  for (const [archiveFile, records] of files) writeFileAtomic(archiveFile, stringify({ groups: records }));
  for (const { source, stamp } of plan) {
    if (source && stamp.discovery && !fs.existsSync(inArchive(stamp.discovery))) fs.renameSync(source, inArchive(stamp.discovery));
  }
  queue.archived = [
    ...(queue.archived ?? []),
    ...plan.map(({ group, stamp }) => ({ id: group.id, state: String(group.state), pr: (group.pr as string | null | undefined) ?? null, items: (group.items ?? []).map(item => item.id), file: stamp.file, discovery: stamp.discovery })),
  ];
  queue.groups = queue.groups.filter(group => !moving.includes(group));
  writeFileAtomic(file, stringify(queue));
  return result;
}

function readItems(source: string | undefined, cwd: string, stdin: () => string): Item[] {
  let text: string;
  if (!source || source === '-') {
    text = stdin();
  } else {
    const full = path.resolve(cwd, source);
    if (!insideWorkspace(cwd, full)) throw new Error(`Items file ${source} is outside the project root ${cwd}`);
    text = fs.readFileSync(full, 'utf8');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error('Items must be a JSON array of normalized backlog items', { cause: e });
  }
  const items = Array.isArray(parsed) ? parsed : (parsed as { items?: unknown })?.items;
  if (!Array.isArray(items) || items.some(item => !item || typeof (item as Item).id !== 'string')) {
    throw new Error('Items must be a JSON array of normalized backlog items, each with an id');
  }
  return items as Item[];
}

// readFileSync(0) fails with EAGAIN when stdin is a non-blocking pipe whose writer has not finished, which is the
// usual `backlog show ... | queue snapshot` case; read in chunks and wait briefly instead.
export function readStdin(fd = 0): string {
  if (fd === 0 && process.stdin.isTTY) throw new Error('Pipe the items as JSON on stdin, or pass --items <file>');
  const chunks: Buffer[] = [];
  const buffer = Buffer.alloc(64 * 1024);
  const pause = new Int32Array(new SharedArrayBuffer(4));
  for (;;) {
    let read: number;
    try {
      read = fs.readSync(fd, buffer, 0, buffer.length, null);
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code === 'EAGAIN') {
        Atomics.wait(pause, 0, 0, 10);
        continue;
      }
      if (code === 'EOF') break;
      throw e;
    }
    if (read === 0) break;
    chunks.push(Buffer.from(buffer.subarray(0, read)));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function run(action: () => unknown) {
  try {
    process.stdout.write(JSON.stringify(action()) + '\n');
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  }
}

export const runQueueStatus = (cwd = process.cwd()) => run(() => queueStatus(queueRoot(cwd)));

export const runQueueSnapshot = (options: { items?: string }, cwd = process.cwd(), stdin = readStdin) =>
  run(() => readItems(options.items, cwd, stdin).map(leanSnapshot));

export const runQueueDiff = (options: { items?: string }, cwd = process.cwd(), stdin = readStdin) =>
  run(() => {
    const file = queuePath(queueRoot(cwd));
    if (!fs.existsSync(file)) throw new Error(`No queue at ${file}`);
    return diffQueue(readQueue(file), readItems(options.items, cwd, stdin));
  });

export const runQueueArchive = (options: { group?: string[]; dryRun?: boolean }, cwd = process.cwd()) =>
  run(() => archiveGroups(queueRoot(cwd), options.group ?? [], { dryRun: options.dryRun }));
