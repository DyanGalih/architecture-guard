import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { parse, TomlTable } from 'smol-toml';

function readConfig(file: string): string | null {
  const root = path.parse(file).root;
  let current = root;
  for (const part of path.relative(root, file).split(path.sep)) {
    current = path.join(current, part);
    let stat: fs.Stats;
    try { stat = fs.lstatSync(current); } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
    if (stat.isSymbolicLink() || (current === file ? !stat.isFile() : !stat.isDirectory())) {
      throw new Error(`Unsafe Codex configuration path: ${current}`);
    }
  }
  return fs.readFileSync(file, 'utf8');
}

function parseConfig(source: string): TomlTable {
  try { return parse(source, { integersAsBigInt: true }); } catch {
    // Parser diagnostics can contain configuration secrets; never forward their source excerpts.
    throw new Error('Cannot safely update Codex config: invalid TOML; file left unchanged.');
  }
}

function table(value: unknown): value is TomlTable {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

export function migrateCodexConfig(source: string): string {
  const expected = parseConfig(source);
  for (const key of ['agents', 'features']) {
    if (expected[key] !== undefined && !table(expected[key])) throw new Error(`Codex ${key} must be a TOML table; file left unchanged.`);
  }
  const agents = expected.agents as TomlTable | undefined;
  const features = expected.features as TomlTable | undefined;
  if (agents?.enabled === true && features?.multi_agent === undefined) return source;
  if (agents) agents.enabled = true;
  else expected.agents = parseConfig('[agents]\nenabled = true\n').agents;
  if (features) delete features.multi_agent;

  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  let section = '';
  let enabled = false;
  const lines = source.split(/\r?\n/).flatMap(line => {
    if (/^\s*\[/.test(line)) section = line.match(/^\s*\[(agents|features)\]\s*(?:#.*)?$/)?.[1] || 'other';
    if ((section === 'features' && /^\s*multi_agent\s*=/.test(line))
      || (section === '' && /^\s*features\.multi_agent\s*=/.test(line))) return [];
    const key = section === 'agents' ? 'enabled' : section === '' ? 'agents\\.enabled' : null;
    if (key && new RegExp(`^\\s*${key}\\s*=\\s*(?:true|false)\\s*(?:#.*)?$`).test(line)) {
      enabled = true;
      return [line.replace(/(=\s*)(?:true|false)/, '$1true')];
    }
    return [line];
  });
  if (!enabled) {
    const header = lines.findIndex(line => /^\s*\[agents\]\s*(?:#.*)?$/.test(line));
    if (header >= 0) lines.splice(header + 1, 0, 'enabled = true');
    else lines.push('', '[agents]', 'enabled = true', '');
  }
  const result = lines.join(newline);
  // ponytail: edit conventional boolean assignments only; use a TOML CST editor if broader layouts are needed.
  // Reparse the entire document so matches inside strings or unsupported layouts cannot change unrelated data.
  const actual = parseConfig(result);
  if (features && !Object.keys(features).length && actual.features === undefined) delete expected.features;
  if (!isDeepStrictEqual(actual, expected)) {
    throw new Error('Cannot safely migrate this Codex TOML layout; manually remove features.multi_agent and set agents.enabled = true. File left unchanged.');
  }
  return result;
}

export function planCodexConfig(configuredHome = process.env.CODEX_HOME) {
  const explicitHome = configuredHome || undefined;
  const home = explicitHome ? path.resolve(explicitHome) : path.join(os.homedir(), '.codex');
  if (explicitHome && !fs.statSync(home).isDirectory()) throw new Error('CODEX_HOME must be an existing directory.');
  const file = path.join(home, 'config.toml');
  const original = readConfig(file);
  return { file, original, content: migrateCodexConfig(original ?? '') };
}

export function applyCodexConfig(plan: ReturnType<typeof planCodexConfig>): void {
  if (readConfig(plan.file) !== plan.original) throw new Error('Codex config changed after preview; retry setup.');
  if (plan.content === plan.original) return;
  const dir = path.dirname(plan.file);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const temp = path.join(dir, `.ag-config-${randomUUID()}.tmp`);
  try {
    const mode = plan.original === null ? 0o600 : fs.statSync(plan.file).mode & 0o777;
    fs.writeFileSync(temp, plan.content, { flag: 'wx', mode });
    fs.chmodSync(temp, mode);
    if (readConfig(plan.file) !== plan.original) throw new Error('Codex config changed after preview; retry setup.');
    fs.renameSync(temp, plan.file);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}
