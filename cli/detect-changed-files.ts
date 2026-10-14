import { execFileSync } from 'child_process';
import fs from 'node:fs';
import { parse } from 'yaml';
import { globMatches } from './hygiene';

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

// The review base is the merge-base with the default branch, so committed work on a feature branch is included.
function resolveBase(explicitBase?: string) {
  const candidates = explicitBase
    ? [explicitBase]
    : [tryGit(['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD']), 'origin/main', 'origin/master', 'main', 'master'];
  for (const candidate of candidates) {
    if (!candidate || tryGit(['rev-parse', '--verify', '--quiet', `${candidate}^{commit}`]) === null) continue;
    const mergeBase = tryGit(['merge-base', candidate, 'HEAD']);
    if (mergeBase) return mergeBase;
  }
  if (explicitBase) throw new Error(`base ref not found or unrelated to HEAD: ${explicitBase}`);
  return null;
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

// Globs from `security_sensitive_paths` in .architecture-guard/config.yml (repository root). Skills that change one of
// these files must run the host Security Review again before committing (F1: an auth rule changed in a review fix).
export function securitySensitivePatterns(root: string): string[] {
  const configPath = `${root}/.architecture-guard/config.yml`;
  if (!fs.existsSync(configPath)) return [];
  const value = parse(fs.readFileSync(configPath, 'utf8'))?.security_sensitive_paths;
  return Array.isArray(value) ? value.filter((pattern): pattern is string => typeof pattern === 'string' && pattern.trim() !== '') : [];
}

export function securitySensitiveFiles(files: string[], patterns: string[]) {
  return files.filter(file => patterns.some(pattern => globMatches(file, pattern.trim())));
}

export function runDetectChangedFiles(opts: any) {
  if (!opts.json) {
    console.log("Detecting changed files...");
  }
  try {
    let files = detectChangedFiles(opts.base);
    if (opts.securitySensitive) {
      files = securitySensitiveFiles(files, securitySensitivePatterns(git(['rev-parse', '--show-toplevel']).trim()));
    }
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
