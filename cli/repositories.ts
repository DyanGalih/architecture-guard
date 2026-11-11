import { execFileSync, spawnSync } from 'node:child_process';
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
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'vendor', 'dist', 'build']);
// Vendored, example and fixture checkouts are not application repositories of the workspace.
const SKIPPED_NAMES = /^(?:third[_-]?party|external|examples?|samples?|fixtures?|tests?|testdata|__tests__)$/i;

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
  return value.split(path.sep).join('/').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
}

// Raw entries as written, for validation; usable entries only from configuredRepositories().
export function rawRepositoryEntries(workspace: string): any[] {
  const value = readWorkspaceConfig(workspace)?.repositories;
  return Array.isArray(value) ? value : [];
}

// The real path with symlinks resolved; for a path that does not exist yet, the nearest existing ancestor is resolved
// and the remaining segments are appended, so a symlinked parent cannot escape either.
function canonicalPath(target: string) {
  const missing: string[] = [];
  let current = path.resolve(target);
  while (!fs.existsSync(current) && path.dirname(current) !== current) {
    missing.unshift(path.basename(current));
    current = path.dirname(current);
  }
  return path.join(fs.realpathSync(current), ...missing);
}

function contains(parent: string, child: string) {
  const relative = path.relative(parent, child);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

// Inside both lexically and after resolving symlinks: a configured path such as `src` may be a symlink to a
// repository elsewhere, which git, hygiene and forge operations would otherwise follow outside the workspace.
export function insideWorkspace(workspace: string, repositoryPath: string) {
  const root = path.resolve(workspace);
  const target = path.resolve(root, repositoryPath);
  return contains(root, target) && contains(canonicalPath(root), canonicalPath(target));
}

// The git repository that holds a workspace-relative path: the nearest ancestor with `.git`, up to `root`, or null
// outside any repository.
export function owningGitRoot(root: string, relative: string): string | null {
  const top = path.resolve(root);
  for (let dir = path.dirname(path.resolve(top, relative)); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    if (dir === top || path.dirname(dir) === dir) return null;
  }
}

// Whether an existing file stays inside the repository that holds it once symlinks are resolved. Git stores a
// symlink as its target path, so a reviewer of that repository cannot open a file it points to elsewhere.
export function resolvesInsideOwningRepository(root: string, relative: string) {
  const owner = owningGitRoot(root, relative) ?? path.resolve(root);
  return contains(canonicalPath(owner), canonicalPath(path.resolve(root, relative)));
}

// Usable entries: a valid name and a path inside the workspace; the first entry wins on a duplicate name or path
// (validate-setup reports duplicates).
export function configuredRepositories(workspace: string): Repository[] {
  const names = new Set<string>();
  const paths = new Set<string>();
  return rawRepositoryEntries(workspace)
    .filter(entry => entry && typeof entry.name === 'string' && REPOSITORY_NAME.test(entry.name)
      && typeof entry.path === 'string' && insideWorkspace(workspace, entry.path.replace(/\\/g, '/')))
    .map(entry => ({ ...entry, path: toPosixPath(path.posix.normalize(entry.path.replace(/\\/g, '/'))) }))
    .filter(entry => {
      if (names.has(entry.name) || paths.has(entry.path)) return false;
      names.add(entry.name);
      paths.add(entry.path);
      return true;
    })
    .map(entry => ({
      name: entry.name,
      path: entry.path,
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
      if (!entry.isDirectory() || entry.name.startsWith('.') || SKIPPED_DIRECTORIES.has(entry.name) || SKIPPED_NAMES.test(entry.name)) continue;
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
// `repository` is set when the toplevel is a configured repository of an enclosing workspace; `unlistedAncestor`
// names the nearest enclosing workspace that does not list it, so callers can warn.
export function resolveWorkspace(toplevel: string): { workspace: string; repository: Repository | null; unlistedAncestor: string | null } {
  const top = path.resolve(toplevel);
  let unlistedAncestor: string | null = null;
  for (let directory = path.dirname(top); path.dirname(directory) !== directory; directory = path.dirname(directory)) {
    if (!fs.existsSync(path.join(directory, '.architecture-guard'))) continue;
    const repository = configuredRepositories(directory).find(entry => entry.absolutePath === top) || null;
    if (repository) return { workspace: directory, repository, unlistedAncestor: null };
    unlistedAncestor = unlistedAncestor || directory;
  }
  return { workspace: top, repository: null, unlistedAncestor };
}

// The workspace for a working directory: through git when inside a repository, otherwise the nearest directory
// holding `.architecture-guard/` (a workspace that is not itself a git repository but wraps repositories).
export function locateWorkspace(cwd: string) {
  let top: string | null = null;
  try {
    top = gitToplevel(cwd);
  } catch {
    // Not inside a git repository: look for a workspace directory instead.
  }
  if (top) {
    const located = resolveWorkspace(top);
    let workspaceIsGit = located.workspace === path.resolve(top);
    if (!workspaceIsGit) {
      try {
        workspaceIsGit = gitToplevel(located.workspace) === path.resolve(located.workspace);
      } catch {
        workspaceIsGit = false;
      }
    }
    return { ...located, workspaceIsGit };
  }
  for (let directory = path.resolve(cwd); ; directory = path.dirname(directory)) {
    if (fs.existsSync(path.join(directory, '.architecture-guard'))) {
      return { workspace: directory, repository: null, unlistedAncestor: null, workspaceIsGit: false };
    }
    if (path.dirname(directory) === directory) throw new Error('Not inside a git repository or an Architecture Guard workspace');
  }
}

export function gitToplevel(directory: string) {
  return execFileSync('git', ['-C', directory, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function gitAdminDir(repoRoot: string): string {
  const root = path.resolve(repoRoot);
  try {
    const commonDir = execFileSync('git', ['-C', root, 'rev-parse', '--git-common-dir'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return path.resolve(root, commonDir);
  } catch {
    return path.join(root, '.git');
  }
}

function assertWorktreeBounds(baseDir: string, targetPath: string): void {
  const root = path.resolve(baseDir);
  const target = path.resolve(targetPath);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Role path escapes target: ${targetPath}`);
  }
}

export interface RoleWorktreeResult {
  worktreePath: string;
  branchName: string;
}

export function assertValidRoleName(roleName: string): void {
  if (!roleName || typeof roleName !== 'string') {
    throw new Error(`Invalid role name: "${roleName}"`);
  }
  if (roleName.includes('..') || roleName.includes('/') || roleName.includes('\\') || path.isAbsolute(roleName)) {
    throw new Error(`Role path escapes target: ${roleName}`);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(roleName)) {
    throw new Error(`Invalid role name: "${roleName}". Must be alphanumeric with underscores or dashes.`);
  }
}

export function assertValidBranchRef(branch: string): void {
  if (typeof branch !== 'string' || !/^[a-zA-Z0-9._/-]+$/.test(branch) || branch.startsWith('-') || branch.includes('..')) {
    throw new Error(`Invalid base branch: ${branch}`);
  }
}

export function sanitizeRoleName(roleName: string): string {
  assertValidRoleName(roleName);
  return roleName.replace(/_/g, '-').replace(/[^a-zA-Z0-9-]/g, '-');
}

export function roleBranchName(roleName: string): string {
  return `agteam/${sanitizeRoleName(roleName)}`;
}

export function roleWorktreePath(repoRoot: string, roleName: string): string {
  const root = path.resolve(repoRoot);
  const adminDir = gitAdminDir(root);
  const sanitized = sanitizeRoleName(roleName);
  const wtPath = path.join(adminDir, 'ag-worktrees', `agteam-${sanitized}`);
  assertWorktreeBounds(adminDir, wtPath);
  return wtPath;
}

export function isWorktreeDirty(wtPath: string): boolean {
  if (!fs.existsSync(wtPath)) return false;
  const gitFile = path.join(wtPath, '.git');
  if (!fs.existsSync(gitFile)) {
    // Not a valid git worktree (stale or empty folder); not dirty
    return false;
  }
  try {
    const status = execFileSync('git', ['-C', wtPath, 'status', '--porcelain'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return status.length > 0;
  } catch {
    return true;
  }
}

export function hasUnmergedRoleCommits(repoRoot: string, roleName: string, baseBranch = 'HEAD'): boolean {
  const root = path.resolve(repoRoot);
  const branchName = roleBranchName(roleName);
  const checkBranch = spawnSync('git', ['-C', root, 'show-ref', '--verify', '--quiet', `refs/heads/${branchName}`], { stdio: 'ignore' });
  if (checkBranch.status !== 0) {
    return false;
  }
  try {
    const revCount = execFileSync('git', ['-C', root, 'rev-list', '--count', `${baseBranch}..${branchName}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return parseInt(revCount, 10) > 0;
  } catch {
    return true;
  }
}

export function createRoleWorktree(repoRoot: string, roleName: string, baseBranch?: string, force = false): RoleWorktreeResult {
  const root = path.resolve(repoRoot);
  if (baseBranch !== undefined) {
    assertValidBranchRef(baseBranch);
  }

  const wtPath = roleWorktreePath(root, roleName);
  const branchName = roleBranchName(roleName);
  const base = baseBranch || 'HEAD';

  if (!force && isWorktreeDirty(wtPath)) {
    throw new Error(`Cannot recreate role worktree at ${wtPath}: worktree has uncommitted changes.`);
  }

  if (!force && hasUnmergedRoleCommits(root, roleName, base)) {
    throw new Error(`Cannot recreate role worktree at ${wtPath}: branch ${branchName} has unmerged commits.`);
  }

  // Prune stale worktree registrations from git metadata
  try {
    execFileSync('git', ['-C', root, 'worktree', 'prune'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    // ignore
  }

  if (fs.existsSync(wtPath)) {
    try {
      execFileSync('git', ['-C', root, 'worktree', 'remove', '--force', wtPath], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch {
      fs.rmSync(wtPath, { recursive: true, force: true });
    }
  }

  const checkBranch = spawnSync('git', ['-C', root, 'show-ref', '--verify', '--quiet', `refs/heads/${branchName}`], { stdio: 'ignore' });
  if (checkBranch.status === 0) {
    try {
      execFileSync('git', ['-C', root, 'branch', '-D', branchName], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err) {
      throw new Error(`Failed to reset branch ${branchName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  fs.mkdirSync(path.dirname(wtPath), { recursive: true });
  execFileSync('git', ['-C', root, 'worktree', 'add', '-b', branchName, wtPath, base], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  return {
    worktreePath: wtPath,
    branchName
  };
}

export function mergeRoleWorktree(repoRoot: string, roleName: string): { success: boolean; merged: boolean; message: string } {
  const root = path.resolve(repoRoot);
  const wtPath = roleWorktreePath(root, roleName);
  const branchName = roleBranchName(roleName);

  if (isWorktreeDirty(root)) {
    return { success: false, merged: false, message: `Cannot merge ${branchName}: main repository has uncommitted changes.` };
  }

  try {
    execFileSync('git', ['-C', root, 'rev-parse', '--verify', `refs/heads/${branchName}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return { success: false, merged: false, message: `Branch ${branchName} does not exist.` };
  }

  if (isWorktreeDirty(wtPath)) {
    return { success: false, merged: false, message: `Cannot merge ${branchName}: worktree has uncommitted changes.` };
  }

  const revCount = execFileSync('git', ['-C', root, 'rev-list', '--count', `HEAD..${branchName}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  if (parseInt(revCount, 10) === 0) {
    return { success: true, merged: false, message: `No commits to merge from ${branchName}` };
  }

  try {
    execFileSync('git', ['-C', root, 'merge', '--no-ff', '-m', `Merge parallel role changes from ${branchName}`, branchName], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { success: true, merged: true, message: `Merged ${branchName} successfully` };
  } catch (err: any) {
    try {
      execFileSync('git', ['-C', root, 'merge', '--abort'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch {
      // ignore
    }
    const errMsg = err instanceof Error ? err.message : String(err);
    return { success: false, merged: false, message: `Merge conflict on ${branchName}: ${errMsg}` };
  }
}

export function cleanupRoleWorktrees(repoRoot: string, force = false): string[] {
  const root = path.resolve(repoRoot);
  const adminDir = gitAdminDir(root);
  const baseDir = path.join(adminDir, 'ag-worktrees');
  if (!fs.existsSync(baseDir)) return [];

  const removed: string[] = [];
  const entries = fs.readdirSync(baseDir);

  for (const entry of entries) {
    const wtPath = path.join(baseDir, entry);
    assertWorktreeBounds(adminDir, wtPath);
    const roleSuffix = entry.startsWith('agteam-') ? entry.slice('agteam-'.length) : entry;
    const branchName = roleBranchName(roleSuffix);

    if (!force) {
      if (isWorktreeDirty(wtPath)) {
        continue;
      }
      if (hasUnmergedRoleCommits(root, roleSuffix)) {
        continue;
      }
    }

    try {
      execFileSync('git', ['-C', root, 'worktree', 'remove', '--force', wtPath], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      removed.push(wtPath);
    } catch {
      try {
        fs.rmSync(wtPath, { recursive: true, force: true });
        removed.push(wtPath);
      } catch {
        // ignore
      }
    }

    try {
      execFileSync('git', ['-C', root, 'branch', '-D', branchName], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch {
      // ignore
    }
  }

  try {
    execFileSync('git', ['-C', root, 'worktree', 'prune'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    // ignore
  }

  return removed;
}
