import { execFileSync } from 'child_process';
import fs from 'node:fs';
import { parse } from 'yaml';
import { globMatches } from './hygiene';
import { configuredRepositories, isGitRepository, locateWorkspace, owningRepository } from './repositories';

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

// Changed files of one git repository, relative to it: committed since the merge-base, plus staged, unstaged and
// untracked files that still exist.
export function changedFilesIn(directory: string, base?: string) {
  const previousCwd = process.cwd();
  process.chdir(directory);
  try {
    const all = new Set([...committedFiles(resolveBase(base)), ...workingTreeFiles()]);
    return [...all].filter(file => fs.existsSync(file)).sort();
  } finally {
    process.chdir(previousCwd);
  }
}

export function detectChangedFiles(base?: string) {
  return changedFilesIn(git(['rev-parse', '--show-toplevel']).trim(), base);
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

// Workspace view: the workspace's own changes plus every configured repository's, as workspace-relative paths
// (`src/app/...`). `repo` limits it to one repository; run inside a configured repository, that repository is
// selected and the workspace's settings still apply. With repositories configured, `base` needs `repo`, because
// each repository has its own history.
export function workspaceChangedFiles(opts: { base?: string; repo?: string; securitySensitive?: boolean }, cwd = process.cwd()) {
  const { workspace, repository: here, unlistedAncestor, workspaceIsGit } = locateWorkspace(cwd);
  const repositories = configuredRepositories(workspace);
  const selected = opts.repo ? repositories.find(repository => repository.name === opts.repo) : here;
  if (opts.repo && !selected) {
    throw new Error(`Unknown repository "${opts.repo}"; configured: ${repositories.map(repository => repository.name).join(', ') || 'none'}`);
  }
  if (selected && !isGitRepository(selected.absolutePath)) {
    throw new Error(`Repository "${selected.name}" (${selected.path}) is not a git repository`);
  }
  if (opts.base && repositories.length && !selected) {
    throw new Error('--base needs --repo when repositories are configured: each repository has its own history');
  }
  const warnings: string[] = [];
  if (opts.securitySensitive && unlistedAncestor) {
    warnings.push(`This repository sits inside the workspace ${unlistedAncestor} but is not listed under repositories in its .architecture-guard/config.yml, so that workspace's security_sensitive_paths do not apply here.`);
  }
  const prefixed = (prefix: string, files: string[]) => files.map(file => `${prefix}/${file}`);
  const insideRepository = (file: string) => repositories.some(repository => file === repository.path || file === `${repository.path}/` || file.startsWith(`${repository.path}/`));
  let files = selected
    ? prefixed(selected.path, changedFilesIn(selected.absolutePath, opts.base))
    : [
      ...(workspaceIsGit ? changedFilesIn(workspace, opts.base).filter(file => !insideRepository(file)) : []),
      ...repositories.filter(repository => isGitRepository(repository.absolutePath))
        .flatMap(repository => prefixed(repository.path, changedFilesIn(repository.absolutePath))),
    ];
  if (opts.securitySensitive) {
    const workspacePatterns = securitySensitivePatterns(workspace);
    const repositoryPatterns = new Map(repositories.map(repository => [repository.path, securitySensitivePatterns(repository.absolutePath)]));
    files = files.filter(file => {
      if (securitySensitiveFiles([file], workspacePatterns).length) return true;
      const owner = owningRepository(repositories, file);
      return Boolean(owner && securitySensitiveFiles([file.slice(owner.path.length + 1)], repositoryPatterns.get(owner.path) || []).length);
    });
  }
  return { files: [...new Set(files)].sort(), warnings };
}

export function runDetectChangedFiles(opts: any) {
  if (!opts.json) {
    console.log("Detecting changed files...");
  }
  try {
    const { files, warnings } = workspaceChangedFiles({ base: opts.base, repo: opts.repo, securitySensitive: opts.securitySensitive });
    for (const warning of warnings) console.error(`Warning: ${warning}`);
    if (opts.json) {
      console.log(JSON.stringify(files));
    } else {
      console.log(files.join("\n"));
    }
  } catch (error) {
    if (opts.json) {
      console.error(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }));
      process.exit(1);
    } else {
      console.error("Failed to detect changed files", error);
      process.exitCode = 1;
    }
  }
}
