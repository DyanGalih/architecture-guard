#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const { resolveForge, installForges, materializeForgeTokens } = require('./forge');
const { configuredRepositories, detectNestedRepositories, isGitRepository, readWorkspaceConfig } = require('./repositories');

// ponytail: stdin detection is the trickiest part of a prompt-style installer.
// Node has no synchronous peek on stdin, so we distinguish three cases:
//   1. interactive (stdout is a TTY): prompt via readline regardless of stdin TTY
//   2. piped answers (stdin not a TTY): drain stdin lines
//   3. non-interactive flags (--yes): never prompt, never read stdin
// Case 2 covers CI and the existing test harness which pipes `input` to spawnSync.
// The previous code gated piped-drain on `!process.stdin.isTTY`, which also fired
// inside opencode/CI shells where stdin is a pipe but no answers are piped — that
// hung or silently picked defaults. Using `process.stdout.isTTY` keeps interactive
// prompts working whenever the user can see them, and lets piped-stdin cases still
// drain when stdout is redirected (the test path).
let _inputLines = null;
let _inputIdx = 0;
function nextLine() {
  if (_inputLines !== null) {
    const line = _inputLines[_inputIdx];
    _inputIdx++;
    return Promise.resolve(line || '');
  }
  const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('', (line) => { rl.close(); resolve(line); });
  });
}
function readAllStdin() {
  return new Promise((resolve) => {
    // Drain piped answers only when stdout is not interactive (tests, CI) and stdin is
    // actually a pipe. Interactive stdout => readline prompts work even if stdin is a pipe
    // (opencode); an interactive stdin with redirected stdout (`init > log`) is never
    // drained, or the installer would wait for an EOF the user never sends.
    if (!process.stdout.isTTY && !process.stdin.isTTY) {
      const rl = require('readline').createInterface({ input: process.stdin });
      const lines: string[] = [];
      rl.on('line', (l: string) => lines.push(l));
      rl.on('close', () => { _inputLines = lines; _inputIdx = 0; resolve(undefined); });
    } else {
      resolve(undefined);
    }
  });
}

// ponytail: no TTY on ANY fd and no piped answers = can't proceed interactively.
// Called after readAllStdin() has drained piped incoming lines (the test harness path).
// If nothing drained + no flags → error with corrective instruction.
function requireInteractiveOrYes(opts) {
  if (opts.yes) return;
  // If we drained piped input (_inputLines exists), user chose non-interactive mode.
  // Even if they piped nothing, let normal validation handle missing answers.
  if (!process.stdin.isTTY && !process.stdout.isTTY && _inputLines !== null && _inputLines.length === 0) {
    console.error([
      'Interactive mode requires a terminal (TTY) or piped input.',
      'Your environment has neither — use --yes with explicit flags:',
      '',
      '  architecture-guard init . --yes --agent opencode --framework openspec --commands init',
      '',
      'Supported flags: --agent, --framework, --commands, --overwrite, --yes',
      'See --help for details.',
    ].join('\n'));
    process.exit(1);
  }
}

const AGENT_CONFIGS = {
  opencode:     { dir: '.opencode/commands',   ext: '.md' },
  junie:        { dir: '.junie/commands',      ext: '.md' },
  amp:          { dir: '.amp/commands',        ext: '.md' },
  auggie:       { dir: '.augment/commands',    ext: '.md' },
  bob:          { dir: '.bob/commands',        ext: '.md' },
  codebuddy:    { dir: '.codebuddy/commands',  ext: '.md' },
  'cursor-agent': { dir: '.cursor/skills',     ext: '/SKILL.md' },
  firebender:   { dir: '.firebender/commands', ext: '.md' },
  forge:        { dir: '.forge/commands',      ext: '.md' },
  kilocode:     { dir: '.kilocode/workflows',  ext: '.md' },
  'kiro-cli':   { dir: '.kiro/commands',       ext: '.md' },
  omp:          { dir: '.omp/commands',        ext: '.md' },
  pi:           { dir: '.pi/commands',         ext: '.md' },
  qodercli:     { dir: '.qoder/commands',      ext: '.md' },
  qwen:         { dir: '.qwen/commands',       ext: '.md' },
  shai:         { dir: '.shai/commands',       ext: '.md' },
  vibe:         { dir: '.vibe/commands',       ext: '.md' },
  cline:        { dir: '.clinerules/workflows', ext: '.md' },
  claude:       { dir: '.claude/skills',       ext: '/SKILL.md' },
  codex:        { dir: '.codex/skills',        ext: '/SKILL.md' },
  zed:          { dir: '.agent/skills/zed',   ext: '/SKILL.md' },
  antigravity:  { dir: '.agent/skills',        ext: '/SKILL.md' },
  devin:        { dir: '.devin/skills',        ext: '/SKILL.md' },
  grok:         { dir: '.grok/skills',         ext: '/SKILL.md' },
  trae:         { dir: '.trae/skills',         ext: '/SKILL.md' },
  kimi:         { dir: '.kimi-code/skills',    ext: '/SKILL.md' },
  lingma:       { dir: '.lingma/skills',       ext: '/SKILL.md' },
  zcode:        { dir: '.zcode/skills',        ext: '/SKILL.md' },
  rovodev:      { dir: '.rovodev/skills',      ext: '/SKILL.md' },
  hermes:       { dir: '.hermes/skills',       ext: '/SKILL.md' },
  copilot:      { dir: '.github/skills',       ext: '/SKILL.md' },
  gemini:       { dir: '.gemini/commands',     ext: '.toml' },
  tabnine:      { dir: '.tabnine/agent/commands', ext: '.toml' },
  goose:        { dir: '.goose/recipes',       ext: '.yaml' },
  windsurf:     { dir: '.windsurf/workflows',  ext: '.md' },
};

const COMMANDS = [
  'init',
  'init-brownfield',
  'governed-discover',
  'governed-spec',
  'governed-plan',
  'governed-tasks',
  'governed-delivery',
  'governed-delivery-team',
  'governed-implement',
  'review-artifacts',
  'review-implementation',
  'review-pr',
  'pr-feedback',
  'verify',
  'apply',
  'workflow',
  'violation-detection',
  'refactor-generator',
  'consolidate-specs',
  'governed-archive',
];

const COMMAND_ALIASES = {
  all: COMMANDS,
  review: ['review-artifacts', 'review-implementation'],
  pr: ['review-pr', 'pr-feedback'],
};

async function ask(promptText, choices, multi = false) {
  // Use old logic if reading from piped stdin (e.g. tests)
  if (_inputLines !== null) {
    const input = await nextLine();
    if (!choices) return input;
    if (multi) {
      if (input.trim().toLowerCase() === 'all') return choices.map(c => typeof c === 'string' ? c : c.value);
      const indices = input.split(',').map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < choices.length);
      return indices.map(i => typeof choices[i] === 'string' ? choices[i] : choices[i].value);
    }
    const idx = parseInt(input.trim()) - 1;
    return (idx >= 0 && idx < choices.length) ? (typeof choices[idx] === 'string' ? choices[idx] : choices[idx].value) : null;
  }

  const { input, select, checkbox } = await import('@inquirer/prompts');
  
  // Clean up prompt text (remove trailing colons or extra spaces that inquirer adds natively)
  const message = promptText.trim().replace(/:$/, '');

  try {
    if (choices) {
      const formattedChoices = choices.map((c) => (typeof c === 'string' ? { name: c, value: c } : c));
      if (multi) {
        return await checkbox({
          message: message,
          choices: formattedChoices,
        });
      } else {
        return await select({
          message: message,
          choices: formattedChoices,
        });
      }
    }

    return await input({ message: message });
  } catch (error) {
    if (error.name === 'ExitPromptError' || error instanceof Error && error.message.includes('User force closed the prompt')) {
      console.log('\nInstallation aborted.');
      process.exit(0);
    }
    throw error;
  }
}

function slug(name) {
  return name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

function readPrompt(promptPath) {
  return fs.readFileSync(promptPath, 'utf8');
}

function parseAdapterSection(content, heading, nextHeading = null) {
  const afterHeading = content.split(heading)[1] || '';
  const section = (nextHeading && afterHeading.includes(nextHeading))
    ? afterHeading.split(nextHeading)[0]
    : afterHeading.split(/\r?\n## /)[0];
  const map = new Map();
  for (const line of section.split(new RegExp('\\r?\\n'))) {
    const cells = line.split('|').map(cell => cell.trim());
    if (cells.length >= 4 && cells[1] && cells[2] && cells[1] !== 'Canonical Name' && cells[1] !== 'Canonical Key') {
      const tick = String.fromCharCode(96);
      const value = cells[2];
      map.set(cells[1], value.split(tick).join('').trim());
    }
  }
  return map;
}

const BUILTIN_ADAPTERS = ['spec-kit', 'openspec', 'generic'];
const ADAPTER_NAME = /^[a-z0-9][a-z0-9-]*$/;
const ADAPTER_TOKEN = /\{adapter_(path|command):([a-z0-9-]+)\}/g;

// Built-in adapters ship with the package; custom adapters live in the target project.
function adapterFilePath(adapterName, targetDir = null) {
  if (BUILTIN_ADAPTERS.includes(adapterName) || !targetDir) {
    return path.join(ROOT_DIR, 'adapters', adapterName + '.md');
  }
  return path.join(targetDir, '.architecture-guard', 'adapters', adapterName + '.md');
}

function adapterKeys(content) {
  return {
    path: parseAdapterSection(content, '## Path Map', '## Command Map'),
    command: parseAdapterSection(content, '## Command Map', '## Constitution Layout'),
  };
}

function resolveAdapterBindings(adapterName, targetDir = null) {
  const adapterPath = adapterFilePath(adapterName, targetDir);
  if (!fs.existsSync(adapterPath)) {
    throw new Error('Unavailable: adapter file not found at ' + adapterPath);
  }
  return adapterKeys(fs.readFileSync(adapterPath, 'utf8'));
}

// Every adapter must define each key the installed prompts and runtime templates reference.
function requiredAdapterKeys() {
  const keys = { path: new Set(), command: new Set() };
  for (const dir of ['orchestration', 'templates', 'flow']) {
    const root = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(root)) continue;
    for (const file of fs.readdirSync(root).filter(name => name.endsWith('.md'))) {
      for (const [, kind, key] of fs.readFileSync(path.join(root, file), 'utf8').matchAll(ADAPTER_TOKEN)) {
        keys[kind].add(key);
      }
    }
  }
  return { path: [...keys.path].sort(), command: [...keys.command].sort() };
}

function missingAdapterKeys(content) {
  const required = requiredAdapterKeys();
  const defined = adapterKeys(content);
  return ['path', 'command'].flatMap(kind =>
    required[kind].filter(key => !defined[kind].has(key)).map(key => `${kind}:${key}`));
}

function customAdapters(targetDir) {
  const dir = path.join(targetDir, '.architecture-guard', 'adapters');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .map(file => file.slice(0, -3))
    .filter(name => name !== 'resolve' && !BUILTIN_ADAPTERS.includes(name) && ADAPTER_NAME.test(name))
    .sort();
}

// Validates a custom adapter before anything is written to the target project.
function resolveCustomAdapter(name, targetDir) {
  if (!ADAPTER_NAME.test(name) || name === 'resolve') {
    throw new Error(`Invalid adapter name "${name}". Use lowercase letters, digits, and hyphens.`);
  }
  const adapterPath = adapterFilePath(name, targetDir);
  if (!fs.existsSync(adapterPath)) {
    throw new Error([
      `Unknown framework "${name}" and no custom adapter at ${adapterPath}.`,
      `Built-in adapters: ${BUILTIN_ADAPTERS.join(', ')} (or none).`,
      'To use another SDD tool, copy a built-in adapter to .architecture-guard/adapters/<name>.md, edit it, then rerun init with --framework <name>. See ADAPTERS.md.',
    ].join('\n'));
  }
  const missing = missingAdapterKeys(fs.readFileSync(adapterPath, 'utf8'));
  if (missing.length) {
    throw new Error(`Custom adapter ${adapterPath} is missing required keys:\n${missing.map(key => `  - ${key}`).join('\n')}\nDefine each key in the Path Map or Command Map; state an inline fallback when the tool does not support it.`);
  }
  return name;
}

// config.yml is also the adapters' governance-config, so keep the user's settings
// (context budget, repository_hygiene, presets) and only update the installer-owned keys.
function writeInstallerConfig(configPath, adapter, repositories = null) {
  const YAML = require('yaml');
  if (!fs.existsSync(configPath)) {
    const initial = { adapter, presets: [], ...(repositories ? { repositories } : {}) };
    fs.writeFileSync(configPath, YAML.stringify(initial));
    return;
  }
  const doc = YAML.parseDocument(fs.readFileSync(configPath, 'utf8'));
  if (doc.errors.length || (doc.contents && !YAML.isMap(doc.contents))) {
    console.log(`  ! ${configPath} is not a valid YAML mapping; left unchanged. Fix it, then rerun init to record adapter: ${adapter}.`);
    return;
  }
  if (!doc.contents) doc.contents = doc.createNode({});
  doc.set('adapter', adapter);
  if (!doc.has('presets')) doc.set('presets', []);
  if (repositories && !doc.has('repositories')) doc.set('repositories', repositories);
  fs.writeFileSync(configPath, String(doc));
}

function installAdapters(targetDir, preserve) {
  const adaptersDir = path.join(targetDir, '.architecture-guard', 'adapters');
  fs.mkdirSync(adaptersDir, { recursive: true });
  // Built-in adapters ship with the prompts and are refreshed on install; custom adapters are never touched.
  for (const file of ['resolve.md', ...BUILTIN_ADAPTERS.map(name => `${name}.md`)]) {
    const src = path.join(ROOT_DIR, 'adapters', file);
    if (!fs.existsSync(src)) {
      throw new Error('Unavailable: adapter file not found at adapters/' + file);
    }
    const dest = path.join(adaptersDir, file);
    if (!fs.existsSync(dest) || !preserve) {
      fs.copyFileSync(src, dest);
    }
  }

  const legacyResolve = path.join(targetDir, 'adapters', 'resolve.md');
  if (fs.existsSync(legacyResolve) && fs.readFileSync(legacyResolve, 'utf8').startsWith('# SDD Adapter Resolution')) {
    console.log('  ! Found adapters/ from an older Architecture Guard install. It is no longer read;');
    console.log('    move any custom adapter to .architecture-guard/adapters/ and remove adapters/ when ready.');
  }
}

function resolveAdapterValue(bindings, kind, key, trail = []) {
  const identifier = `${kind}:${key}`;
  if (trail.includes(identifier)) {
    throw new Error('AdapterTokenCycle: ' + identifier);
  }

  const value = bindings[kind].get(key);
  if (!value) {
    throw new Error('AdapterMissingKey: ' + identifier);
  }

  const tokenPattern = new RegExp('\\{adapter_(path|command):([^}]+)}', 'g');
  return value.replace(tokenPattern, (token, nestedKind, nestedKey) =>
    resolveAdapterValue(bindings, nestedKind, nestedKey, [...trail, identifier])
  );
}

function materializeAdapterTokens(content, adapterName, targetDir = null) {
  const normalizedAdapter = adapterName === 'none' || adapterName === 'none (framework-agnostic)' ? 'generic' : adapterName;
  const bindings = resolveAdapterBindings(normalizedAdapter, targetDir);
  const tokenPattern = new RegExp('\\{adapter_(path|command):([^}]+)}', 'g');
  const resolvedCommands = new Map();
  const materialized = content.replace(tokenPattern, (token, kind, key) => {
    const value = resolveAdapterValue(bindings, kind, key);
    if (kind === 'command') {
      resolvedCommands.set(key, value);
      return `the adapter-defined "${key}" action`;
    }
    return value;
  });

  if (resolvedCommands.size === 0) {
    return materialized;
  }

  const actionLines = [...resolvedCommands.entries()]
    .map(([key, value]) => `- **${key}**: ${value}`)
    .join('\n');

  return `${materialized.trim()}\n\n## Resolved Adapter Actions\n\nThe entries below are the selected adapter's action guidance. Treat them as declarative instructions; execute only an explicitly named host capability, slash command, or CLI invocation.\n\n${actionLines}\n`;
}

function parseCommandSelection(rawCommands) {
  const selected = [];
  const invalid = [];

  for (const raw of String(rawCommands).split(',')) {
    const value = raw.trim();
    if (!value) {
      invalid.push(value || '<empty>');
      continue;
    }

    if (/^\d+$/.test(value)) {
      const resolved = COMMANDS[Number(value) - 1];
      if (!resolved) {
        invalid.push(value);
        continue;
      }
      selected.push(resolved);
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(COMMAND_ALIASES, value)) {
      selected.push(...COMMAND_ALIASES[value]);
      continue;
    }

    if (COMMANDS.includes(value)) {
      selected.push(value);
      continue;
    }

    invalid.push(value);
  }

  if (invalid.length > 0) {
    throw new Error(`Unknown command selection: ${invalid.join(", ")}. Use a canonical command name, index, or alias: all, review, pr.`);
  }

  return [...new Set(selected)];
}

function installMarkdown(sk, content, cmdDir, dest) {
  dest ||= path.join(cmdDir, `ag-${sk}.md`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

function installSkillMd(sk, content, cmdDir, dest, agentType) {
  if (!dest) {
    dest = path.join(cmdDir, `ag-${sk}`, 'SKILL.md');
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  
  let description = `Architecture Guard governance command: ag-${sk}`;
  let cleanContent = content.trim();
  
  const match = cleanContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (match) {
    const originalFrontmatter = match[1];
    const descMatch = originalFrontmatter.match(/^description:\s*(.*)$/m);
    if (descMatch) {
      description = descMatch[1].trim();
    }
    cleanContent = cleanContent.substring(match[0].length).trim();
  }

  // keep-both writes ag-<sk>-2/SKILL.md; the skill name must match its directory.
  const frontmatter = `---
name: ${path.basename(path.dirname(dest))}
description: ${description}
metadata:
  author: architecture-guard
  source: https://github.com/DyanGalih/architecture-guard
---

${cleanContent}`;
  fs.writeFileSync(dest, frontmatter);
}

// Prompts contain backslashes (LaTeX, regexes) that are escapes in TOML basic strings, so
// prefer a multi-line literal string, which keeps the text verbatim. Fall back to an escaped
// basic string only when the text contains ''' or a control character literals cannot hold.
function tomlMultilineString(text) {
  // eslint-disable-next-line no-control-regex
  const control = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
  if (!text.includes("'''") && !text.match(control)) {
    return `'''\n${text}\n'''`;
  }
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/"""/g, '\\"\\"\\"')
    .replace(control, ch => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return `"""\n${escaped}\n"""`;
}

function installToml(sk, content, cmdDir, dest) {
  dest ||= path.join(cmdDir, `${sk}.toml`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const toml = `description = "Architecture Guard: ag-${sk}"

prompt = ${tomlMultilineString(content.trim())}
`;
  fs.writeFileSync(dest, toml);
}

function installYaml(sk, content, cmdDir, dest) {
  dest ||= path.join(cmdDir, `${sk}.yaml`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const yamlQuote = value => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')}"`;
  const yaml = `version: "1.0"
title: ${yamlQuote(`ag-${sk}`)}
description: ${yamlQuote(`Architecture Guard: ag-${sk}`)}
prompt: |2
  ${content.trim().replace(/\n/g, '\n  ')}
`;
  fs.writeFileSync(dest, yaml);
}

function commandDestination(cfg, sk, cmdDir, agentType) {
  if (cfg.ext === '/SKILL.md') {
    return path.join(cmdDir, `ag-${sk}`, 'SKILL.md');
  }
  return path.join(cmdDir, `ag-${sk}${cfg.ext}`);
}

function availableCopy(dest, cfg, sk, cmdDir, agentType) {
  if (cfg.ext === '/SKILL.md') {
    const prefix = `ag-${sk}`;
    let candidate = path.join(cmdDir, `${prefix}-2`, 'SKILL.md');
    for (let i = 2; fs.existsSync(candidate); i++) {
      candidate = path.join(cmdDir, `${prefix}-${i + 1}`, 'SKILL.md');
    }
    return candidate;
  }
  const parsed = path.parse(dest);
  let candidate = path.join(parsed.dir, `${parsed.name}.architecture-guard${parsed.ext}`);
  for (let i = 2; fs.existsSync(candidate); i++) {
    candidate = path.join(parsed.dir, `${parsed.name}.architecture-guard-${i}${parsed.ext}`);
  }
  return candidate;
}

const OVERWRITE_MODES = ['replace', 'skip', 'keep-both'];

// Applies --overwrite to an existing destination: the path to write, or null to skip it.
function writableDestination(dest, overwrite, keepBothCopy) {
  if (!fs.existsSync(dest)) return dest;
  if (overwrite === 'skip') return null;
  if (overwrite === 'keep-both') return keepBothCopy(dest);
  fs.rmSync(dest, { recursive: true, force: true });
  return dest;
}

async function installCommand(agentType: any, commandName: any, cmdDir: any, opts: any = {}, workflowsDir: any = null) {
  const cfg = AGENT_CONFIGS[agentType];
  if (!cfg) return;
  const overwrite = opts.overwrite;

  const promptPath = path.join(ROOT_DIR, 'orchestration', `${commandName}.md`);
  if (!fs.existsSync(promptPath)) {
    throw new Error(`Canonical orchestration prompt not found: orchestration/${commandName}.md`);
  }

  const adapterName = opts.adapterName || opts.framework || 'generic';
  const content = materializeForgeTokens(
    materializeAdapterTokens(readPrompt(promptPath), adapterName, opts.targetDir || null),
    opts.forgeName || 'generic',
    opts.targetDir || null,
  );
  const sk = slug(commandName);
  const dest = writableDestination(commandDestination(cfg, sk, cmdDir, agentType), overwrite,
    existing => availableCopy(existing, cfg, sk, cmdDir, agentType));

  try {
    if (!dest) {
      // --overwrite skip: the existing file is left untouched.
    } else if (cfg.ext === '.md') {
      installMarkdown(sk, content, cmdDir, dest);
    } else if (cfg.ext === '/SKILL.md') {
      installSkillMd(sk, content, cmdDir, dest, agentType);
    } else if (cfg.ext === '.toml') {
      installToml(sk, content, cmdDir, dest);
    } else if (cfg.ext === '.yaml') {
      installYaml(sk, content, cmdDir, dest);
    }

    // Antigravity workflow files follow the same overwrite mode as the skills.
    const wfDest = workflowsDir && writableDestination(path.join(workflowsDir, `agx-${sk}.md`), overwrite,
      existing => availableCopy(existing, { ext: '.md' }, sk, workflowsDir, agentType));
    if (wfDest) {
      fs.mkdirSync(path.dirname(wfDest), { recursive: true });
      fs.writeFileSync(wfDest, content);
    }
  } catch (err) {
    console.error(`  ✗ ${commandName}: ${err.message}`);
  }
}

function appendAgentsMd(projectPath, selectedAgents) {
  const agentsPath = path.join(projectPath, 'AGENTS.md');
  const sectionStart = '<!-- architecture-guard:start -->';
  const sectionEnd = '<!-- architecture-guard:end -->';
  const section = `${sectionStart}

## Architecture Guard

Use these governance rules across all SDD workflow phases.
Read the installed governance commands or skills at:
${selectedAgents.map(agent => `- \`${path.join(AGENT_CONFIGS[agent].dir, '*')}\``).join('\n')}

- **Ponytail Core Contract**: Before spec/plan/tasks/implement, read and apply the ponytail pragmatism contract.
- **After each phase**: Run architecture review for boundary drift, DRY violations, and repository hygiene.
- **SDD Adapter Resolution**: Project uses the adapter selected during CLI init. Read \`.architecture-guard/adapters/resolve.md\` before first command.
- **Engine Resources**: Lean installs use the callable Architecture Guard CLI for shared templates, presets, hygiene rules, and Sonar rules; vendor/full mode copies those resources under .architecture-guard/. The hygiene check remains CLI-backed.
- **Direct Discovery Guard**: When checking adapter-resolved hidden paths such as \`.architecture-guard/**\`, use direct directory inspection first, then read listed files. A Glob no-match result is inconclusive and MUST NOT be reported as missing. Report a path as unavailable only after direct inspection confirms it does not exist. Always include loaded rule files and counts in governance reports.
${sectionEnd}`;

  if (fs.existsSync(agentsPath)) {
    const current = fs.readFileSync(agentsPath, 'utf8');
    const start = current.indexOf(sectionStart);
    const end = start === -1 ? -1 : current.indexOf(sectionEnd, start + sectionStart.length);
    if (start !== -1 && end !== -1) {
      const updated = current.slice(0, start).trimEnd() + '\n\n' + section + current.slice(end + sectionEnd.length);
      fs.writeFileSync(agentsPath, updated.trimEnd() + '\n');
      return;
    }

    const legacyGeneratedSection = current.trimStart().startsWith('## Architecture Guard')
      && current.includes('Use these governance rules across all SDD workflow phases.')
      && current.trimEnd().endsWith('Always include loaded rule files and counts in governance reports.');
    if (legacyGeneratedSection) {
      fs.writeFileSync(agentsPath, section + '\n');
      return;
    }

    // Older installers wrote an unmarked section; replace it in place even when other content surrounds it.
    const legacySection = /(^|\n)## Architecture Guard\n\nUse these governance rules across all SDD workflow phases\.\n[\s\S]*?Always include loaded rule files and counts in governance reports\.\n?/;
    if (legacySection.test(current)) {
      const updated = current.replace(legacySection, (match, lead) => `${lead}${section}\n`);
      fs.writeFileSync(agentsPath, updated.trimEnd() + '\n');
      return;
    }

    if (!current.includes('## Architecture Guard')) {
      fs.appendFileSync(agentsPath, `\n\n${section}\n`);
    }
  } else {
    fs.writeFileSync(agentsPath, section + '\n');
  }
}

async function installRuntimeResources(runtimeDir, opts: any = {}) {
  const overwrite = typeof opts === 'object' && opts !== null ? opts.overwrite : (opts ? 'replace' : null);
  for (const dir of REQUIRED_RESOURCES) {
    const destination = path.join(runtimeDir, dir);
    if (overwrite === 'skip') {
      if (fs.existsSync(destination)) {
        continue;
      }
    }
    fs.cpSync(path.join(ROOT_DIR, dir), destination, { recursive: true, force: true });
  }
}

function validateRuntimeResources() {
  const required = [
    ...['templates', 'presets', 'hygiene-rules', 'sonar-rules'].map(dir => path.join(ROOT_DIR, dir))
  ];
  const missing = required.filter(resource => !fs.existsSync(resource));
  if (missing.length) {
    throw new Error(`Required installer resources are missing:\n${missing.map(resource => `  - ${resource}`).join('\n')}\nRestore the complete src runtime resource bundle before installing.`);
  }
}

function configureClaudeAgentTeams(targetDir: string) {
  const claudeDir = path.join(targetDir, '.claude');
  const settingsPath = path.join(claudeDir, 'settings.json');
  let settings: Record<string, any> = {};

  if (fs.existsSync(settingsPath)) {
    try {
      const raw = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(raw);
    } catch (err) {
      console.warn(`  ⚠ Could not parse existing ${path.relative(process.cwd(), settingsPath)}, creating fresh env config`);
      settings = {};
    }
  }

  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    settings = {};
  }

  if (!settings.env || typeof settings.env !== 'object' || Array.isArray(settings.env)) {
    settings.env = {};
  }

  settings.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = '1';

  fs.mkdirSync(claudeDir, { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log(`  ✓ Configured Claude Code Agent Teams (Beta) in ${path.relative(process.cwd(), settingsPath)}`);
}

const REQUIRED_RESOURCES = ['templates', 'presets', 'hygiene-rules', 'sonar-rules'];

function readPersistedAdapter(targetDir) {
  const markerPath = path.join(targetDir, ".architecture-guard", "selected-adapter");
  if (fs.existsSync(markerPath)) {
    const value = fs.readFileSync(markerPath, "utf8").trim().toLowerCase();
    if (value === "none") return "generic";
    return value || null;
  }

  const configPath = path.join(targetDir, ".architecture-guard", "config.yml");
  if (fs.existsSync(configPath)) {
    const match = fs.readFileSync(configPath, "utf8").match(/^adapter:\s*(\S+)/m);
    if (match) {
      const value = match[1].toLowerCase();
      return value === "none" ? "generic" : value;
    }
  }

  return null;
}

// Application repositories the workspace wraps. A `repositories` key the user wrote (even an empty list) is kept;
// otherwise standalone nested git repositories that the workspace ignores (or any, when the workspace is not a git
// repository) are returned for recording: a tracked or vendored checkout is not a separate application. The first
// code repository is where pull requests live, so the forge is detected from its origin.
function resolveWorkspaceRepositories(targetDir) {
  const config = readWorkspaceConfig(targetDir);
  let record = null;
  const messages = [];
  if (!config || config.repositories === undefined) {
    const taken = new Set();
    const ignoredByWorkspace = location => {
      const result = require('child_process').spawnSync('git', ['-C', targetDir, 'check-ignore', '-q', '--', location], { stdio: 'ignore' });
      return result.status !== 1; // 0: ignored; 128: the workspace is not a git repository
    };
    record = detectNestedRepositories(targetDir).filter(ignoredByWorkspace).map(location => {
      const base = path.basename(location).toLowerCase().replace(/[^a-z0-9._-]/g, '-') || 'app';
      let name = base;
      for (let index = 2; taken.has(name); index += 1) name = `${base}-${index}`;
      taken.add(name);
      messages.push(`  ℹ Detected repository "${name}" (${location}); recorded under repositories in .architecture-guard/config.yml (roles: code; add specs if it holds specifications, or set repositories: [] to opt out)`);
      return { name, path: location, roles: ['code'] };
    });
    if (!record.length) record = null;
  }
  const code = record
    ? record[0]
    : configuredRepositories(targetDir).find(repository => repository.roles.includes('code') && isGitRepository(repository.absolutePath));
  return { record, messages, codeDirectory: code ? path.resolve(targetDir, code.path) : null };
}

// A rerun without --forge keeps a previously selected forge that still validates, so a
// custom or self-hosted forge is not silently replaced by auto-detection.
function resolveSelectedForge(requested, targetDir, detectDirectory = targetDir) {
  const markerPath = path.join(targetDir, '.architecture-guard', 'selected-forge');
  if (!requested && fs.existsSync(markerPath)) {
    const persisted = fs.readFileSync(markerPath, 'utf8').trim();
    if (persisted) {
      try {
        const kept = resolveForge(persisted, targetDir).forge;
        // A recorded plain-git forge may predate the remote; point out a better match without switching silently.
        const detected = kept === 'generic' ? resolveForge('auto', detectDirectory).forge : kept;
        const hint = detected !== kept ? `; ${detected} remote detected, rerun with --forge ${detected} to use it` : '';
        return { forge: kept, reason: `kept from .architecture-guard/selected-forge; pass --forge to change it${hint}` };
      } catch {
        // The recorded forge no longer validates; fall back to auto-detection.
      }
    }
  }
  // An explicit --forge is validated against the workspace (custom forges live there); auto-detection reads the
  // origin of the repository that holds the pull requests.
  return requested && requested.toLowerCase() !== 'auto' ? resolveForge(requested, targetDir) : resolveForge('auto', detectDirectory);
}

// Lean installs resolve engine resources from the CLI bundle, and cli/resolve.ts treats any
// file under .architecture-guard/{templates,presets,sonar-rules} as a local override. Only
// byte-identical copies left by an older vendored install are removed; user content is kept.
function pruneVendoredCopies(runtimeDir, overwrite) {
  if (overwrite === 'skip' || overwrite === 'keep-both') return;
  const kept = [];
  const prune = (localDir, bundledDir) => {
    for (const entry of fs.readdirSync(localDir, { withFileTypes: true })) {
      const local = path.join(localDir, entry.name);
      const bundled = path.join(bundledDir, entry.name);
      if (entry.isDirectory()) {
        prune(local, bundled);
        if (fs.readdirSync(local).length === 0) fs.rmdirSync(local);
      } else if (entry.isFile() && fs.existsSync(bundled) && fs.statSync(bundled).isFile()
        && fs.readFileSync(local).equals(fs.readFileSync(bundled))) {
        fs.unlinkSync(local);
      } else {
        kept.push(path.relative(runtimeDir, local).split(path.sep).join('/'));
      }
    }
  };
  for (const dir of ['templates', 'presets', 'sonar-rules']) {
    const localDir = path.join(runtimeDir, dir);
    if (!fs.existsSync(localDir) || !fs.statSync(localDir).isDirectory()) continue;
    prune(localDir, path.join(ROOT_DIR, dir));
    if (fs.readdirSync(localDir).length === 0) fs.rmdirSync(localDir);
  }
  if (kept.length) {
    console.log('  ! Kept local overrides (they take precedence over the bundled engine resources):');
    for (const file of kept) console.log(`    - .architecture-guard/${file}`);
  }
}

async function runInit(targetDir, opts) {
  if (opts.overwrite != null && !OVERWRITE_MODES.includes(opts.overwrite)) {
    throw new Error(`Invalid --overwrite mode "${opts.overwrite}". Use one of: ${OVERWRITE_MODES.join(', ')}.`);
  }
  if (opts.yes && !opts.agents) {
    throw new Error('--yes requires --agent <names> unless an agent is supplied by an interactive prompt');
  }

  const allAgentNames = Object.keys(AGENT_CONFIGS).sort();
  const detectedAgents = [];
  const undetectedAgents = [];
  
  for (const name of allAgentNames) {
    if (fs.existsSync(path.join(targetDir, AGENT_CONFIGS[name].dir))) {
      detectedAgents.push(name);
    } else {
      undetectedAgents.push(name);
    }
  }

  const agentChoices = [
    ...detectedAgents.map(a => ({ name: a, value: a, checked: true })),
    ...undetectedAgents.map(a => ({ name: a, value: a }))
  ];

  let selectedAgents;
  if (opts.agents) {
    const requestedAgents = opts.agents.split(',').map(s => s.trim()).filter(Boolean);
    const invalidAgents = requestedAgents.filter(agent => !AGENT_CONFIGS[agent]);
    if (invalidAgents.length > 0) {
      throw new Error(`Unknown agent selection: ${invalidAgents.join(', ')}. Use --help to see supported agent keys.`);
    }
    selectedAgents = [...new Set(requestedAgents)];
  } else {
    selectedAgents = await ask('Select AI agent(s) to install commands for:', agentChoices, true);
  }

  if (!selectedAgents || selectedAgents.length === 0) {
    console.log('No agents selected. Exiting.');
    process.exit(0);
  }

  const custom = customAdapters(targetDir);
  const frameworks = ['spec-kit', 'openspec', 'none (framework-agnostic)', ...custom.map(name => `${name} (custom adapter)`)];
  let selectedFramework = opts.framework;
  if (!selectedFramework) {
    const hasOpenspec = fs.existsSync(path.join(targetDir, 'openspec', 'config.yaml')) || fs.existsSync(path.join(targetDir, 'openspec'));
    const hasSpeckit = fs.existsSync(path.join(targetDir, '.specify'));

    if (hasOpenspec && !hasSpeckit) {
      selectedFramework = 'openspec';
      console.log(`\nAuto-detected SDD framework: openspec`);
    } else if (hasSpeckit && !hasOpenspec) {
      selectedFramework = 'spec-kit';
      console.log(`\nAuto-detected SDD framework: spec-kit`);
    } else if (opts.yes) {
      throw new Error("--yes requires --framework <spec-kit|openspec|none|custom-name> when the target has no detectable SDD framework");
    } else {
      selectedFramework = await ask("\nSelect SDD framework:", frameworks, false);
    }
  } else {
    const requested = selectedFramework === 'speckit' ? 'spec-kit' : selectedFramework === 'generic' ? 'none' : selectedFramework;
    const builtin = frameworks.slice(0, 3).find(f => f === requested || f.startsWith(requested));
    // Anything that is not a built-in is a custom adapter, validated before any file is written.
    selectedFramework = builtin || resolveCustomAdapter(requested, targetDir);
  }
  if (selectedFramework && selectedFramework.endsWith(' (custom adapter)')) {
    selectedFramework = resolveCustomAdapter(selectedFramework.replace(' (custom adapter)', ''), targetDir);
  }

  if (!selectedFramework) {
    console.log('No framework selected. Exiting.');
    process.exit(0);
  }

  const framework = selectedFramework === 'none (framework-agnostic)' ? 'none' : selectedFramework;
  console.log(`\nFramework: ${framework === 'none' ? 'framework-agnostic' : framework}`);

  const requestedAdapter = framework === "none" ? "generic" : framework;
  const existingAdapter = readPersistedAdapter(targetDir);
  if (existingAdapter) {
    if (existingAdapter !== requestedAdapter) {
      if (opts.overwrite) {
        if (opts.overwrite !== "replace") {
          throw new Error("Cannot switch adapter from " + existingAdapter + " to " + requestedAdapter + " with --overwrite " + opts.overwrite + ". Use --overwrite replace so installed prompts are regenerated.");
        }
      }
    }
  }

  // Code host for pull-request skills; resolved before any file is written so a bad custom forge fails early.
  const workspaceRepositories = resolveWorkspaceRepositories(targetDir);
  const { forge, reason: forgeReason } = resolveSelectedForge(opts.forge, targetDir, workspaceRepositories.codeDirectory || targetDir);
  console.log(`Forge: ${forge} (${forgeReason})`);

  let selectedCommands;
  if (opts.commands) {
    selectedCommands = parseCommandSelection(opts.commands);
  } else {
    selectedCommands = [...COMMANDS];
  }

  if (!selectedCommands || selectedCommands.length === 0) {
    throw new Error("No commands selected. Use a canonical command name, index, or alias: all, review, pr.");
  }

  for (const agent of selectedAgents) {
    const isAgy = agent === 'antigravity';
    let cmdDir;
    let workflowsDir = null;
    
    if (isAgy) {
      cmdDir = path.join(targetDir, '.agent/skills');
      workflowsDir = path.join(targetDir, '.agent/workflows');
    } else {
      const cfg = AGENT_CONFIGS[agent];
      cmdDir = path.join(targetDir, cfg.dir);
    }

    for (const cmd of selectedCommands) {
      await installCommand(agent, cmd, cmdDir, { ...opts, targetDir, forgeName: forge, adapterName: framework === 'none' ? 'generic' : framework }, isAgy ? workflowsDir : null);
    }
  }

  if (selectedAgents.includes('claude')) {
    let enableTeams = opts.claudeAgentTeams;
    if (!enableTeams && !opts.yes) {
      const answer = await ask('\nEnable Claude Code Agent Teams / Teammates (Beta / Experimental - unstable)? (y/n): ', null);
      if (answer && ['y', 'yes'].includes(String(answer).toLowerCase())) {
        enableTeams = true;
      }
    }
    if (enableTeams) {
      configureClaudeAgentTeams(targetDir);
    }
  }

  const runtimeDir = path.join(targetDir, '.architecture-guard');
  fs.mkdirSync(runtimeDir, { recursive: true });

  const isVendor = Boolean(opts.vendor || opts.full);
  if (isVendor) {
    await installRuntimeResources(runtimeDir, opts);
  } else {
    pruneVendoredCopies(runtimeDir, opts.overwrite);
  }

  const adapter = framework === "none" ? "generic" : framework;
  installAdapters(targetDir, opts.overwrite === "skip" || opts.overwrite === "keep-both");

  writeInstallerConfig(path.join(runtimeDir, 'config.yml'), adapter, workspaceRepositories.record);
  for (const message of workspaceRepositories.messages) console.log(message);
  fs.writeFileSync(path.join(runtimeDir, 'selected-adapter'), `${adapter}\n`);
  installForges(targetDir, opts.overwrite === "skip" || opts.overwrite === "keep-both");
  fs.writeFileSync(path.join(runtimeDir, 'selected-forge'), `${forge}\n`);

  if (adapter === 'generic') {
    const flowDir = path.join(runtimeDir, 'flow');
    fs.mkdirSync(flowDir, { recursive: true });
    const defaultFlowSrc = path.join(ROOT_DIR, 'flow', 'default.md');
    const defaultFlowDest = path.join(flowDir, 'default.md');
    if (fs.existsSync(defaultFlowSrc)) {
      const preserveFlow = opts.overwrite === 'skip';
      if (!fs.existsSync(defaultFlowDest) || !preserveFlow) {
        fs.copyFileSync(defaultFlowSrc, defaultFlowDest);
      }
    }
  }

  appendAgentsMd(targetDir, selectedAgents);

  console.log('\nInstallation complete!');
  console.log(`Target: ${targetDir}`);
  console.log(`Commands installed: ${selectedCommands.length}`);
  console.log(`Agents: ${selectedAgents.join(', ')}`);
  console.log(`Adapter: .architecture-guard/adapters/${adapter}.md`);
  console.log(`Forge: .architecture-guard/forges/${forge}.md`);
  console.log('Resolution: .architecture-guard/adapters/resolve.md');
}

export async function runInstallCommand(target: any, opts: any) {
  opts.target = target;
  opts.agents = opts.agent;
  const targetDir = target ? path.resolve(target) : process.cwd();
  // --yes never prompts, so never wait on stdin (it may stay open in shells and CI runners).
  if (!opts.yes) await readAllStdin();
  validateRuntimeResources();
  requireInteractiveOrYes(opts);
  await runInit(targetDir, opts);
}

export {
  installCommand,
  requiredAdapterKeys,
  missingAdapterKeys,
  adapterKeys,
  BUILTIN_ADAPTERS,
  AGENT_CONFIGS,
  COMMANDS,
  COMMAND_ALIASES,
  appendAgentsMd,
  installToml,
  installYaml,
  materializeAdapterTokens,
  parseCommandSelection,
  validateRuntimeResources,
};
