import { execFileSync } from 'child_process';
import fs from 'node:fs';

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function tryGit(args: string[]) {
  try {
    return git(args).trim();
  } catch {
    return null;
  }
}

// Default-branch candidates in order: origin's HEAD, any other remote's HEAD, the configured init.defaultBranch, then common names.
function defaultBranchCandidates() {
  const remoteHeads = (tryGit(['for-each-ref', '--format=%(refname) %(symref:short)', 'refs/remotes']) ?? '')
    .split('\n')
    .map(line => line.split(' '))
    .filter(([ref, target]) => ref.endsWith('/HEAD') && target)
    .sort(([a], [b]) => Number(b === 'refs/remotes/origin/HEAD') - Number(a === 'refs/remotes/origin/HEAD'))
    .map(([, target]) => target);
  const configured = tryGit(['config', '--get', 'init.defaultBranch']);
  const names = [...(configured ? [configured] : []), 'main', 'master'];
  return [...remoteHeads, ...names.flatMap(name => [`origin/${name}`, name])];
}

// The review base is the merge-base with the default branch, so committed work on a feature branch is included.
function resolveBase(explicitBase?: string) {
  const candidates = explicitBase ? [explicitBase] : defaultBranchCandidates();
  for (const candidate of candidates) {
    if (!candidate || tryGit(['rev-parse', '--verify', '--quiet', `${candidate}^{commit}`]) === null) continue;
    const mergeBase = tryGit(['merge-base', candidate, 'HEAD']);
    if (mergeBase) return mergeBase;
  }
  if (explicitBase) throw new Error(`base ref not found or unrelated to HEAD: ${explicitBase}`);
  // A repository without commits has no committed changes to miss.
  if (tryGit(['rev-parse', '--verify', '--quiet', 'HEAD^{commit}']) === null) return null;
  throw new Error('could not determine the default branch to compare against; pass --base <ref> (use --base HEAD to list only uncommitted changes)');
}

function committedFiles(base: string | null) {
  if (!base) return [];
  return git(['diff', '--name-only', '-z', base, 'HEAD']).split('\0').filter(Boolean);
}

// Porcelain v1 with -z prints renames/copies as "XY new\0old\0"; only the new path is reviewable.
function workingTreeFiles() {
  const fields = git(['status', '--porcelain=v1', '-z', '--untracked-files=all']).split('\0');
  const files: string[] = [];
  for (let i = 0; i < fields.length; i++) {
    const entry = fields[i];
    if (!entry) continue;
    files.push(entry.slice(3));
    if (entry[0] === 'R' || entry[0] === 'C') i++;
  }
  return files;
}

export function detectChangedFiles(base?: string) {
  const root = git(['rev-parse', '--show-toplevel']).trim();
  const previousCwd = process.cwd();
  process.chdir(root);
  try {
    const all = new Set([...committedFiles(resolveBase(base)), ...workingTreeFiles()]);
    // Deleted files cannot be reviewed; keep only paths that still exist.
    return [...all].filter(file => fs.existsSync(file)).sort();
  } finally {
    process.chdir(previousCwd);
  }
}

export function runDetectChangedFiles(opts: any) {
  if (!opts.json) {
    console.log("Detecting changed files...");
  }
  try {
    const files = detectChangedFiles(opts.base);
    if (opts.json) {
      console.log(JSON.stringify(files));
    } else {
      console.log(files.join("\n"));
    }
  } catch (error) {
    if (opts.json) {
      console.error(JSON.stringify({ error: String(error) }));
      process.exit(1);
    } else {
      console.error("Failed to detect changed files", error);
      process.exitCode = 1;
    }
  }
}
