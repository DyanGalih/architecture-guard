import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
        '    - critical',
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