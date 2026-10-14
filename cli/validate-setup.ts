import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { missingAdapterKeys } from './install';
import { listCategoryResources, resolveResource } from './resolve';
import { missingForgeKeys } from './forge';

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
    if (!file) add('info', `${label}: path is user-provided for this adapter; not checked`);
    else if (fs.existsSync(path.join(projectRoot, file))) add('pass', `${label} found (${file})`);
    else if (key === 'constitution' && !optional) add('fail', `${label} missing (${file}). Run the init skill (ag-init) to create it.`);
    else add('warn', `${label} not found (${file})${optional ? ' — optional for this adapter' : ''}`);
  }

  const { path: config } = mappedPath(adapter, 'governance-config');
  if (!config || !fs.existsSync(path.join(projectRoot, config))) {
    add('info', 'No governance config; targeted context mode and default hygiene policy apply');
  } else {
    try {
      parse(fs.readFileSync(path.join(projectRoot, config), 'utf8'));
      add('pass', `Governance config parses (${config})`);
    } catch (error) {
      add('fail', `Governance config is not valid YAML (${config}): ${error instanceof Error ? error.message : error}`);
    }
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
