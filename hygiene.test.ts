import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { scanHygiene } from './cli/hygiene';

function temporaryProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'architecture-guard-hygiene-'));
}

test('runs selected built-in hygiene checks and applies blocking policy', () => {
  const target = temporaryProject();
  try {
    fs.mkdirSync(path.join(target, '.architecture-guard'), { recursive: true });
    fs.writeFileSync(
      path.join(target, '.architecture-guard', 'config.yml'),
      [
        'repository_hygiene:',
        '  enabled: true',
        '  fail_on:',
        '    - critical',
        '    - debug-artifacts',
      ].join('\n') + '\n'
    );
    fs.writeFileSync(path.join(target, 'debug.ts'), "console.log('leftover debug output');\n");
    fs.writeFileSync(path.join(target, 'scratch.tmp'), 'temporary\n');

    const report = scanHygiene({
      target,
      rules: 'debug-artifacts,temporary-files',
    });

    assert.equal(report.status, 'failed');
    assert.equal(report.counts.loadedRules, 2);
    assert.equal(report.counts.executedRules, 2);
    assert.ok(report.findings.some(finding => finding.rule === 'debug-artifacts'));
    assert.ok(report.findings.some(finding => finding.rule === 'temporary-files'));
    assert.ok(report.findings.some(finding => finding.blocking && finding.severity === 'CRITICAL'));
    assert.equal(report.rules.find(rule => rule.identifier === 'debug-artifacts').severity, 'CRITICAL');
    assert.equal(report.rules.find(rule => rule.identifier === 'debug-artifacts').blocking, true);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('debug artifacts are a non-blocking warning unless the project fails on them', () => {
  const target = temporaryProject();
  try {
    fs.writeFileSync(path.join(target, 'debug.ts'), "console.log('entry boundary output');\n");
    const report = scanHygiene({ target, rules: 'debug-artifacts' });
    const rule = report.rules.find(entry => entry.identifier === 'debug-artifacts');
    assert.equal(rule.severity, 'WARNING');
    assert.equal(rule.blocking, false);
    assert.equal(report.counts.blocking, 0);
    assert.ok(report.findings.some(finding => finding.rule === 'debug-artifacts' && finding.severity === 'WARNING'));
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('applies configured path exclusions before running built-in checks', () => {
  const target = temporaryProject();
  try {
    fs.mkdirSync(path.join(target, '.architecture-guard'), { recursive: true });
    fs.mkdirSync(path.join(target, 'scratch'), { recursive: true });
    fs.writeFileSync(
      path.join(target, '.architecture-guard', 'config.yml'),
      [
        'repository_hygiene:',
        '  ignore:',
        '    paths:',
        '      - scratch/**',
      ].join('\n') + '\n'
    );
    fs.writeFileSync(path.join(target, 'scratch', 'debug.ts'), "console.log('ignored');\n");

    const report = scanHygiene({
      target,
      rules: 'debug-artifacts',
    });

    assert.equal(report.status, 'passed');
    assert.equal(report.counts.findings, 0);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('reports custom Markdown rules as manual degraded coverage', () => {
  const target = temporaryProject();
  try {
    const rulesDir = path.join(target, '.architecture-guard', 'hygiene-rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    fs.writeFileSync(
      path.join(rulesDir, 'project-rule.md'),
      [
        '# Rule: Project Rule',
        '',
        '**Identifier**: project-rule',
        '**Default Severity**: Warning',
        '**Recommendation**: Review the project-specific finding.',
        '',
        '## Detection Logic',
        '',
        'A human reviewer evaluates this rule.',
      ].join('\n') + '\n'
    );

    const report = scanHygiene({
      target,
      rules: 'project-rule',
    });

    assert.equal(report.status, 'degraded');
    assert.deepEqual(report.manualRules, ['project-rule']);
    assert.equal(report.counts.executedRules, 0);
    assert.equal(report.rules[0].source, 'local');
    assert.equal(report.rules[0].execution, 'manual');
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});


test('uses repository_hygiene policy embedded in a constitution when no standalone config exists', () => {
  const target = temporaryProject();
  try {
    const constitutionDir = path.join(target, '.specify', 'memory');
    fs.mkdirSync(constitutionDir, { recursive: true });
    fs.writeFileSync(
      path.join(constitutionDir, 'architecture_constitution.md'),
      [
        '# Architecture Constitution',
        '',
        'repository_hygiene:',
        '  fail_on:',
        '    - debug-artifacts',
      ].join('\n') + '\n'
    );
    fs.writeFileSync(path.join(target, 'debug.ts'), "console.log('constitution policy');\n");

    const report = scanHygiene({ target, rules: 'debug-artifacts' });

    assert.equal(report.status, 'failed');
    assert.equal(report.counts.blocking, 1);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('walks a non-repository target with POSIX relative paths so nested detectors match', () => {
  const target = temporaryProject();
  try {
    fs.mkdirSync(path.join(target, 'src', 'tmp'), { recursive: true });
    fs.writeFileSync(path.join(target, 'src', 'tmp', 'notes.md'), 'scratch\n');

    const report = scanHygiene({ target, rules: 'temporary-files' });

    assert.deepEqual(report.findings.map(finding => finding.relativePath), ['src/tmp/notes.md']);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('--files limits findings to the listed files and records the scope', () => {
  const target = temporaryProject();
  try {
    fs.mkdirSync(path.join(target, 'src'), { recursive: true });
    fs.writeFileSync(path.join(target, 'src', 'changed.ts'), "console.log('new debug output');\n");
    fs.writeFileSync(path.join(target, 'legacy.ts'), "console.log('pre-existing debug output');\n");

    const scoped = scanHygiene({ target, rules: 'debug-artifacts', files: 'src/changed.ts, ./src/removed.ts' });
    assert.deepEqual(scoped.findings.map(finding => finding.relativePath), ['src/changed.ts']);
    assert.equal(scoped.scope.mode, 'files');
    assert.deepEqual(scoped.scope.files, ['src/changed.ts', 'src/removed.ts']);
    assert.deepEqual(scoped.scope.unmatched, ['src/removed.ts']);

    const outside = scanHygiene({ target, rules: 'debug-artifacts', files: 'src/clean.ts' });
    assert.equal(outside.counts.findings, 0, 'a finding outside the scope is not reported');

    const whole = scanHygiene({ target, rules: 'debug-artifacts' });
    assert.equal(whole.scope.mode, 'repository');
    assert.equal(whole.counts.findings, 2);

    assert.throws(() => scanHygiene({ target, files: '../elsewhere.ts' }), /outside the target directory/);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('--files still compares a changed file with unchanged files for duplicate rules', () => {
  const target = temporaryProject();
  try {
    const logic = 'export function price(total: number) {\n'
      + '  return total > 100 ? total * 0.9 : total; // shared discount rule for orders\n'.repeat(3)
      + '}\n';
    fs.writeFileSync(path.join(target, 'existing.ts'), logic);
    fs.writeFileSync(path.join(target, 'copied.ts'), logic);

    const report = scanHygiene({ target, rules: 'duplicate-business-logic', files: 'copied.ts' });
    assert.deepEqual(report.findings.map(finding => finding.relativePath), ['copied.ts']);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('unresolved-governance-citations flags cited constitutions reviewers cannot open', () => {
  const target = temporaryProject();
  try {
    execFileSync('git', ['init', '-q', target]);
    fs.mkdirSync(path.join(target, 'docs'), { recursive: true });
    fs.mkdirSync(path.join(target, 'specs'), { recursive: true });
    fs.mkdirSync(path.join(target, 'config'), { recursive: true });
    fs.writeFileSync(path.join(target, '.gitignore'), 'docs/private_constitution.md\n');
    fs.writeFileSync(path.join(target, 'docs', 'security_constitution.md'), '# Security\n');
    fs.writeFileSync(path.join(target, 'docs', 'private_constitution.md'), '# Private\n');
    fs.writeFileSync(path.join(target, 'specs', 'feature.md'), [
      'Aligns to [security](../docs/security_constitution.md#7-audit) and the governance in `constitution.md`.',
      'Also [the old link](../../docs/security_constitution.md).',
      'And [private rules](../docs/private_constitution.md) and [gone](../docs/missing_constitution.md).',
      'External [example](https://example.com/constitution.md).',
    ].join('\n'));
    fs.writeFileSync(path.join(target, 'config', 'audit.php'), "<?php // Credentials never reach audits (docs/security_constitution.md §7).\n");

    const report = scanHygiene({ target, rules: 'unresolved-governance-citations' });
    const found = report.findings.map(finding => `${finding.relativePath}:${finding.line} ${finding.message}`);
    assert.equal(found.length, 3, found.join('\n'));
    assert.match(found.join('\n'), /specs\/feature\.md:2 .*outside the repository/);
    assert.match(found.join('\n'), /specs\/feature\.md:3 .*gitignored or excluded/);
    assert.match(found.join('\n'), /specs\/feature\.md:3 .*does not exist/);
    assert.ok(report.findings.every(finding => finding.severity === 'WARNING' && !finding.blocking));
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test('unresolved-governance-citations accepts a citation into a nested repository that tracks the file', () => {
  const target = temporaryProject();
  try {
    execFileSync('git', ['init', '-q', target]);
    fs.writeFileSync(path.join(target, '.gitignore'), 'src/\n');
    fs.mkdirSync(path.join(target, 'src', 'docs'), { recursive: true });
    execFileSync('git', ['init', '-q', path.join(target, 'src')]);
    fs.writeFileSync(path.join(target, 'src', 'docs', 'constitution.md'), '# Governance\n');
    fs.writeFileSync(path.join(target, 'README.md'), 'Rules: [governance](src/docs/constitution.md) and [gone](src/docs/missing_constitution.md).\n');

    const report = scanHygiene({ target, rules: 'unresolved-governance-citations' });
    assert.deepEqual(report.findings.map(finding => finding.message), ['Cited governance document src/docs/missing_constitution.md does not exist.']);
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});
