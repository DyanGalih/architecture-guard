import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { resolveResource, listCategoryResources } from './cli/resolve';

test('resolves bundled template ponytail_core', () => {
  const result = resolveResource('template', 'ponytail_core');
  assert.strictEqual(result.source, 'bundled');
  assert.strictEqual(result.category, 'templates');
  assert(result.content.includes('# Ponytail Core Contract'));
  assert(fs.existsSync(result.path));
});

test('resolves bundled preset backend/laravel/django/etc', () => {
  const result = resolveResource('preset', 'laravel');
  assert.strictEqual(result.source, 'bundled');
  assert.strictEqual(result.category, 'presets');
  assert(result.content.length > 0);
});

test('resolves bundled sonar rules by default without name', () => {
  const result = resolveResource('sonar-rules');
  assert.strictEqual(result.source, 'bundled');
  assert.strictEqual(result.category, 'sonar-rules');
  assert(result.name.includes('sonarlint-rules.json'));
});

test('prioritizes local workspace override when present', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-resolve-test-'));
  try {
    const localTemplatesDir = path.join(tmpDir, '.architecture-guard', 'templates');
    fs.mkdirSync(localTemplatesDir, { recursive: true });
    const customContent = '# Custom Ponytail Override\nCustom contract content';
    fs.writeFileSync(path.join(localTemplatesDir, 'ponytail_core.md'), customContent);

    const result = resolveResource('template', 'ponytail_core', { target: tmpDir });
    assert.strictEqual(result.source, 'local');
    assert.strictEqual(result.content, customContent);
    assert.strictEqual(result.path, path.join(localTemplatesDir, 'ponytail_core.md'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('resolves manifest config.yml from local workspace', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-resolve-manifest-test-'));
  try {
    const agDir = path.join(tmpDir, '.architecture-guard');
    fs.mkdirSync(agDir, { recursive: true });
    const configContent = 'adapter: openspec\npresets:\n  - backend\n';
    fs.writeFileSync(path.join(agDir, 'config.yml'), configContent);

    const result = resolveResource('manifest', undefined, { target: tmpDir });
    assert.strictEqual(result.source, 'local');
    assert.strictEqual(result.name, 'config.yml');
    assert.strictEqual(result.content, configContent);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('rejects path traversal attempts (CWE-22)', () => {
  assert.throws(() => {
    resolveResource('template', '../../etc/passwd');
  }, /path traversal detected/);

  assert.throws(() => {
    resolveResource('preset', '../something');
  }, /path traversal detected/);
});

test('lists available resources in category', () => {
  const presets = listCategoryResources('preset');
  assert(presets.length > 0);
  assert(presets.includes('laravel.md') || presets.includes('django.md'));
});
