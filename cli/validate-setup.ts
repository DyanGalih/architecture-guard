import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { missingAdapterKeys } from './install';
import { listCategoryResources, resolveResource } from './resolve';
import { detectForge, missingForgeKeys } from './forge';
import { REPOSITORY_NAME, configuredRepositories, detectNestedRepositories, insideWorkspace, isGitRepository, rawRepositoryEntries, resolvesInsideOwningRepository } from './repositories';
import { spawnSync } from 'node:child_process';
import { ignoredByOwningRepository } from './hygiene';

type Level = 'pass' | 'warn' | 'fail' | 'info';
type Check = { level: Level; message: string };

// Marker contents become file names; anything else could point outside .architecture-guard/.
const SELECTION_NAME = /^[a-z0-9][a-z0-9-]*$/;

// First backticked value in an adapter Path Map row, or null when the row has no literal path
// (user-provided, unsupported, or templated per feature).
function mappedPath(adapter: string, key: string) {
  const row = adapter.match(new RegExp(`^\\|\\s*${key}\\s*\\|([^\\n]*)$`, 'm'));
  const value = row?.[1].match(/`([^`]+)`/)?.[1];
  if (!value || value.includes('{') || value.includes('<')) return { path: null, optional: false };
  return { path: value, optional: /optional/i.test(row![1]) };
}

// Whether a reviewer can open a governance document: inside the repository (also after resolving symlinks, since git
// stores a symlink as its target path), present, and not gitignored. Tracked files are never reported as ignored, so
// a force-added constitution counts as readable. The repository that holds the
// file decides, so a nested application repository inside an ignoring workspace is judged by its own rules.
function readability(projectRoot: string, file: string): 'readable' | 'outside' | 'missing' | 'ignored' {
  const relative = path.relative(projectRoot, path.resolve(projectRoot, file));
  if (relative.startsWith('..') || path.isAbsolute(relative)) return 'outside';
  if (!fs.existsSync(path.join(projectRoot, relative))) return 'missing';
  if (!resolvesInsideOwningRepository(projectRoot, relative)) return 'outside';
  return ignoredByOwningRepository(projectRoot, relative) ? 'ignored' : 'readable';
}

export function validateSetup(projectRoot: string): Check[] {
  const checks: Check[] = [];
  const add = (level: Level, message: string) => checks.push({ level, message });
  const runtimeDir = path.join(projectRoot, '.architecture-guard');

  const selectedPath = path.join(runtimeDir, 'selected-adapter');
  if (!fs.existsSync(selectedPath)) {
    add('fail', 'No selected adapter (.architecture-guard/selected-adapter). Run `architecture-guard init`.');
    return checks;
  }
  const name = fs.readFileSync(selectedPath, 'utf8').trim();
  if (!SELECTION_NAME.test(name)) {
    add('fail', `.architecture-guard/selected-adapter contains an invalid adapter name "${name}"; use lowercase letters, digits, and hyphens. Rerun \`architecture-guard init\`.`);
    return checks;
  }
  const adapterPath = path.join(runtimeDir, 'adapters', `${name}.md`);
  if (!fs.existsSync(adapterPath)) {
    add('fail', `Selected adapter "${name}" not found at .architecture-guard/adapters/${name}.md. Rerun \`architecture-guard init\`.`);
    return checks;
  }
  const adapter = fs.readFileSync(adapterPath, 'utf8');
  const missing = missingAdapterKeys(adapter);
  if (missing.length) add('fail', `Adapter "${name}" is missing required keys: ${missing.join(', ')}`);
  else add('pass', `Adapter "${name}" defines all required keys`);

  // Lean installs resolve shared resources from the CLI bundle; vendored installs copy them locally.
  const resources: Array<[string, () => string]> = [
    ['Ponytail Core template', () => resolveResource('template', 'ponytail_core', { target: projectRoot }).source],
    ['Sonar rules bundle', () => resolveResource('sonar-rules', 'sonarlint-rules.json', { target: projectRoot }).source],
    ['Hygiene rules', () => `${listCategoryResources('hygiene-rules', { target: projectRoot }).length} rule(s)`],
  ];
  for (const [label, resolve] of resources) {
    try {
      add('pass', `${label} resolves (${resolve()})`);
    } catch (error) {
      add('fail', `${label} does not resolve: ${error instanceof Error ? error.message : error}`);
    }
  }

  for (const [key, label] of [['constitution', 'Governance constitution'], ['arch-constitution', 'Architecture constitution'], ['security-constitution', 'Security constitution']]) {
    const { path: file, optional } = mappedPath(adapter, key);
    const state = file ? readability(projectRoot, file) : null;
    if (!file) add('info', `${label}: path is user-provided for this adapter; not checked`);
    else if (state === 'ignored' || state === 'outside') add('warn', `${label} is ${state === 'outside' ? 'outside the repository' : 'gitignored'} (${file}); reviewers cannot read it`);
    else if (state === 'readable') add('pass', `${label} found (${file})`);
    else if (key === 'constitution' && !optional) add('fail', `${label} missing (${file}). Run the init skill (ag-init) to create it.`);
    else add('warn', `${label} not found (${file})${optional ? ' — optional for this adapter' : ''}`);
  }

  const { path: config } = mappedPath(adapter, 'governance-config');
  if (!config || !fs.existsSync(path.join(projectRoot, config))) {
    add('info', 'No governance config; targeted context mode and default hygiene policy apply');
  } else {
    let settings: any = null;
    try {
      settings = parse(fs.readFileSync(path.join(projectRoot, config), 'utf8'));
      add('pass', `Governance config parses (${config})`);
    } catch (error) {
      add('fail', `Governance config is not valid YAML (${config}): ${error instanceof Error ? error.message : error}`);
    }
    // Declared governance documents are what code, specs and reviews cite, so every reviewer must be able to open them.
    const governance = settings?.governance;
    if (governance && typeof governance === 'object' && !Array.isArray(governance)) {
      for (const [name, file] of Object.entries(governance)) {
        if (typeof file !== 'string' || !file.trim()) {
          add('warn', `Governance document "${name}" has no path`);
          continue;
        }
        const state = readability(projectRoot, file);
        if (state === 'readable') add('pass', `Governance document "${name}" readable (${file})`);
        else if (state === 'missing') add('warn', `Governance document "${name}" not found (${file})`);
        else add('warn', `Governance document "${name}" is ${state === 'outside' ? 'outside the repository' : 'gitignored'} (${file}); reviewers cannot read it`);
      }
    }
    // Application repositories the workspace wraps: each must be a git repository inside the workspace, and the
    // pull-request skills (installed for one code host) must match its origin.
    const selectedForgePath = path.join(runtimeDir, 'selected-forge');
    const installedForge = fs.existsSync(selectedForgePath) ? fs.readFileSync(selectedForgePath, 'utf8').trim() : '';
    const seen = new Set<string>();
    for (const entry of rawRepositoryEntries(projectRoot)) {
      const name = entry?.name;
      const location = entry?.path;
      if (typeof name !== 'string' || !REPOSITORY_NAME.test(name)) {
        add('fail', `Repository entry needs a name (letters, digits, dots, hyphens, underscores): ${JSON.stringify(entry)}`);
        continue;
      }
      if (seen.has(name)) add('fail', `Repository name "${name}" is listed twice`);
      seen.add(name);
      if (typeof location !== 'string' || !location.trim()) {
        add('fail', `Repository "${name}" has no path`);
      } else if (!insideWorkspace(projectRoot, location)) {
        add('fail', `Repository "${name}" (${location}) must be inside the workspace`);
      } else if (!fs.existsSync(path.join(projectRoot, location))) {
        add('fail', `Repository "${name}" (${location}) not found`);
      } else if (!isGitRepository(path.join(projectRoot, location))) {
        add('fail', `Repository "${name}" (${location}) is not a git repository`);
      } else {
        const detected = detectForge(path.join(projectRoot, location));
        const forge = typeof entry.forge === 'string' ? entry.forge : detected.forge;
        const origin = detected.reason === 'no origin remote' ? 'no origin remote' : `origin ${detected.reason}`;
        add('pass', `Repository "${name}" (${location}): git repository, ${origin}, forge ${forge}`);
        if (installedForge && forge !== installedForge && detected.reason !== 'no origin remote') {
          add('warn', `Repository "${name}" uses forge ${forge}, but the installed skills use ${installedForge}; pull-request skills support one code host per workspace (rerun init with --forge ${forge} if this is the code host you review)`);
        }
      }
    }
    // A nested repository the workspace ignores is invisible to every check until it is listed.
    const listed = new Set(configuredRepositories(projectRoot).map(repository => repository.path));
    for (const location of detectNestedRepositories(projectRoot)) {
      if (listed.has(location)) continue;
      const ignoredHere = spawnSync('git', ['-C', projectRoot, 'check-ignore', '-q', '--', location], { stdio: 'ignore' }).status === 0;
      if (ignoredHere) add('warn', `Nested repository "${location}" is ignored by the workspace but not listed under repositories; change detection, hygiene and security re-reviews do not see it`);
    }
    // With repositories, workspace globs are workspace-relative: one that names no repository path and no existing
    // workspace path silently matches nothing.
    const repositoryPaths = [...listed];
    if (repositoryPaths.length && Array.isArray(settings?.security_sensitive_paths)) {
      for (const pattern of settings.security_sensitive_paths) {
        if (typeof pattern !== 'string') continue;
        const staticPart = pattern.split(/[*?[]/)[0].replace(/\/+$/, '');
        const namesRepository = repositoryPaths.some(location => pattern === location || pattern.startsWith(`${location}/`));
        if (!namesRepository && !pattern.startsWith('**') && !(staticPart && fs.existsSync(path.join(projectRoot, staticPart)))) {
          add('warn', `security_sensitive_paths entry "${pattern}" matches no repository path; with repositories configured, workspace globs need the repository path (for example ${repositoryPaths[0]}/${pattern})`);
        }
      }
    }
    const sensitive = settings?.security_sensitive_paths;
    if (Array.isArray(sensitive) && sensitive.length) add('pass', `${sensitive.length} security-sensitive path pattern(s) configured`);
    else add('info', 'security_sensitive_paths not configured; skills judge which changes need a security re-review');
  }

  const forgeMarker = path.join(runtimeDir, 'selected-forge');
  const forge = fs.existsSync(forgeMarker) ? fs.readFileSync(forgeMarker, 'utf8').trim() : '';
  const forgePath = path.join(runtimeDir, 'forges', `${forge}.md`);
  if (forge && !SELECTION_NAME.test(forge)) {
    add('fail', `.architecture-guard/selected-forge contains an invalid forge name "${forge}"; use lowercase letters, digits, and hyphens. Rerun \`architecture-guard init\`.`);
  } else if (!forge) {
    add('warn', 'No selected forge (.architecture-guard/selected-forge); pull-request skills fall back to plain git. Rerun `architecture-guard init`.');
  } else if (!fs.existsSync(forgePath)) {
    add('fail', `Selected forge "${forge}" not found at .architecture-guard/forges/${forge}.md. Rerun \`architecture-guard init\`.`);
  } else {
    const missingForge = missingForgeKeys(fs.readFileSync(forgePath, 'utf8'));
    if (missingForge.length) add('fail', `Forge "${forge}" is missing required keys: ${missingForge.join(', ')}`);
    else add('pass', `Forge "${forge}" defines all required keys`);
  }

  const agents = path.join(projectRoot, 'AGENTS.md');
  if (fs.existsSync(agents) && fs.readFileSync(agents, 'utf8').includes('.architecture-guard/adapters/resolve.md')) {
    add('pass', 'AGENTS.md references the adapter resolver');
  } else {
    add('warn', 'AGENTS.md has no current Architecture Guard section; rerun `architecture-guard init`');
  }

  add('info', 'Flash-Mem and Security Review are host capabilities; skills detect them at run time.');
  return checks;
}

export function runValidateSetup(target?: string) {
  const root = path.resolve(target || '.');
  const icons: Record<Level, string> = { pass: '✓', warn: '!', fail: '✗', info: 'ℹ' };
  console.log(`Architecture Guard setup: ${root}`);
  const checks = validateSetup(root);
  for (const check of checks) console.log(`  ${icons[check.level]} ${check.message}`);
  const errors = checks.filter(check => check.level === 'fail').length;
  const warnings = checks.filter(check => check.level === 'warn').length;
  console.log(`\n${errors} error(s), ${warnings} warning(s)`);
  if (errors) process.exitCode = 1;
}
