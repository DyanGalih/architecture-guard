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

test('every command loads the shared capability composition contract', () => {
  const root = path.join(__dirname, '..');
  const contract = fs.readFileSync(path.join(root, 'templates', 'capability_composition.md'), 'utf8');
  assert.match(contract, /directly read the sibling skill file/);
  assert.match(contract, /Do not execute a Markdown or `SKILL\.md` path as a shell command/);
  assert.match(contract, /Prevent recursion/);

  for (const dirName of ['orchestration', 'commands']) {
    const dir = path.join(root, dirName);
    for (const file of fs.readdirSync(dir).filter(file => file.endsWith('.md'))) {
      const prompt = fs.readFileSync(path.join(dir, file), 'utf8');
      assert.match(prompt, /^## Capability Composition$/m, `${dirName}/${file} must load the composition contract`);
      assert.match(prompt, /capability[_-]composition/, `${dirName}/${file} must reference the composition contract`);
      assert.match(prompt, /installed sibling skill or command file directly/, `${dirName}/${file} must require direct prompt resolution`);
    }
  }
});

test('standalone orchestration resolves engine resources without SpecKit extension paths', () => {
  const root = path.join(__dirname, '..');
  const orchestrationDir = path.join(root, 'orchestration');

  for (const file of fs.readdirSync(orchestrationDir).filter(file => file.endsWith('.md'))) {
    const prompt = fs.readFileSync(path.join(orchestrationDir, file), 'utf8');
    assert.match(prompt, /^## Standalone Resource Resolution$/m, `${file} must define standalone resource loading`);
    assert.match(prompt, /architecture-guard resolve template ponytail_core/, `${file} must resolve the Ponytail contract through the CLI`);
    assert.match(prompt, /architecture-guard resolve template capability_composition/, `${file} must resolve capability composition through the CLI`);
    assert.doesNotMatch(prompt, /\.specify/, `${file} must not depend on a SpecKit extension path`);
    assert.doesNotMatch(prompt, /commands\//, `${file} must not route to a legacy source command file`);
  }
});

test('every referenced Architecture Guard skill and CLI operation is registered', () => {
  const root = path.join(__dirname, '..');
  const orchestrationDir = path.join(root, 'orchestration');
  const prompts = fs.readdirSync(orchestrationDir)
    .filter(file => file.endsWith('.md'))
    .map(file => fs.readFileSync(path.join(orchestrationDir, file), 'utf8'))
    .join('\n');

  const registeredSkills = new Set(require('./cli/install').COMMANDS.map(name => `ag-${name}`));
  const referencedSkills = new Set([...prompts.matchAll(/\bag-[a-z][a-z-]+\b/g)].map(match => match[0]));
  for (const skill of referencedSkills) {
    assert.ok(registeredSkills.has(skill), `Unregistered Architecture Guard skill reference: ${skill}`);
  }

  const cliSource = fs.readFileSync(path.join(root, 'bin', 'cli.ts'), 'utf8');
  const registeredCliOperations = new Set([...cliSource.matchAll(/\.command\('([a-z][a-z-]*)/g)].map(match => match[1]));
  const referencedCliOperations = new Set([...prompts.matchAll(/architecture-guard ([a-z][a-z-]*)/g)].map(match => match[1]));
  for (const operation of referencedCliOperations) {
    assert.ok(registeredCliOperations.has(operation), `Unregistered Architecture Guard CLI operation: ${operation}`);
  }
});

test('resolve --list exposes the complete effective hygiene rule collection', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-resolve-list-'));
  const localRules = path.join(cwd, '.architecture-guard', 'hygiene-rules');
  fs.mkdirSync(localRules, { recursive: true });
  fs.writeFileSync(path.join(localRules, 'project-only.md'), '# Project-only rule\n');

  const result = spawnSync(process.execPath, [installer, 'resolve', 'hygiene-rules', '--list', '--target', cwd], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^project-only\.md$/m);
  assert.match(result.stdout, /^duplicate-business-logic\.md$/m);
});

test('every orchestration and governed command adapter token resolves for every supported adapter', () => {
  const root = path.join(__dirname, '..');
  const adapterNames = ['generic', 'openspec', 'spec-kit'];
  const adapterMaps = Object.fromEntries(adapterNames.map(name => {
    const content = fs.readFileSync(path.join(root, 'adapters', `${name}.md`), 'utf8');
    const pathSection = content.split('## Path Map')[1].split('## Command Map')[0];
    const commandSection = content.split('## Command Map')[1].split('## Constitution Layout')[0];
    const parseMap = section => new Map([...section.matchAll(/^\|\s*([a-z0-9-]+)\s*\|\s*([^|]+)\s*\|/gm)].map(match => [match[1].trim(), match[2].trim()]));
    return [name, { path: parseMap(pathSection), command: parseMap(commandSection) }];
  }));

  // Collect all command directories (orchestration and legacy commands)
  const promptDirs = [path.join(root, 'orchestration')];
  if (fs.existsSync(path.join(root, 'commands'))) {
    promptDirs.push(path.join(root, 'commands'));
  }

  const allTokens = new Set();
  for (const dir of promptDirs) {
    for (const file of fs.readdirSync(dir).filter(file => file.endsWith('.md'))) {
      const prompt = fs.readFileSync(path.join(dir, file), 'utf8');
      const tokens = [...prompt.matchAll(/\{adapter_(path|command):([^}]+)\}/g)];
      for (const tokenMatch of tokens) {
        allTokens.add(tokenMatch[0]);
      }
      for (const adapter of adapterNames) {
        for (const [, kind, key] of tokens) {
          const map = adapterMaps[adapter][kind];
          assert.ok(map.has(key), `${file}: ${adapter} missing ${kind}:${key}`);
          const value = map.get(key);
          assert.ok(value && value.length > 0, `${file}: ${adapter} has empty mapping for ${kind}:${key}`);
        }
      }
    }
  }

  // Contract requirement: ensure canonical verify and archive mappings in OpenSpec
  const openspecCommands = adapterMaps['openspec'].command;
  assert.ok(openspecCommands.has('verify'), 'OpenSpec adapter must define verify');
  assert.match(openspecCommands.get('verify'), /openspec validate.*--strict/);
  assert.ok(openspecCommands.has('archive'), 'OpenSpec adapter must define archive');
  assert.match(openspecCommands.get('archive'), /openspec archive.*--yes/);
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
  assert.ok(fs.existsSync(path.join(cwd, '.architecture-guard/config.yml')));
  assert.match(fs.readFileSync(path.join(cwd, '.architecture-guard/config.yml'), 'utf8'), /adapter:\s*spec-kit/);
  // Immutable directories should not exist in default lean mode
  for (const dir of ['templates', 'presets', 'sonar-rules']) {
    assert.ok(!fs.existsSync(path.join(cwd, '.architecture-guard', dir)));
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

test('--vendor copies full runtime resources for air-gapped environments', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-vendor-'));
  spawnSync(process.execPath, [installer, 'init', '--vendor', '--yes', '--agent', 'opencode', '--framework', 'spec-kit'], { cwd, encoding: 'utf8' });
  for (const dir of ['templates', 'presets', 'hygiene-rules', 'sonar-rules']) {
    assert.ok(fs.existsSync(path.join(cwd, '.architecture-guard', dir)));
  }
});

test('default init purges legacy unmodifiable engine directories', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-legacy-'));
  const legacyDir = path.join(cwd, '.architecture-guard/templates');
  fs.mkdirSync(legacyDir, { recursive: true });
  fs.writeFileSync(path.join(legacyDir, 'legacy.md'), 'legacy');

  spawnSync(process.execPath, [installer, 'init', '--yes', '--agent', 'opencode', '--framework', 'spec-kit'], { cwd, encoding: 'utf8' });
  assert.ok(!fs.existsSync(legacyDir), 'legacy templates dir should be purged');
  assert.ok(fs.existsSync(path.join(cwd, '.architecture-guard/config.yml')));
});

test('vendor mode runtime resources auto-replace by default and can be skipped with --overwrite skip', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  spawnSync(process.execPath, [installer, 'init', '--vendor', '--yes', '--agent', 'opencode', '--framework', 'spec-kit'], { cwd, encoding: 'utf8' });
  const template = path.join(cwd, '.architecture-guard/templates/ponytail_core.md');
  fs.writeFileSync(template, 'custom');

  // With --overwrite skip, custom template is preserved
  spawnSync(process.execPath, [installer, 'init', '--vendor', '--overwrite', 'skip', '--yes', '--agent', 'opencode', '--framework', 'spec-kit'], { cwd, encoding: 'utf8' });
  assert.equal(fs.readFileSync(template, 'utf8'), 'custom');

  // Default vendor replaces custom template with latest
  spawnSync(process.execPath, [installer, 'init', '--vendor', '--yes', '--agent', 'opencode', '--framework', 'spec-kit'], { cwd, encoding: 'utf8' });
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


test('materializes the selected adapter in the installed verification skill', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-verify-install-'));
  runArgs(['init', '--yes', '--agent', 'codex', '--framework', 'openspec', '--commands', 'verify'], cwd);

  const skillPath = path.join(cwd, '.codex/skills/ag-verify/SKILL.md');
  const skill = fs.readFileSync(skillPath, 'utf8');
  assert.doesNotMatch(skill, /\{adapter_(path|command):/);
  assert.match(skill, /openspec\/changes\/<change>\/tasks\.md/);
  assert.match(skill, /architecture-guard hygiene --json --target \./);
  assert.match(skill, /## Context Expansion/);

  fs.writeFileSync(path.join(cwd, 'adapters/resolve.md'), 'stale');
  runArgs(['init', '--yes', '--agent', 'codex', '--framework', 'openspec', '--commands', 'verify'], cwd);
  assert.notEqual(fs.readFileSync(path.join(cwd, 'adapters/resolve.md'), 'utf8'), 'stale');
});

test('governed delivery installs the adapter-driven orchestration command', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  runArgs(['init', '--yes', '--agent', 'opencode', '--framework', 'spec-kit', '--commands', 'governed-delivery'], cwd);

  const command = fs.readFileSync(path.join(cwd, '.opencode/commands/ag-governed-delivery.md'), 'utf8');
   assert.match(command, /adapters\/resolve\.md/);
   assert.doesNotMatch(command, /adapters\/detect\.md/);
  assert.doesNotMatch(command, /\{adapter_(path|command):/);
  assert.match(command, /Enumerate files matching/);
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
  assert.equal(require('./cli/self-update').compareSemver('2.5.0', '2.2.2'), 1);
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

test('installs Claude Code Agent Teams templates in vendor mode and resolves dynamically', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-'));
  spawnSync(process.execPath, [installer, 'init', '--vendor', '--yes', '--agent', 'claude', '--framework', 'openspec'], { cwd, encoding: 'utf8' });

  const templateFile = path.join(cwd, '.architecture-guard', 'templates', 'agents_template.yml');
  assert.ok(fs.existsSync(templateFile), 'Missing agents_template.yml in vendor mode');
  const templateContent = fs.readFileSync(templateFile, 'utf8');
  assert.match(templateContent, /topology: claude-code-agent-teams/);
  assert.match(templateContent, /analyst_creator/);
  assert.match(templateContent, /analyst_reviewer/);
  assert.match(templateContent, /implementor_be/);
  assert.match(templateContent, /implementor_fe/);
  assert.match(templateContent, /implementor_test/);
  assert.match(templateContent, /code_reviewer/);

  const commsFile = path.join(cwd, '.architecture-guard', 'templates', 'agent_communication.md');
  assert.ok(fs.existsSync(commsFile), 'Missing agent_communication.md in vendor mode');

  // Verify dynamic resolution from lean workspace without vendor files
  const leanCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-lean-'));
  spawnSync(process.execPath, [installer, 'init', '--yes', '--agent', 'claude', '--framework', 'openspec'], { cwd: leanCwd, encoding: 'utf8' });
  const resolved = require('./cli/resolve').resolveResource('template', 'agents_template', { target: leanCwd });
  assert.strictEqual(resolved.source, 'bundled');
  assert.match(resolved.content, /topology: claude-code-agent-teams/);
});


test("resolve rejects adapter category with actionable guidance", () => {
  const result = spawnSync(process.execPath, [installer, "resolve", "adapter", "--list"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Adapter selection is file-based/);
  assert.match(result.stderr, /selected-adapter/);
});

test("installed OpenSpec governed delivery is explicit and change-scoped", () => {
  const root = path.join(__dirname, "..");
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-openspec-delivery-"));
  runArgs(["init", "--yes", "--agent", "codex", "--framework", "openspec", "--commands", "governed-delivery"], cwd);

  const command = fs.readFileSync(path.join(cwd, ".codex/skills/ag-governed-delivery/SKILL.md"), "utf8");
  assert.ok(command.includes(".architecture-guard/selected-adapter"));
  assert.ok(command.includes("adapter files are not a `resolve` resource category"));
  assert.ok(command.includes("CHANGE_ID"));
  assert.match(command, /openspec instructions .*--change .*CHANGE_ID/);
  assert.match(command, /openspec validate .*CHANGE_ID.*--strict/);
  assert.equal(command.includes("architecture-guard resolve adapter"), false);
  assert.equal(command.includes("{adapter_"), false);

  const template = fs.readFileSync(path.join(root, "templates", "openspec_spec.md"), "utf8");
  assert.ok(template.includes("## ADDED Requirements"));
  assert.ok(template.includes("## MODIFIED Requirements"));
  assert.ok(template.includes("## REMOVED Requirements"));
  assert.equal(template.split("\n").includes("## Requirements"), false);
});

test("review-artifacts reports Unavailable instead of pretending to dispatch", () => {
  const result = spawnSync(process.execPath, [installer, "review-artifacts"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Status.*Unavailable/);
  assert.doesNotMatch(result.stdout, /Delegating/);
});

test("materializes adapter actions without command-prose interpolation", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-action-install-"));
  runArgs(["init", "--yes", "--agent", "opencode", "--framework", "openspec", "--commands", "governed-implement"], cwd);

  const prompt = fs.readFileSync(path.join(cwd, ".opencode/commands/ag-governed-implement.md"), "utf8");
  assert.match(prompt, /## Resolved Adapter Actions/);
  assert.match(prompt, /apply the adapter-defined "subagent-synthesize" action with implementation context/);
  assert.match(prompt, /openspec validate.*CHANGE_ID.*--strict/);
  assert.doesNotMatch(prompt, /the the adapter-defined/);
  assert.doesNotMatch(prompt, /Run (Use|Run) the registered/);
  assert.doesNotMatch(prompt, /Unsupported natively.*--context=implementation/);
});

test("supports command aliases and rejects invalid selections", () => {
  const allCwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-all-"));
  runArgs(["init", "--yes", "--agent", "opencode", "--framework", "openspec", "--commands", "all"], allCwd);
  const installed = fs.readdirSync(path.join(allCwd, ".opencode/commands")).filter(name => /^ag-.*\.md$/.test(name));
  assert.equal(installed.length, require("./cli/install").COMMANDS.length);

  const reviewCwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-review-"));
  runArgs(["init", "--yes", "--agent", "opencode", "--framework", "openspec", "--commands", "review"], reviewCwd);
  assert.ok(fs.existsSync(path.join(reviewCwd, ".opencode/commands/ag-review-artifacts.md")));
  assert.ok(fs.existsSync(path.join(reviewCwd, ".opencode/commands/ag-review-implementation.md")));
  assert.equal(fs.existsSync(path.join(reviewCwd, ".opencode/commands/ag-init.md")), false);

  const invalid = spawnSync(process.execPath, [installer, "init", "--yes", "--agent", "opencode", "--framework", "openspec", "--commands", "no-such-command"], {
    cwd: fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-invalid-command-")),
    encoding: "utf8",
  });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /Unknown command selection: no-such-command/);
});

test("requires explicit agent and framework values in --yes mode", () => {
  const noAgent = spawnSync(process.execPath, [installer, "init", "--yes"], {
    cwd: fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-no-agent-")),
    encoding: "utf8",
  });
  assert.notEqual(noAgent.status, 0);
  assert.match(noAgent.stderr, /requires --agent/);

  const noFramework = spawnSync(process.execPath, [installer, "init", "--yes", "--agent", "opencode"], {
    cwd: fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-no-framework-")),
    encoding: "utf8",
  });
  assert.notEqual(noFramework.status, 0);
  assert.match(noFramework.stderr, /requires --framework/);
});

test("updates the managed AGENTS section when the selected agent changes", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-agents-update-"));
  runArgs(["init", "--yes", "--agent", "opencode", "--framework", "openspec", "--commands", "init"], cwd);
  runArgs(["init", "--yes", "--agent", "antigravity", "--framework", "openspec", "--commands", "init"], cwd);

  const agents = fs.readFileSync(path.join(cwd, "AGENTS.md"), "utf8");
  assert.match(agents, /\.agent\/skills/);
  assert.doesNotMatch(agents, /\.opencode\/commands/);
  assert.equal((agents.match(/architecture-guard:start/g) || []).length, 1);
  assert.equal((agents.match(/architecture-guard:end/g) || []).length, 1);
});


test("--vendor with overwrite skip still populates missing runtime resources", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-vendor-skip-"));
  const result = spawnSync(process.execPath, [installer, "init", "--vendor", "--overwrite", "skip", "--yes", "--agent", "opencode", "--framework", "spec-kit"], { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  for (const dir of ["templates", "presets", "hygiene-rules", "sonar-rules"]) {
    assert.ok(fs.existsSync(path.join(cwd, ".architecture-guard", dir)), "missing vendored " + dir);
  }
});

test("CLI init treats an OpenSpec directory as a detection marker", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-openspec-directory-"));
  fs.mkdirSync(path.join(cwd, "openspec"), { recursive: true });
  install("1\n", cwd);
  assert.equal(fs.readFileSync(path.join(cwd, ".architecture-guard/selected-adapter"), "utf8").trim(), "openspec");
});

test("legacy Spec Kit init remains self-contained", () => {
  const prompt = fs.readFileSync(path.join(__dirname, "..", "commands", "init.md"), "utf8");
  assert.match(prompt, /\.specify\/extensions\/architecture-guard\/templates\/agents_template\.yml/);
  assert.doesNotMatch(prompt, /architecture-guard resolve template agents_template/);
});


test("rejects a non-replacing adapter switch before changing persisted selection", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "architecture-guard-adapter-switch-"));
  runArgs(["init", "--yes", "--agent", "opencode", "--framework", "spec-kit", "--commands", "init"], cwd);

  const result = spawnSync(process.execPath, [installer, "init", "--overwrite", "skip", "--yes", "--agent", "opencode", "--framework", "openspec", "--commands", "init"], { cwd, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Cannot switch adapter from spec-kit to openspec/);
  assert.equal(fs.readFileSync(path.join(cwd, ".architecture-guard/selected-adapter"), "utf8").trim(), "spec-kit");
});
