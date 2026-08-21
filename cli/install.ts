#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

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
  'verify',
  'apply',
  'workflow',
  'violation-detection',
  'refactor-generator',
  'consolidate-specs',
  'governed-archive',
];

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

  const frontmatter = `---
name: ag-${sk}
description: ${description}
metadata:
  author: architecture-guard
  source: https://github.com/DyanGalih/architecture-guard
---

${cleanContent}`;
  fs.writeFileSync(dest, frontmatter);
}

function installToml(sk, content, cmdDir, dest) {
  dest ||= path.join(cmdDir, `${sk}.toml`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const toml = `description = "Architecture Guard: ag-${sk}"

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

async function installCommand(agentType: any, commandName: any, cmdDir: any, opts: any = {}, workflowsDir: any = null) {
  const cfg = AGENT_CONFIGS[agentType];
  if (!cfg) return;
  const yes = !!opts.yes;
  const overwrite = opts.overwrite;

  const promptPath = path.join(ROOT_DIR, 'orchestration', `${commandName}.md`);
  if (!fs.existsSync(promptPath)) {
    throw new Error(`Canonical orchestration prompt not found: orchestration/${commandName}.md`);
  }

  const content = readPrompt(promptPath);
  const sk = slug(commandName);
  let dest = commandDestination(cfg, sk, cmdDir, agentType);

  if (fs.existsSync(dest)) {
    // ponytail: --yes is for CI idempotency — repeated runs should replace, not accumulate
    // `init.architecture-guard-2.md`, `-3.md`, ... Save-the-original behavior is opt-in via
    // `--overwrite keep-both`; interactive users still get the 3-way prompt.
    const action = yes || opts.batchPrompted
      ? (overwrite === 'keep-both' ? 'keep both' : (overwrite === 'skip' ? 'skip' : 'replace'))
      : (await ask(`  ${path.relative(process.cwd(), dest)} exists:`, ['skip', 'replace', 'keep both']) || 'skip');
    if (action !== 'replace' && action !== 'keep both') {
      console.log(`  → ${commandName}: skipped (action: ${action}, exists: ${fs.existsSync(dest)}, dest: ${dest}, batchPrompted: ${opts.batchPrompted})`);
      return;
    }
    if (action === 'keep both') dest = availableCopy(dest, cfg, sk, cmdDir, agentType);
  }

  try {
    if (cfg.ext === '.md') {
      installMarkdown(sk, content, cmdDir, dest);
    } else if (cfg.ext === '/SKILL.md') {
      installSkillMd(sk, content, cmdDir, dest, agentType);
    } else if (cfg.ext === '.toml') {
      installToml(sk, content, cmdDir, dest);
    } else if (cfg.ext === '.yaml') {
      installYaml(sk, content, cmdDir, dest);
    }
    
    let wfMsg = '';
    if (workflowsDir) {
      const wfDest = path.join(workflowsDir, `agx-${sk}.md`);
      fs.mkdirSync(path.dirname(wfDest), { recursive: true });
      fs.writeFileSync(wfDest, content);
      wfMsg = ' (+ workflow)';
    }
    
    console.log(`  ✓ ${commandName} → ${agentType}${wfMsg}`);
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
- **SDD Adapter Resolution**: Project uses the adapter selected during CLI init. Read \`adapters/resolve.md\` before first command.
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

  for (const dir of REQUIRED_RESOURCES) {
    fs.cpSync(path.join(ROOT_DIR, dir), path.join(runtimeDir, dir), { recursive: true, force: true });
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

function parseArgs(argv) {
  const opts = { target: null, agents: null, framework: null, commands: null, overwrite: null, yes: false, help: false, version: false, claudeAgentTeams: false, values: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '-h': case '--help':
        opts.help = true; break;
      case '-v': case '--version':
        opts.version = true; break;
      case '-y': case '--yes':
        opts.yes = true; break;
      case '--claude-agent-teams': case '--claude-teams':
        opts.claudeAgentTeams = true; break;
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
        else if (a === '--claude-agent-teams' || a === '--claude-teams') opts.claudeAgentTeams = true;
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
  target                Target directory (default: current directory)

Options:
  -h, --help            Show this help
  -y, --yes             Non-interactive: use defaults or required flags
  --agent <names>       Comma-separated agent keys (e.g. opencode,claude)
  --framework <f>       spec-kit | openspec | none
  --commands <list>     Comma-separated command names or indices (e.g. init,init-brownfield or 1,2)
  --overwrite <mode>    With --yes: replace | skip | keep-both (default: replace for CI idempotency)
  --claude-agent-teams  Enable Claude Code Agent Teams (Beta / Experimental)

When --yes is set, --agent/--framework/--commands are honored; any missing value
falls back to its first valid option. Without --overwrite, --yes replaces existing
files; use --overwrite keep-both to preserve originals, or --overwrite skip to skip them.`);
}

const REQUIRED_RESOURCES = ['templates', 'presets', 'hygiene-rules', 'sonar-rules'];

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { printHelp(); return; }
  
  if (opts.version) {
    const pkg = require('./package.json');
    console.log(`architecture-guard v${pkg.version}`);
    return;
  }

  const cmd = opts.values[0];
  if (cmd && cmd !== 'init') {
    console.error(`Unknown command: ${cmd}`);
    printHelp();
    process.exit(1);
  }

  console.log('Architecture Guard Installer\n');
  await readAllStdin();
  validateRuntimeResources();
  requireInteractiveOrYes(opts);

  const positional = opts.values.filter(v => v !== 'init');
  const userPath = opts.target || positional[0];
  const target = userPath || process.cwd();
  const targetDir = path.resolve(target);

  await runInit(targetDir, opts);
}

async function runInit(targetDir, opts) {
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

  const selectedAgents = opts.agents
    ? opts.agents.split(',').map(s => s.trim()).filter(a => AGENT_CONFIGS[a])
    : await ask('Select AI agent(s) to install commands for:', agentChoices, true);

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
    const choices = ['All', ...COMMANDS];
    selectedCommands = await ask('\nSelect governance commands to install:', choices, true);
    
    if (selectedCommands && selectedCommands.includes('All')) {
      selectedCommands = [...COMMANDS];
    }
  }

  if (!selectedCommands || selectedCommands.length === 0) {
    console.log('No commands selected. Exiting.');
    process.exit(0);
  }

  let agyScope = null;
  const userPath = opts.target;
  if (selectedAgents.includes('antigravity')) {
    if (!userPath) {
      const choices = ['Global (~/.gemini/antigravity-cli/skills)', 'Shared (~/.gemini/skills)', 'Workspace (current directory)'];
      const scopeChoice = opts.yes ? choices[0] : (await ask('\nNo target path provided. Where would you like to install Antigravity skills?', choices, false) || '');
      if (scopeChoice.startsWith('Global')) agyScope = 'global';
      else if (scopeChoice.startsWith('Shared')) agyScope = 'shared';
      else agyScope = 'workspace';
    } else {
      agyScope = 'workspace';
    }
  }

  console.log(`\nInstalling ${selectedCommands.length} commands for ${selectedAgents.length} agent(s)...\n`);

  for (const agent of selectedAgents) {
    const isAgy = agent === 'antigravity';
    let cmdDir;
    let workflowsDir = null;
    
    if (isAgy) {
      if (agyScope === 'global') {
        cmdDir = path.join(require('os').homedir(), '.gemini/antigravity-cli/skills');
        workflowsDir = path.join(require('os').homedir(), '.gemini/antigravity-cli/workflows');
      } else if (agyScope === 'shared') {
        cmdDir = path.join(require('os').homedir(), '.gemini/skills');
        workflowsDir = path.join(require('os').homedir(), '.gemini/workflows');
      } else {
        cmdDir = path.join(targetDir, '.agent/skills');
        workflowsDir = path.join(targetDir, '.agent/workflows');
      }
    } else {
      const cfg = AGENT_CONFIGS[agent];
      cmdDir = path.join(targetDir, cfg.dir);
    }

    let batchOverwrite = opts.overwrite;
    let batchPrompted = false;
    if (!opts.yes && !batchOverwrite && selectedCommands.length > 1) {
      let anyExists = false;
      for (const cmd of selectedCommands) {
        const sk = slug(cmd);
        const cfg = AGENT_CONFIGS[agent];
        const dest = isAgy ? path.join(cmdDir, `ag-${sk}`, 'SKILL.md') : commandDestination(cfg, sk, cmdDir, agent);
        if (fs.existsSync(dest)) {
          anyExists = true; break;
        }
      }
      if (anyExists) {
        const action = (await ask(`\nSome files already exist for ${agent}. What would you like to do for all of them?`, ['skip', 'replace', 'keep both'])) || 'skip';
        batchOverwrite = action === 'keep both' ? 'keep-both' : action;
        batchPrompted = true;
      }
    }

    const currentOpts = { ...opts, overwrite: batchOverwrite || opts.overwrite, batchPrompted };

    for (const cmd of selectedCommands) {
      await installCommand(agent, cmd, cmdDir, currentOpts, isAgy ? workflowsDir : null);
    }
    console.log();
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
  await installRuntimeResources(runtimeDir, opts.yes);

  const adaptersDir = path.join(targetDir, 'adapters');
  const srcAdaptersDir = path.join(ROOT_DIR, 'adapters');
  if (fs.existsSync(srcAdaptersDir)) {
    fs.mkdirSync(adaptersDir, { recursive: true });
    const adapter = framework === 'none' ? 'generic' : framework;
    for (const f of ['resolve.md', `${adapter}.md`]) {
      const src = path.join(srcAdaptersDir, f);
      const dest = path.join(adaptersDir, f);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        console.log(`  ✓ Copied adapters/${f}`);
      }
    }
  }
  fs.writeFileSync(path.join(runtimeDir, 'selected-adapter'), `${framework === 'none' ? 'generic' : framework}\n`);

  const updateAgents = opts.yes || (await ask('\nAppend governance rules to AGENTS.md? (y/n): ', null));
  if (updateAgents && (opts.yes || ['y', 'yes'].includes(String(updateAgents).toLowerCase()))) {
    appendAgentsMd(targetDir, selectedAgents);
  }

  console.log('\nInstallation complete!');
  console.log(`Target: ${targetDir}`);
  console.log(`Commands installed: ${selectedCommands.length}`);
  console.log(`Agents: ${selectedAgents.join(', ')}`);
  console.log(`Adapter: adapters/${framework === 'none' ? 'generic' : framework}.md`);
  console.log(`Resolution: adapters/resolve.md`);
}

export async function runInstallCommand(target: any, opts: any) {
  opts.target = target;
  opts.agents = opts.agent;
  const targetDir = target ? path.resolve(target) : process.cwd();
  await readAllStdin();
  validateRuntimeResources();
  requireInteractiveOrYes(opts);
  await runInit(targetDir, opts);
}

export { installCommand, AGENT_CONFIGS, COMMANDS, appendAgentsMd, installToml, installYaml, validateRuntimeResources };
