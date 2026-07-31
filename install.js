#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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
    // Drain piped answers only when stdout is not interactive (tests, CI, redirects).
    // Interactive stdout => readline prompts work even if stdin is a pipe (opencode).
    if (!process.stdout.isTTY) {
      const rl = require('readline').createInterface({ input: process.stdin });
      const lines = [];
      rl.on('line', (l) => lines.push(l));
      rl.on('close', () => { _inputLines = lines; _inputIdx = 0; resolve(); });
    } else {
      resolve();
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
  codex:        { dir: '.agents/skills/codex', ext: '/SKILL.md' },
  zed:          { dir: '.agents/skills/zed',   ext: '/SKILL.md' },
  agy:          { dir: '.agents/skills/agy',   ext: '/SKILL.md' },
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
  'governed-implement',
  'architecture-review',
  'architecture-verify',
  'architecture-apply',
  'architecture-workflow',
  'violation-detection',
  'refactor-generator',
  'consolidate-specs',
];

async function ask(promptText, choices, multi = false) {
  if (choices) {
    console.log(promptText);
    choices.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    const hint = multi
      ? 'Enter numbers separated by commas (e.g., 1,3,5) or "all": '
      : 'Enter number: ';
    process.stdout.write(hint);
  } else {
    process.stdout.write(promptText);
  }

  const input = await nextLine();
  if (!choices) return input;
  if (multi) {
    if (input.trim().toLowerCase() === 'all') return choices;
    const indices = input.split(',').map(s => parseInt(s.trim()) - 1).filter(i => i >= 0 && i < choices.length);
    return indices.map(i => choices[i]);
  }
  const idx = parseInt(input.trim()) - 1;
  return (idx >= 0 && idx < choices.length) ? choices[idx] : null;
}

function slug(name) {
  return name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

function readPrompt(promptPath) {
  return fs.readFileSync(promptPath, 'utf8');
}

function installMarkdown(sk, content, cmdDir, dest) {
  dest ||= path.join(cmdDir, `${sk}.md`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

function installSkillMd(sk, content, cmdDir, dest) {
  dest ||= path.join(cmdDir, `architecture-guard-${sk}`, 'SKILL.md');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const frontmatter = `---
name: ${sk}
description: Architecture Guard governance command: ${sk}
allowed-tools: "*"
metadata:
  author: architecture-guard
  source: https://github.com/DyanGalih/spec-kit-architecture-guard
---

${content.trim()}`;
  fs.writeFileSync(dest, frontmatter);
}

function installToml(sk, content, cmdDir, dest) {
  dest ||= path.join(cmdDir, `${sk}.toml`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const toml = `description = "Architecture Guard: ${sk}"

prompt = """
${content.trim().replace(/"""/g, '\\"\\"\\"')}
"""
`;
  fs.writeFileSync(dest, toml);
}

function installYaml(sk, content, cmdDir, dest) {
  dest ||= path.join(cmdDir, `${sk}.yaml`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const yamlQuote = value => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n')}"`;
  const yaml = `version: "1.0"
title: ${yamlQuote(sk)}
description: ${yamlQuote(`Architecture Guard: ${sk}`)}
prompt: |2
  ${content.trim().replace(/\n/g, '\n  ')}
`;
  fs.writeFileSync(dest, yaml);
}

function commandDestination(cfg, sk, cmdDir) {
  return cfg.ext === '/SKILL.md'
    ? path.join(cmdDir, `architecture-guard-${sk}`, 'SKILL.md')
    : path.join(cmdDir, `${sk}${cfg.ext}`);
}

function availableCopy(dest, cfg, sk, cmdDir) {
  if (cfg.ext === '/SKILL.md') {
    let candidate = path.join(cmdDir, `architecture-guard-${sk}-2`, 'SKILL.md');
    for (let i = 2; fs.existsSync(candidate); i++) {
      candidate = path.join(cmdDir, `architecture-guard-${sk}-${i + 1}`, 'SKILL.md');
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

async function installCommand(agentType, commandName, cmdDir, opts = {}) {
  const cfg = AGENT_CONFIGS[agentType];
  if (!cfg) return;
  const yes = !!opts.yes;
  const overwrite = opts.overwrite;

  // Read from orchestration dir if it exists, fallback to commands dir
  const orchestrationPath = path.join(__dirname, 'orchestration', `${commandName}.md`);
  const commandsPath = path.join(__dirname, 'commands', `${commandName}.md`);
  const promptPath = fs.existsSync(orchestrationPath) ? orchestrationPath : commandsPath;

  if (!fs.existsSync(promptPath)) {
    console.error(`  ✗ ${commandName}: prompt file not found`);
    return;
  }

  const content = readPrompt(promptPath);
  const sk = slug(commandName);
  let dest = commandDestination(cfg, sk, cmdDir);

  if (fs.existsSync(dest)) {
    // ponytail: --yes is for CI idempotency — repeated runs should replace, not accumulate
    // `init.architecture-guard-2.md`, `-3.md`, ... Save-the-original behavior is opt-in via
    // `--overwrite keep-both`; interactive users still get the 3-way prompt.
    const action = yes
      ? (overwrite === 'keep-both' ? 'keep both' : (overwrite === 'skip' ? 'skip' : 'replace'))
      : await ask(`  ${path.relative(process.cwd(), dest)} exists:`, ['skip', 'replace', 'keep both']);
    if (action !== 'replace' && action !== 'keep both') {
      console.log(`  → ${commandName}: skipped`);
      return;
    }
    if (action === 'keep both') dest = availableCopy(dest, cfg, sk, cmdDir);
  }

  try {
    if (cfg.ext === '.md') {
      installMarkdown(sk, content, cmdDir, dest);
    } else if (cfg.ext === '/SKILL.md') {
      installSkillMd(sk, content, cmdDir, dest);
    } else if (cfg.ext === '.toml') {
      installToml(sk, content, cmdDir, dest);
    } else if (cfg.ext === '.yaml') {
      installYaml(sk, content, cmdDir, dest);
    }
    console.log(`  ✓ ${commandName} → ${agentType}`);
  } catch (err) {
    console.error(`  ✗ ${commandName}: ${err.message}`);
  }
}

function appendAgentsMd(projectPath, selectedAgents) {
  const agentsPath = path.join(projectPath, 'AGENTS.md');
  const preamble = `

## Architecture Guard

Use these governance rules across all SDD workflow phases.
Read the installed governance commands or skills at:
${selectedAgents.map(agent => `- \`${path.join(AGENT_CONFIGS[agent].dir, '*')}\``).join('\n')}

- **Ponytail Core Contract**: Before spec/plan/tasks/implement, read and apply the ponytail pragmatism contract.
- **After each phase**: Run architecture review for boundary drift, DRY violations, and repository hygiene.
- **Framework detection**: Project uses auto-detected SDD framework. Read \`adapters/detect.md\` before first command.
`;

  if (fs.existsSync(agentsPath)) {
    const current = fs.readFileSync(agentsPath, 'utf8');
    if (!current.includes('Architecture Guard')) {
      fs.appendFileSync(agentsPath, preamble);
      console.log(`  ✓ Appended rules to AGENTS.md`);
    } else {
      console.log(`  → AGENTS.md already has Architecture Guard rules, skipped`);
    }
  } else {
    fs.writeFileSync(agentsPath, preamble.trimStart());
    console.log(`  ✓ Created AGENTS.md with Architecture Guard rules`);
  }
}

async function installRuntimeResources(runtimeDir, yes = false) {
  const hasResources = fs.existsSync(runtimeDir);
  const action = hasResources
    ? (yes ? 'replace' : await ask('Runtime resources exist:', ['skip', 'replace']))
    : 'replace';

  if (action !== 'replace') {
    console.log('  → Runtime resources: skipped');
    return;
  }

  for (const dir of ['templates', 'presets', 'hygiene-rules', 'sonar-rules']) {
    fs.cpSync(path.join(__dirname, dir), path.join(runtimeDir, dir), { recursive: true, force: true });
  }
  for (const script of ['bash/detect-changed-files.sh', 'powershell/detect-changed-files.ps1']) {
    const dest = path.join(runtimeDir, 'scripts', script);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(__dirname, 'scripts', script), dest);
  }
}

function validateRuntimeResources() {
  const required = [
    ...['templates', 'presets', 'hygiene-rules', 'sonar-rules'].map(dir => path.join(__dirname, dir)),
    path.join(__dirname, 'scripts', 'bash/detect-changed-files.sh'),
    path.join(__dirname, 'scripts', 'powershell/detect-changed-files.ps1'),
  ];
  const missing = required.filter(resource => !fs.existsSync(resource));
  if (missing.length) {
    throw new Error(`Required installer resources are missing:\n${missing.map(resource => `  - ${resource}`).join('\n')}\nRestore the complete src runtime resource bundle before installing.`);
  }
}

function parseArgs(argv) {
  const opts = { target: null, agents: null, framework: null, commands: null, overwrite: null, yes: false, help: false, values: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '-h': case '--help':
        opts.help = true; break;
      case '-y': case '--yes':
        opts.yes = true; break;
      case '--overwrite':
        opts.overwrite = argv[++i]; break;
      case '--agent': case '--agents':
        opts.agents = argv[++i]; break;
      case '--framework':
        opts.framework = argv[++i]; break;
      case '--commands': case '--command':
        opts.commands = argv[++i]; break;
      case '--':
        opts.values = argv.slice(i + 1); i = argv.length; break;
      default:
        if (a.startsWith('--agent=')) opts.agents = a.slice('--agent='.length);
        else if (a.startsWith('--framework=')) opts.framework = a.slice('--framework='.length);
        else if (a.startsWith('--commands=')) opts.commands = a.slice('--commands='.length);
        else if (a.startsWith('--overwrite=')) opts.overwrite = a.slice('--overwrite='.length);
        else if (!a.startsWith('-')) { opts.values.push(a); }
        break;
    }
  }
  return opts;
}

function printHelp() {
  console.log(`architecture-guard init [target] [options]

Install governance commands and adapters for an AI agent in the target directory.

Arguments:
  target              Target directory (default: current directory)

Options:
  -h, --help          Show this help
  -y, --yes           Non-interactive: use defaults or required flags
  --agent <names>     Comma-separated agent keys (e.g. opencode,claude)
  --framework <f>     spec-kit | openspec | none
  --commands <list>   Comma-separated command names or indices (e.g. init,init-brownfield or 1,2)
  --overwrite <mode>  With --yes: replace | skip | keep-both (default: replace for CI idempotency)

When --yes is set, --agent/--framework/--commands are honored; any missing value
falls back to its first valid option. Without --overwrite, --yes replaces existing
files; use --overwrite keep-both to preserve originals, or --overwrite skip to skip them.`);
}

const REQUIRED_RESOURCES = (dir) => dir === __dirname;

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { printHelp(); return; }
  console.log('Architecture Guard Installer\n');
  await readAllStdin();
  validateRuntimeResources();
  requireInteractiveOrYes(opts);

  const positional = opts.values.filter(v => v !== 'init');
  const target = opts.target || positional[0] || process.cwd();
  const targetDir = path.resolve(target);

  const agentNames = Object.keys(AGENT_CONFIGS).sort();
  const selectedAgents = opts.agents
    ? opts.agents.split(',').map(s => s.trim()).filter(a => AGENT_CONFIGS[a])
    : await ask('Select AI agent(s) to install commands for:', agentNames, true);

  if (!selectedAgents || selectedAgents.length === 0) {
    console.log('No agents selected. Exiting.');
    process.exit(0);
  }

  const frameworks = ['spec-kit', 'openspec', 'none (framework-agnostic)'];
  let selectedFramework = opts.framework;
  if (!selectedFramework) {
    selectedFramework = await ask('\nSelect SDD framework:', frameworks, false);
  } else {
    const match = frameworks.find(f => f === selectedFramework || f.startsWith(selectedFramework));
    selectedFramework = match || (selectedFramework === 'none' ? 'none (framework-agnostic)' : selectedFramework);
  }

  if (!selectedFramework) {
    console.log('No framework selected. Exiting.');
    process.exit(0);
  }

  const framework = selectedFramework === 'none (framework-agnostic)' ? 'none' : selectedFramework;
  console.log(`\nFramework: ${framework === 'none' ? 'framework-agnostic' : framework}`);

  let selectedCommands;
  if (opts.commands) {
    selectedCommands = opts.commands.split(',')
      .map(s => /^\d+$/.test(s.trim()) ? COMMANDS[parseInt(s.trim(), 10) - 1] : s.trim())
      .filter(c => COMMANDS.includes(c));
  } else {
    selectedCommands = await ask('\nSelect governance commands to install:', COMMANDS, true);
  }

  if (!selectedCommands || selectedCommands.length === 0) {
    console.log('No commands selected. Exiting.');
    process.exit(0);
  }

  console.log(`\nInstalling ${selectedCommands.length} commands for ${selectedAgents.length} agent(s)...\n`);

  for (const agent of selectedAgents) {
    const cfg = AGENT_CONFIGS[agent];
    const cmdDir = path.join(targetDir, cfg.dir);

    for (const cmd of selectedCommands) {
      await installCommand(agent, cmd, cmdDir, opts);
    }
    console.log();
  }

  const runtimeDir = path.join(targetDir, '.architecture-guard');
  await installRuntimeResources(runtimeDir, opts.yes);

  const adaptersDir = path.join(targetDir, 'adapters');
  const srcAdaptersDir = path.join(__dirname, 'adapters');
  if (fs.existsSync(srcAdaptersDir)) {
    fs.mkdirSync(adaptersDir, { recursive: true });
    const adapter = framework === 'none' ? 'generic' : framework;
    for (const f of ['detect.md', `${adapter}.md`]) {
      const src = path.join(srcAdaptersDir, f);
      const dest = path.join(adaptersDir, f);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        console.log(`  ✓ Copied adapters/${f}`);
      }
    }
  }
  fs.writeFileSync(path.join(runtimeDir, 'selected-adapter'), `${framework === 'none' ? 'generic' : framework}\n`);

  const updateAgents = opts.yes || (await ask('\nAppend governance rules to AGENTS.md? (y/n): '));
  if (updateAgents && (opts.yes || ['y', 'yes'].includes(String(updateAgents).toLowerCase()))) {
    appendAgentsMd(targetDir, selectedAgents);
  }

  console.log('\nInstallation complete!');
  console.log(`Target: ${targetDir}`);
  console.log(`Commands installed: ${selectedCommands.length}`);
  console.log(`Agents: ${selectedAgents.join(', ')}`);
  console.log(`Adapter: adapters/${framework === 'none' ? 'generic' : framework}.md`);
  console.log(`Detection: adapters/detect.md`);
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { installCommand, AGENT_CONFIGS, COMMANDS, appendAgentsMd, installToml, installYaml, validateRuntimeResources };
