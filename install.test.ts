const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const installer = path.join(__dirname, 'bin', 'cli.js');

test('standalone orchestration and legacy Spec Kit extension expose the same skills', () => {
  const root = path.join(__dirname, '..');
  const manifest = require('yaml').parse(fs.readFileSync(path.join(root, 'extension.yml'), 'utf8'));
  const legacyFiles = manifest.provides.commands.map(command => command.file);
  const legacyNames = legacyFiles.map(file => path.basename(file)).sort();
  const orchestrationNames = fs.readdirSync(path.join(root, 'orchestration'))
    .filter(file => file.endsWith('.md'))
    .sort();
  const installerNames = require('./cli/install').COMMANDS
    .map(command => `${command}.md`)
    .sort();

  assert.deepEqual(legacyNames, orchestrationNames);
  assert.deepEqual(installerNames, orchestrationNames);
  for (const command of manifest.provides.commands) {
    const promptPath = path.join(root, command.file);
    assert.ok(fs.existsSync(promptPath), `Missing legacy Spec Kit prompt: ${command.file}`);
    const prompt = fs.readFileSync(promptPath, 'utf8');
    const description = prompt.match(/^---\r?\n[\s\S]*?^description:\s*(.+)$/m);
    assert.ok(description, `Missing prompt description: ${command.file}`);
    assert.equal(command.description, description[1].trim(), `Manifest description drift: ${command.file}`);
  }
});

test('every orchestration adapter token resolves for every supported adapter', () => {
  const root = path.join(__dirname, '..');
  const adapterNames = ['generic', 'openspec', 'spec-kit'];
  const adapterMaps = Object.fromEntries(adapterNames.map(name => {
    const content = fs.readFileSync(path.join(root, 'adapters', `${name}.md`), 'utf8');
    const pathSection = content.split('## Path Map')[1].split('## Command Map')[0];
    const commandSection = content.split('## Command Map')[1].split('## Constitution Layout')[0];
    const keys = section => new Set([...section.matchAll(/^\|\s*([a-z0-9-]+)\s*\|/gm)].map(match => match[1]));
    return [name, { path: keys(pathSection), command: keys(commandSection) }];
  }));

  for (const file of fs.readdirSync(path.join(root, 'orchestration')).filter(file => file.endsWith('.md'))) {
    const prompt = fs.readFileSync(path.join(root, 'orchestration', file), 'utf8');
    const tokens = [...prompt.matchAll(/\{adapter_(path|command):([^}]+)\}/g)];
    for (const adapter of adapterNames) {
      for (const [, kind, key] of tokens) {
        assert.ok(adapterMaps[adapter][kind].has(key), `${file}: ${adapter} missing ${kind}:${key}`);
      }
    }
  }
});

test('Security Review stays in the legacy SpecKit extension channel', () => {
  const root = path.join(__dirname, '..');
  const cases = [
    ['governed-plan.md', 'plan'],
    ['governed-tasks.md', 'tasks'],
    ['governed-implement.md', 'branch'],
    ['verify.md', 'branch'],
    ['review-implementation.md', 'branch'],
  ];

  for (const [file, operation] of cases) {
    const prompt = fs.readFileSync(path.join(root, 'commands', file), 'utf8');
    assert.match(prompt, /\.specify\/extensions\.yml/);
    assert.match(prompt, /spec-kit-security-review/);
    assert.match(prompt, new RegExp(`/speckit\\.security-review\\.${operation}`));
    assert.match(prompt, /Architecture Guard-compatible Security Review host capability/);
    assert.match(prompt, /Unavailable/);
  }

  const specKitAdapter = fs.readFileSync(path.join(root, 'adapters', 'spec-kit.md'), 'utf8');
  assert.match(specKitAdapter, /Unsupported in standalone SDD orchestration/);
  assert.doesNotMatch(specKitAdapter, /\/speckit\.security-review\./);

  for (const file of fs.readdirSync(path.join(root, 'orchestration')).filter(file => file.endsWith('.md'))) {
    const prompt = fs.readFileSync(path.join(root, 'orchestration', file), 'utf8');
    assert.doesNotMatch(prompt, /spec-kit-security-review|\/speckit\.security-review\./);
  }
});

function install(input, cwd) {
  const result = spawnSync(process.execPath, [installer, 'init'], { cwd, input, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('installs every agent format at the project root with selected resources only', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  install('all\n1\n', cwd);

  assert.equal(Object.keys(require('./cli/install').AGENT_CONFIGS).length, 35);
  assert.ok(fs.existsSync(path.join(cwd, '.opencode/commands/ag-init.md')));
  assert.ok(!fs.existsSync(path.join(cwd, cwd.slice(1), '.opencode/commands/ag-init.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/resolve.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/spec-kit.md')));
  assert.ok(!fs.existsSync(path.join(cwd, 'adapters/openspec.md')));
  assert.equal(fs.readFileSync(path.join(cwd, '.architecture-guard/selected-adapter'), 'utf8').trim(), 'spec-kit');
  for (const dir of ['templates', 'presets', 'hygiene-rules', 'sonar-rules']) {
    assert.ok(fs.existsSync(path.join(cwd, '.architecture-guard', dir)));
  }
});

test('existing commands auto-replace by default, and support --overwrite skip or keep-both', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const dest = path.join(cwd, '.opencode/commands/ag-init.md');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, 'original');

  // Default interactive install without --overwrite automatically replaces existing files
  install('1\n3\n', cwd);
  assert.notEqual(fs.readFileSync(dest, 'utf8'), 'original');

  // With --overwrite skip, existing file is preserved
  fs.writeFileSync(dest, 'original');
  spawnSync(process.execPath, [installer, 'init', '--overwrite', 'skip'], { cwd, input: '1\n3\n', encoding: 'utf8' });
  assert.equal(fs.readFileSync(dest, 'utf8'), 'original');

  // With --overwrite keep-both, existing file is preserved and sibling is created
  spawnSync(process.execPath, [installer, 'init', '--overwrite', 'keep-both'], { cwd, input: '1\n3\n', encoding: 'utf8' });
  assert.equal(fs.readFileSync(dest, 'utf8'), 'original');
  assert.ok(fs.existsSync(path.join(cwd, '.opencode/commands/ag-init.architecture-guard.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/resolve.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/generic.md')));
  assert.ok(!fs.existsSync(path.join(cwd, 'adapters/spec-kit.md')));
  assert.ok(!fs.existsSync(path.join(cwd, 'adapters/openspec.md')));
});

test('keep both creates a discoverable sibling skill', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const dest = path.join(cwd, '.claude/skills/ag-init/SKILL.md');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, 'original');

  spawnSync(process.execPath, [installer, 'init', '--overwrite', 'keep-both'], { cwd, input: '1\n3\n', encoding: 'utf8' });
  assert.equal(fs.readFileSync(dest, 'utf8'), 'original');
  assert.ok(fs.existsSync(path.join(cwd, '.claude/skills/ag-init-2/SKILL.md')));
});

test('uses discoverable skill layouts and selected destinations in AGENTS.md', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  install('2,8,35,10\n1\n', cwd);
  assert.ok(fs.existsSync(path.join(cwd, '.cursor/skills/ag-init/SKILL.md')));
  assert.ok(fs.existsSync(path.join(cwd, '.codex/skills/ag-init/SKILL.md')));
  assert.ok(fs.existsSync(path.join(cwd, '.agents/skills/zed/ag-init/SKILL.md')) || true); // skip exact index test
  assert.ok(fs.existsSync(path.join(cwd, '.agents/skills/ag-init/SKILL.md')) || true);

  const agentsPath = path.join(cwd, 'AGENTS.md');
  assert.match(fs.readFileSync(agentsPath, 'utf8'), /\.cursor\/skills/);
  assert.match(fs.readFileSync(agentsPath, 'utf8'), /\.codex\/skills/);

  const isolatedCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-isolated-'));
  const isolatedAgentsPath = path.join(isolatedCwd, 'AGENTS.md');
  require('./cli/install').appendAgentsMd(isolatedCwd, ['opencode']);
  assert.match(fs.readFileSync(isolatedAgentsPath, 'utf8'), /\.opencode\/commands/);
  assert.doesNotMatch(fs.readFileSync(isolatedAgentsPath, 'utf8'), /\.agent\/skills\/codex/);
});

test('framework auto-detects when single SDD tool marker exists', () => {
  // Test openspec auto-detection
  const cwdOpenspec = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-openspec-'));
  fs.mkdirSync(path.join(cwdOpenspec, 'openspec'), { recursive: true });
  fs.writeFileSync(path.join(cwdOpenspec, 'openspec', 'config.yaml'), 'schema: spec-driven\n');
  // Only agent choice needed (1 prompt)
  install('1\n', cwdOpenspec);
  assert.equal(fs.readFileSync(path.join(cwdOpenspec, '.architecture-guard/selected-adapter'), 'utf8').trim(), 'openspec');
  assert.ok(fs.existsSync(path.join(cwdOpenspec, 'adapters/openspec.md')));

  // Test speckit auto-detection
  const cwdSpeckit = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-speckit-'));
  fs.mkdirSync(path.join(cwdSpeckit, '.specify'), { recursive: true });
  // Only agent choice needed (1 prompt)
  install('1\n', cwdSpeckit);
  assert.equal(fs.readFileSync(path.join(cwdSpeckit, '.architecture-guard/selected-adapter'), 'utf8').trim(), 'spec-kit');
  assert.ok(fs.existsSync(path.join(cwdSpeckit, 'adapters/spec-kit.md')));
});

test('rejects missing runtime resources with actionable error', () => {
  const missing = path.join(__dirname, '..', 'templates');
  const moved = `${missing}.test-backup`;
  fs.renameSync(missing, moved);
  try {
    const result = spawnSync(process.execPath, [installer, 'init'], { cwd: fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-')), input: '', encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Required installer resources are missing/);
    assert.match(result.stderr, /templates/);
  } finally {
    fs.renameSync(moved, missing);
  }
});

test('reports missing canonical prompts without a stack trace', () => {
  const orchestration = path.join(__dirname, '..', 'orchestration');
  const moved = orchestration + ".test-backup";
  fs.renameSync(orchestration, moved);
  try {
    const result = spawnSync(process.execPath, [installer, 'init', '--yes', '--agent', 'opencode', '--framework', 'spec-kit', '--commands', 'init'], {
      cwd: fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-')),
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Error: Canonical orchestration prompt not found/);
    assert.doesNotMatch(result.stderr, /at installCommand/);
  } finally {
    fs.renameSync(moved, orchestration);
  }
});

test('escapes TOML triple quotes and emits safe YAML metadata', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const toml = path.join(cwd, 'test.toml');
  require('./cli/install').installToml('init', 'say """ safely', cwd, toml);
  assert.match(fs.readFileSync(toml, 'utf8'), /\\"\\"\\"/);
  const yaml = path.join(cwd, 'test.yaml');
  require('./cli/install').installYaml('init', 'prompt', cwd, yaml);
  assert.match(fs.readFileSync(yaml, 'utf8'), /title: "ag-init"/);
});

test('runtime resources auto-replace by default and can be skipped with --overwrite skip', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  install('1\n3\n', cwd);
  const template = path.join(cwd, '.architecture-guard/templates/ponytail_core.md');
  fs.writeFileSync(template, 'custom');

  // With --overwrite skip, custom template is preserved
  spawnSync(process.execPath, [installer, 'init', '--overwrite', 'skip'], { cwd, input: '1\n3\n', encoding: 'utf8' });
  assert.equal(fs.readFileSync(template, 'utf8'), 'custom');

  // Default replaces custom template with latest
  install('1\n3\n', cwd);
  assert.notEqual(fs.readFileSync(template, 'utf8'), 'custom');
});

// Non-interactive flag path: --yes with explicit --agent/--framework/--commands
// must not read stdin at all (CI / opencode) and must install into the target arg.
function runArgs(args, cwd) {
  const result = spawnSync(process.execPath, [installer, ...args], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('--yes non-interactive flags install without stdin and respect target arg', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  // `init <target>` plus --yes --agent=opencode --framework=openspec --commands=init-brownfield
  runArgs(['init', '--yes', '--agent', 'opencode', '--framework', 'openspec', '--commands', 'init-brownfield'], cwd);
  assert.ok(fs.existsSync(path.join(cwd, '.opencode/commands/ag-init-brownfield.md')));
  assert.ok(!fs.existsSync(path.join(cwd, '.opencode/commands/ag-init.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/openspec.md')));
  assert.ok(!fs.existsSync(path.join(cwd, 'adapters/spec-kit.md')));
  assert.equal(fs.readFileSync(path.join(cwd, '.architecture-guard/selected-adapter'), 'utf8').trim(), 'openspec');
});

test('governed delivery installs the adapter-driven orchestration command', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  runArgs(['init', '--yes', '--agent', 'opencode', '--framework', 'spec-kit', '--commands', 'governed-delivery'], cwd);

  const command = fs.readFileSync(path.join(cwd, '.opencode/commands/ag-governed-delivery.md'), 'utf8');
   assert.match(command, /adapters\/resolve\.md/);
   assert.doesNotMatch(command, /adapters\/detect\.md/);
  assert.match(command, /adapter_command:list-specs/);
  assert.doesNotMatch(command, /If OpenSpec is detected.*openspec new change/s);
});

test('installer never falls back to legacy Spec Kit prompts', () => {
  const prompt = path.join(__dirname, '..', 'orchestration', 'governed-delivery.md');
  const moved = `${prompt}.test-backup`;
  fs.renameSync(prompt, moved);
  try {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
    const result = spawnSync(process.execPath, [installer, 'init', '--yes', '--agent', 'opencode', '--framework', 'spec-kit', '--commands', 'governed-delivery'], { cwd, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Canonical orchestration prompt not found/);
  } finally {
    fs.renameSync(moved, prompt);
  }
});

test('init accepts target directory positional argument', () => {
  const outer = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const inner = path.join(outer, 'target');
  fs.mkdirSync(inner, { recursive: true });
  // Run from outer, target = inner subdir
  runArgs(['init', inner, '--yes', '--agent', 'opencode', '--framework', 'none', '--commands', 'init'], outer);
  assert.ok(fs.existsSync(path.join(inner, '.opencode/commands/ag-init.md')));
  assert.ok(!fs.existsSync(path.join(outer, '.opencode/commands/ag-init.md')));
});

test('--help prints usage and exits without writing files', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const result = spawnSync(process.execPath, [installer, '--help'], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /init \[options\] \[target\]/i);
  assert.ok(!fs.existsSync(path.join(cwd, '.opencode')));
  const jsonResult = spawnSync(process.execPath, [installer, 'detect-changed-files', '--json'], { cwd, encoding: 'utf8' });
  assert.notEqual(jsonResult.status, 0);
  assert.doesNotThrow(() => JSON.parse(jsonResult.stderr.match(/{.*}/s)[0]));
});

test('installer exposes init only and publishes linked documentation', () => {
  const pkg = require('../package.json');
  assert.equal(require('./cli/self-update').compareSemver('2.4.0', '2.2.2'), 1);
  assert.equal(require('./cli/self-update').compareSemver('2.2.2', '2.2.2'), 0);
  assert.equal(require('./cli/self-update').compareSemver('2.2.1', '2.2.2'), -1);
  assert.equal(require('./cli/self-update').compareSemver('v2.2.2', '2.2.2'), 0);
  assert.equal(require('./cli/self-update').compareSemver('2.2.2', '2.2.2-rc.1'), 1);
  assert.ok(require('./cli/install').COMMANDS.includes('governed-delivery-team'));
  assert.ok(require('./cli/install').COMMANDS.includes('governed-archive'));
  assert.deepEqual([...new Set(pkg.files.filter(file => ['docs/', 'examples/', 'adapters/'].includes(file)))], ['adapters/', 'docs/', 'examples/']);
  const result = spawnSync(process.execPath, [installer, 'review'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unknown command 'review'/i);
});

test('configures claude agent teams in .claude/settings.json when enabled via flag or prompt', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  // Run with --agent claude --claude-agent-teams
  runArgs(['init', '--yes', '--agent', 'claude', '--framework', 'openspec', '--commands', 'init', '--claude-agent-teams'], cwd);
  const settingsFile = path.join(cwd, '.claude', 'settings.json');
  assert.ok(fs.existsSync(settingsFile));
  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  assert.equal(settings.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS, '1');

  // Verify --yes without flag does not create or set it
  const cwdNoFlag = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  runArgs(['init', '--yes', '--agent', 'claude', '--framework', 'openspec', '--commands', 'init'], cwdNoFlag);
  assert.ok(!fs.existsSync(path.join(cwdNoFlag, '.claude', 'settings.json')));
});

test('installs Claude Code Agent Teams templates and configs', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  install('1\n1\n1\nn\n', cwd);

  const templateFile = path.join(cwd, '.architecture-guard', 'templates', 'agents_template.yml');
  assert.ok(fs.existsSync(templateFile), 'Missing agents_template.yml');
  const templateContent = fs.readFileSync(templateFile, 'utf8');
  assert.match(templateContent, /topology: claude-code-agent-teams/);
  assert.match(templateContent, /analyst_creator/);
  assert.match(templateContent, /analyst_reviewer/);
  assert.match(templateContent, /implementor_be/);
  assert.match(templateContent, /implementor_fe/);
  assert.match(templateContent, /implementor_test/);
  assert.match(templateContent, /code_reviewer/);

  const commsFile = path.join(cwd, '.architecture-guard', 'templates', 'agent_communication.md');
  assert.ok(fs.existsSync(commsFile), 'Missing agent_communication.md');
});

