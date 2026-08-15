import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runArchive } from './cli/archive.js';

test('archive command completely removes source directory including empty nested dirs', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-archive-test-'));
    
    // Mock process.cwd() for the test
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;
    
    try {
        const changesDir = path.join(tmpdir, 'openspec', 'changes');
        const changeName = 'test-change';
        const sourceDir = path.join(changesDir, changeName);
        
        // Create source dir and nested empty dirs
        fs.mkdirSync(path.join(sourceDir, 'specs', 'capability'), { recursive: true });
        fs.writeFileSync(path.join(sourceDir, 'specs', 'capability', 'spec.md'), '# Spec');
        
        // Create an unrelated file
        const unrelatedDir = path.join(changesDir, 'other-change');
        fs.mkdirSync(unrelatedDir, { recursive: true });
        
        // Run archive
        await runArchive(changeName);
        
        // Verify target exists
        const date = new Date().toISOString().split('T')[0];
        const targetDir = path.join(changesDir, 'archive', `${date}-${changeName}`);
        
        assert.ok(fs.existsSync(targetDir), 'Target archive directory should exist');
        assert.ok(fs.existsSync(path.join(targetDir, 'specs', 'capability', 'spec.md')), 'Archived files should exist');
        
        // Verify source does NOT exist
        assert.strictEqual(fs.existsSync(sourceDir), false, 'Source directory should be completely removed');
        
        // Verify unrelated dir still exists
        assert.ok(fs.existsSync(unrelatedDir), 'Unrelated directories should not be deleted');
    } finally {
        // Restore cwd and cleanup
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
});

test('SpecKit archive retains the feature and updates system_context idempotently', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-speckit-archive-test-'));
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;

    try {
        const featureRoot = path.join(tmpdir, 'specs', '001-feature');
        fs.mkdirSync(featureRoot, { recursive: true });
        fs.mkdirSync(path.join(tmpdir, '.specify'), { recursive: true });
        fs.writeFileSync(path.join(tmpdir, '.specify', 'feature.json'), JSON.stringify({ feature_directory: 'specs/001-feature' }));
        fs.writeFileSync(path.join(featureRoot, 'spec.md'), '# Feature\n\n## Purpose\nAdds the feature.\n');

        await runArchive('ignored-name');
        await runArchive('ignored-name');

        const index = fs.readFileSync(path.join(tmpdir, 'specs', 'system_context.md'), 'utf8');
        assert.ok(fs.existsSync(path.join(featureRoot, 'spec.md')));
        assert.strictEqual((index.match(/architecture-guard:feature=/g) ?? []).length, 1);
        assert.match(index, /Feature spec: \[specs\/001-feature\/spec\.md\]/);
    } finally {
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
});

test('SpecKit archive warns without removing the feature when the context index cannot be written', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-speckit-archive-warning-test-'));
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;

    try {
        const featureRoot = path.join(tmpdir, 'specs', '001-feature');
        fs.mkdirSync(featureRoot, { recursive: true });
        fs.mkdirSync(path.join(tmpdir, '.specify'), { recursive: true });
        fs.mkdirSync(path.join(tmpdir, 'specs', 'system_context.md'), { recursive: true });
        fs.writeFileSync(path.join(featureRoot, 'spec.md'), '# Feature\n');

        await runArchive('001-feature');

        assert.ok(fs.existsSync(path.join(featureRoot, 'spec.md')));
    } finally {
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
});

test('SpecKit archive rejects traversal metadata and ambiguous framework markers', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-archive-validation-test-'));
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;

    try {
        fs.mkdirSync(path.join(tmpdir, '.specify'), { recursive: true });
        fs.writeFileSync(path.join(tmpdir, '.specify', 'feature.json'), JSON.stringify({ feature_directory: '../outside' }));
        await assert.rejects(() => runArchive('feature'), /must resolve under the project root/);

        fs.mkdirSync(path.join(tmpdir, 'openspec'), { recursive: true });
        fs.writeFileSync(path.join(tmpdir, 'openspec', 'config.yaml'), 'schema: spec-driven');
        await assert.rejects(() => runArchive('feature'), /both SpecKit and OpenSpec markers/);

        fs.mkdirSync(path.join(tmpdir, 'openspec', 'changes', 'explicit'), { recursive: true });
        await runArchive('explicit', { framework: 'openspec' });
    } finally {
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
});

test('archive command supports JSON success output', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-archive-json-test-'));
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;

    try {
        const sourceDir = path.join(tmpdir, 'openspec', 'changes', 'json-change');
        fs.mkdirSync(sourceDir, { recursive: true });
        const result = await runArchive('json-change', { json: true });
        assert.deepStrictEqual(result, {
            status: 'success',
            framework: 'openspec',
            changeName: 'json-change',
            targetDir: path.join(tmpdir, 'openspec', 'changes', 'archive', `${new Date().toISOString().split('T')[0]}-json-change`)
        });
    } finally {
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
});
