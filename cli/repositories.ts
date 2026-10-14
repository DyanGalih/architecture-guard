import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

// A workspace is the directory holding `.architecture-guard/` (rules, constitutions, configuration, specifications).
// It may wrap application repositories with their own git history and origin, listed under `repositories` in
// `.architecture-guard/config.yml`. Without that key the workspace is the only repository.
export interface Repository {
  name: string;
  path: string;
  roles: string[];
  forge?: string;
  absolutePath: string;
}

export const REPOSITORY_NAME = /^[a-z0-9][a-z0-9._-]*$/i;
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'vendor', 'dist', 'build', '.git', '.architecture-guard']);

export function readWorkspaceConfig(workspace: string): any {
  const configPath = path.join(workspace, '.architecture-guard', 'config.yml');
  if (!fs.existsSync(configPath)) return null;
  try {
    return parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return null;
  }
}

export function toPosixPath(value: string) {
  return value.split(path.sep).join('/').replace(/^\.\//, '').replace(/\/+$/, '');
}

// Raw entries as written, for validation; usable entries only from configuredRepositories().
export function rawRepositoryEntries(workspace: string): any[] {
  const value = readWorkspaceConfig(workspace)?.repositories;
  return Array.isArray(value) ? value : [];
}

export function insideWorkspace(workspace: string, repositoryPath: string) {
  const relative = path.relative(path.resolve(workspace), path.resolve(workspace, repositoryPath));
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function configuredRepositories(workspace: string): Repository[] {
  return rawRepositoryEntries(workspace)
    .filter(entry => entry && typeof entry.name === 'string' && REPOSITORY_NAME.test(entry.name)
      && typeof entry.path === 'string' && insideWorkspace(workspace, entry.path))
    .map(entry => ({
      name: entry.name,
      path: toPosixPath(path.normalize(entry.path)),
      roles: Array.isArray(entry.roles) && entry.roles.length ? entry.roles.map(String) : ['code'],
      ...(typeof entry.forge === 'string' ? { forge: entry.forge } : {}),
      absolutePath: path.resolve(workspace, entry.path),
    }));
}

export function isGitRepository(directory: string) {
  return fs.existsSync(path.join(directory, '.git'));
}

// Git repositories below the workspace (a `.git` directory or file), not descending into one once found.
export function detectNestedRepositories(workspace: string, maxDepth = 2): string[] {
  const found: string[] = [];
  const walk = (directory: string, depth: number) => {
    if (depth > maxDepth) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const child = path.join(directory, entry.name);
      // A `.git` file marks a submodule or worktree, which belongs to its parent repository; only standalone
      // repositories (a `.git` directory) are application repositories of the workspace.
      const gitPath = path.join(child, '.git');
      if (fs.existsSync(gitPath) && fs.statSync(gitPath).isDirectory()) found.push(toPosixPath(path.relative(workspace, child)));
      else walk(child, depth + 1);
    }
  };
  walk(workspace, 1);
  return found.sort();
}

// The configured repository that holds a workspace-relative path (longest matching path), or null for the workspace.
export function owningRepository(repositories: Repository[], relativePath: string) {
  const file = toPosixPath(relativePath);
  return repositories
    .filter(repository => file === repository.path || file.startsWith(`${repository.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0] || null;
}

// From a git toplevel, the workspace that governs it: the nearest ancestor whose `repositories` lists it (even when
// the repository has its own `.architecture-guard/`, as a standalone checkout of it would), otherwise itself.
// `repository` is set when the toplevel is a configured repository of an enclosing workspace.
export function resolveWorkspace(toplevel: string): { workspace: string; repository: Repository | null } {
  const top = path.resolve(toplevel);
  for (let directory = path.dirname(top); path.dirname(directory) !== directory; directory = path.dirname(directory)) {
    if (!fs.existsSync(path.join(directory, '.architecture-guard'))) continue;
    const repository = configuredRepositories(directory).find(entry => entry.absolutePath === top) || null;
    if (repository) return { workspace: directory, repository };
  }
  return { workspace: top, repository: null };
}

export function gitToplevel(directory: string) {
  return execFileSync('git', ['-C', directory, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
