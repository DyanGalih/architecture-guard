const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const installer = path.join(__dirname, 'install.js');

function install(input, cwd) {
  const result = spawnSync(process.execPath, [installer], { cwd, input, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

test('installs every agent format at the project root with selected resources only', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  install('all\n1\n1\nn\n', cwd);

  assert.equal(Object.keys(require('./install').AGENT_CONFIGS).length, 35);
  assert.ok(fs.existsSync(path.join(cwd, '.opencode/commands/init.md')));
  assert.ok(!fs.existsSync(path.join(cwd, cwd.slice(1), '.opencode/commands/init.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/detect.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/spec-kit.md')));
  assert.ok(!fs.existsSync(path.join(cwd, 'adapters/openspec.md')));
  assert.equal(fs.readFileSync(path.join(cwd, '.architecture-guard/selected-adapter'), 'utf8').trim(), 'spec-kit');
  for (const dir of ['templates', 'presets', 'hygiene-rules', 'sonar-rules', 'scripts']) {
    assert.ok(fs.existsSync(path.join(cwd, '.architecture-guard', dir)));
  }
});

test('existing commands skip by default, replace, or keep both', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const dest = path.join(cwd, '.opencode/commands/init.md');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, 'original');

  install('24\n3\n1\n\nn\n', cwd);
  assert.equal(fs.readFileSync(dest, 'utf8'), 'original');
  install('24\n3\n1\n2\n\nn\n', cwd);
  assert.notEqual(fs.readFileSync(dest, 'utf8'), 'original');
  fs.writeFileSync(dest, 'original');
  install('24\n3\n1\n3\n\nn\n', cwd);
  assert.equal(fs.readFileSync(dest, 'utf8'), 'original');
  assert.ok(fs.existsSync(path.join(cwd, '.opencode/commands/init.architecture-guard.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/detect.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/generic.md')));
  assert.ok(!fs.existsSync(path.join(cwd, 'adapters/spec-kit.md')));
  assert.ok(!fs.existsSync(path.join(cwd, 'adapters/openspec.md')));
});

test('keep both creates a discoverable sibling skill', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const dest = path.join(cwd, '.claude/skills/architecture-guard-init/SKILL.md');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, 'original');

  install('5\n3\n1\n3\nn\n', cwd);
  assert.equal(fs.readFileSync(dest, 'utf8'), 'original');
  assert.ok(fs.existsSync(path.join(cwd, '.claude/skills/architecture-guard-init-2/SKILL.md')));
});

test('uses discoverable skill layouts and selected destinations in AGENTS.md', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  install('1,8,35,10\n1\n1\nn\n', cwd);
  assert.ok(fs.existsSync(path.join(cwd, '.cursor/skills/architecture-guard-init/SKILL.md')));
  assert.ok(fs.existsSync(path.join(cwd, '.agents/skills/codex/architecture-guard-init/SKILL.md')));
  assert.ok(fs.existsSync(path.join(cwd, '.agents/skills/zed/architecture-guard-init/SKILL.md')));
  assert.ok(fs.existsSync(path.join(cwd, '.agents/skills/agy/architecture-guard-init/SKILL.md')));

  const agentsPath = path.join(cwd, 'AGENTS.md');
  require('./install').appendAgentsMd(cwd, ['opencode']);
  assert.match(fs.readFileSync(agentsPath, 'utf8'), /\.opencode\/commands/);
  assert.doesNotMatch(fs.readFileSync(agentsPath, 'utf8'), /\.agents\/skills\/codex/);
});

test('rejects missing runtime resources with actionable error', () => {
  const missing = path.join(__dirname, 'templates');
  const moved = `${missing}.test-backup`;
  fs.renameSync(missing, moved);
  try {
    const result = spawnSync(process.execPath, [installer], { cwd: fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-')), input: '', encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Required installer resources are missing/);
    assert.match(result.stderr, /templates/);
  } finally {
    fs.renameSync(moved, missing);
  }
});

test('escapes TOML triple quotes and emits safe YAML metadata', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const toml = path.join(cwd, 'test.toml');
  require('./install').installToml('init', 'say """ safely', cwd, toml);
  assert.match(fs.readFileSync(toml, 'utf8'), /\\"\\"\\"/);
  const yaml = path.join(cwd, 'test.yaml');
  require('./install').installYaml('init', 'prompt', cwd, yaml);
  assert.match(fs.readFileSync(yaml, 'utf8'), /title: "init"/);
});

test('runtime resources default to skip and replace on approval', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  install('24\n3\n1\nn\n', cwd);
  const template = path.join(cwd, '.architecture-guard/templates/ponytail_core.md');
  fs.writeFileSync(template, 'custom');

  install('24\n3\n1\n\nn\n', cwd);
  assert.equal(fs.readFileSync(template, 'utf8'), 'custom');
  install('24\n3\n1\n2\n2\nn\n', cwd);
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
  runArgs(['--yes', '--agent', 'opencode', '--framework', 'openspec', '--commands', 'init-brownfield'], cwd);
  assert.ok(fs.existsSync(path.join(cwd, '.opencode/commands/init-brownfield.md')));
  assert.ok(!fs.existsSync(path.join(cwd, '.opencode/commands/init.md')));
  assert.ok(fs.existsSync(path.join(cwd, 'adapters/openspec.md')));
  assert.ok(!fs.existsSync(path.join(cwd, 'adapters/spec-kit.md')));
  assert.equal(fs.readFileSync(path.join(cwd, '.architecture-guard/selected-adapter'), 'utf8').trim(), 'openspec');
});

test('init accepts target directory positional argument', () => {
  const outer = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const inner = path.join(outer, 'target');
  fs.mkdirSync(inner, { recursive: true });
  // Run from outer, target = inner subdir
  runArgs(['--yes', '--agent', 'opencode', '--framework', 'none', '--commands', 'init', inner], outer);
  assert.ok(fs.existsSync(path.join(inner, '.opencode/commands/init.md')));
  assert.ok(!fs.existsSync(path.join(outer, '.opencode/commands/init.md')));
});

test('--help prints usage and exits without writing files', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  const result = spawnSync(process.execPath, [installer, '--help'], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /architecture-guard init \[target\]/i);
  assert.ok(!fs.existsSync(path.join(cwd, '.opencode')));
});
