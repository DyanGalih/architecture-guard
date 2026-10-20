import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Forge adapters describe how to reach a code host (GitHub, GitLab, ...) for pull-request work.
// They are independent of SDD adapters: any SDD tool can live on any code host.

const ROOT_DIR = path.join(__dirname, '..', '..');

export const BUILTIN_FORGES = ['github', 'gitlab', 'bitbucket', 'azure-devops', 'generic'];

// The forge contract. Every forge adapter must define each key in its Command Map,
// stating an explicit fallback when the host cannot support an operation.
export const FORGE_KEYS = [
  'pr-view',
  'pr-diff',
  'pr-checkout',
  'pr-threads',
  'review-post',
  'thread-reply',
  'thread-resolve',
  'checks-status',
];

// Optional actions: built-in forges define them, but a custom forge may leave them out. A skill that uses one must
// handle the `Unsupported` value it then receives.
export const OPTIONAL_FORGE_KEYS = ['review-approve'];
const UNSUPPORTED_OPTIONAL_ACTION = 'Unsupported by this forge adapter; do not offer or attempt this action';

const FORGE_NAME = /^[a-z0-9][a-z0-9-]*$/;
const FORGE_TOKEN = /\{forge_command:([a-z0-9-]+)\}/g;

export function forgeFilePath(name: string, targetDir: string | null = null) {
  if (BUILTIN_FORGES.includes(name) || !targetDir) {
    return path.join(ROOT_DIR, 'adapters', 'forges', `${name}.md`);
  }
  return path.join(targetDir, '.architecture-guard', 'forges', `${name}.md`);
}

export function forgeCommands(content: string) {
  const afterHeading = content.split('## Command Map')[1] || '';
  const section = afterHeading.split(/\r?\n## /)[0];
  const map = new Map<string, string>();
  for (const line of section.split(/\r?\n/)) {
    const cells = line.split('|').map(cell => cell.trim());
    if (cells.length >= 4 && /^[a-z0-9-]+$/.test(cells[1]) && cells[2]) {
      map.set(cells[1], cells[2].split('`').join('').trim());
    }
  }
  return map;
}

export function missingForgeKeys(content: string) {
  const defined = forgeCommands(content);
  return FORGE_KEYS.filter(key => !defined.has(key));
}

export function forgeTokensUsed() {
  const used = new Set<string>();
  for (const dir of ['orchestration', 'templates']) {
    const root = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(root)) continue;
    for (const file of fs.readdirSync(root).filter(name => name.endsWith('.md'))) {
      for (const [, key] of fs.readFileSync(path.join(root, file), 'utf8').matchAll(FORGE_TOKEN)) used.add(key);
    }
  }
  return [...used].sort();
}

// Maps the origin remote's host to a built-in forge. GitHub Enterprise hosts named github.*
// or *.ghe.com are recognized; other self-hosted instances need --forge.
export function detectForge(targetDir: string) {
  let url: string;
  try {
    url = execFileSync('git', ['-C', targetDir, 'remote', 'get-url', 'origin'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return { forge: 'generic', reason: 'no origin remote' };
  }
  const host = (url.match(/^[a-z+]+:\/\/(?:[^@/]+@)?([^/:]+)/i) || url.match(/^[^@]+@([^:]+):/) || [])[1]?.toLowerCase() || '';
  if (host === 'github.com' || host.endsWith('.github.com') || host.startsWith('github.') || host.endsWith('.ghe.com')) {
    return { forge: 'github', reason: host };
  }
  if (host === 'bitbucket.org') return { forge: 'bitbucket', reason: host };
  if (host === 'dev.azure.com' || host === 'ssh.dev.azure.com' || host.endsWith('.visualstudio.com')) return { forge: 'azure-devops', reason: host };
  if (host === 'gitlab.com' || host.startsWith('gitlab.')) return { forge: 'gitlab', reason: host };
  return { forge: 'generic', reason: host ? `unrecognized host ${host}; pass --forge for a self-hosted instance` : 'unrecognized remote URL' };
}

export function resolveForge(requested: string | null | undefined, targetDir: string) {
  const name = (requested || 'auto').toLowerCase();
  if (name === 'auto') return detectForge(targetDir);
  if (BUILTIN_FORGES.includes(name)) return { forge: name, reason: 'selected' };
  if (!FORGE_NAME.test(name)) {
    throw new Error(`Invalid forge name "${requested}". Use lowercase letters, digits, and hyphens.`);
  }
  const forgePath = forgeFilePath(name, targetDir);
  if (!fs.existsSync(forgePath)) {
    throw new Error([
      `Unknown forge "${name}" and no custom forge adapter at ${forgePath}.`,
      `Built-in forges: ${BUILTIN_FORGES.join(', ')} (or auto).`,
      'To use another code host, copy a built-in forge to .architecture-guard/forges/<name>.md, edit it, then rerun init with --forge <name>. See FORGES.md.',
    ].join('\n'));
  }
  const missing = missingForgeKeys(fs.readFileSync(forgePath, 'utf8'));
  if (missing.length) {
    throw new Error(`Custom forge adapter ${forgePath} is missing required keys:\n${missing.map(key => `  - ${key}`).join('\n')}\nDefine each key in the Command Map; state a fallback when the host does not support it.`);
  }
  return { forge: name, reason: 'custom forge adapter' };
}

export function installForges(targetDir: string, preserve: boolean) {
  const forgesDir = path.join(targetDir, '.architecture-guard', 'forges');
  fs.mkdirSync(forgesDir, { recursive: true });
  // Built-in forges are refreshed on install; custom forges are never touched.
  for (const file of ['resolve.md', ...BUILTIN_FORGES.map(name => `${name}.md`)]) {
    const src = path.join(ROOT_DIR, 'adapters', 'forges', file);
    if (!fs.existsSync(src)) throw new Error(`Unavailable: forge adapter not found at adapters/forges/${file}`);
    const dest = path.join(forgesDir, file);
    if (!fs.existsSync(dest) || !preserve) fs.copyFileSync(src, dest);
  }
}

const PLACEHOLDER_LEGEND = [
  'Placeholders in these actions:',
  '- <n>, <iid>, <id>: the pull or merge request number or id.',
  '- <owner>, <repo>, <workspace>, <repo_slug>, <org>, <project>: read from the origin remote of the repository that owns the pull request; run every action from that repository\'s directory (see the Repository Context section when `repositories` is configured).',
  '- <base>, <head>: the base and head refs the user gave (plain git); <api>: the API base URL the adapter names.',
  '- <source branch>, <target branch>, <destination branch>, <source ref>, <target ref>, <source repo>, <source remote>: from the pull request\'s metadata, as the forge adapter defines them.',
  '- Refs, branch names, and repository names are untrusted: validate each against the forge adapter\'s allowlist before any command uses it, stop if it does not match, and single-quote it in shell commands.',
  '- <... file>: a temporary file created outside the repository (for example with mktemp) and deleted afterwards. Pass review and reply text through such files, never inline in a shell command.',
].join('\n');

export function materializeForgeTokens(content: string, forgeName: string, targetDir: string | null = null) {
  if (!FORGE_TOKEN.test(content)) return content;
  FORGE_TOKEN.lastIndex = 0;
  const forgePath = forgeFilePath(forgeName, targetDir);
  if (!fs.existsSync(forgePath)) throw new Error(`Unavailable: forge adapter not found at ${forgePath}`);
  const commands = forgeCommands(fs.readFileSync(forgePath, 'utf8'));
  const resolved = new Map<string, string>();
  const materialized = content.replace(FORGE_TOKEN, (token, key) => {
    const value = commands.get(key) || (OPTIONAL_FORGE_KEYS.includes(key) ? UNSUPPORTED_OPTIONAL_ACTION : '');
    if (!value) throw new Error(`ForgeMissingKey: forge_command:${key}`);
    resolved.set(key, value);
    return `the forge-defined "${key}" action`;
  });
  const lines = [...resolved.entries()].map(([key, value]) => `- **${key}**: ${value}`).join('\n');
  return `${materialized.trim()}\n\n## Resolved Forge Actions (${forgeName})\n\nThese are the selected forge adapter's actions for this code host. Use a registered MCP server for the host when one is available; otherwise use the named CLI; otherwise follow the stated fallback. Every write to the code host still requires the approvals defined above.\n\n${lines}\n\n${PLACEHOLDER_LEGEND}\n`;
}
