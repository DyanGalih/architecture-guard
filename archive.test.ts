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
        assert.match(index, /Feature spec: \[001-feature\/spec\.md\]\(001-feature\/spec\.md\)/);
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

        const result = await runArchive('001-feature');

        assert.ok(fs.existsSync(path.join(featureRoot, 'spec.md')));
        assert.strictEqual(result.status, 'failed');
        assert.strictEqual(process.exitCode, 1);
    } finally {
        process.exitCode = undefined;
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

test('generic archive moves changes/{change} to changes/archive/{date}-{change}', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-archive-generic-test-'));
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;

    try {
        const changeName = 'generic-feature';
        const sourceDir = path.join(tmpdir, 'changes', changeName);
        fs.mkdirSync(sourceDir, { recursive: true });
        fs.writeFileSync(path.join(sourceDir, 'spec.md'), '# Generic Spec\n');

        const result = await runArchive(changeName, { framework: 'generic' });
        const date = new Date().toISOString().split('T')[0];
        const targetDir = path.join(tmpdir, 'changes', 'archive', `${date}-${changeName}`);

        assert.strictEqual(result.status, 'success');
        assert.strictEqual(result.framework, 'generic');
        assert.ok(fs.existsSync(targetDir), 'Archive target should exist');
        assert.ok(fs.existsSync(path.join(targetDir, 'spec.md')));
        assert.strictEqual(fs.existsSync(sourceDir), false, 'Source change dir should be removed');
    } finally {
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
});

test('generic archive rejects nonexistent change directory', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-archive-generic-err-'));
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;

    try {
        await assert.rejects(
            () => runArchive('missing-change', { framework: 'generic' }),
            /source change directory not found/
        );
    } finally {
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
});


test('archive follows the installer-selected adapter and accepts the spec-kit spelling', async () => {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-archive-adapter-test-'));
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;

    try {
        fs.mkdirSync(path.join(tmpdir, '.architecture-guard'), { recursive: true });
        fs.writeFileSync(path.join(tmpdir, '.architecture-guard', 'selected-adapter'), 'my-sdd\n');
        await assert.rejects(() => runArchive('feature'), /must archive through its own archive command/);

        fs.mkdirSync(path.join(tmpdir, '.specify'), { recursive: true });
        fs.writeFileSync(path.join(tmpdir, '.specify', 'feature.json'), JSON.stringify({ feature_directory: '../outside' }));
        await assert.rejects(() => runArchive('feature', { framework: 'spec-kit' }), /must resolve under the project root/);
    } finally {
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
});

async function inProject(prefix: string, body: (tmpdir: string) => Promise<void>) {
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;
    try {
        await body(tmpdir);
    } finally {
        process.exitCode = undefined;
        process.cwd = originalCwd;
        fs.rmSync(tmpdir, { recursive: true, force: true });
    }
}

async function captureStdout(run: () => Promise<unknown>) {
    const originalWrite = process.stdout.write;
    let output = '';
    // Only capture the command's string output; the test reporter shares this stream.
    process.stdout.write = ((chunk: string | Uint8Array, ...rest: unknown[]) => {
        if (typeof chunk === 'string') {
            output += chunk;
            return true;
        }
        return (originalWrite as (...args: unknown[]) => boolean).call(process.stdout, chunk, ...rest);
    }) as typeof process.stdout.write;
    try {
        const result = await run();
        return { result, output };
    } finally {
        process.stdout.write = originalWrite;
    }
}

test('archive rejects change names that escape the changes directory', async () => {
    await inProject('ag-archive-traversal-', async (tmpdir) => {
        fs.mkdirSync(path.join(tmpdir, 'src'), { recursive: true });
        fs.writeFileSync(path.join(tmpdir, 'src', 'index.ts'), 'export {};\n');
        fs.mkdirSync(path.join(tmpdir, 'openspec', 'changes', 'real'), { recursive: true });
        for (const framework of ['openspec', 'generic']) {
            for (const name of ['../../src', '..', '.', 'a/b', 'a\\b', path.join(tmpdir, 'src'), '', '  ']) {
                await assert.rejects(() => runArchive(name, { framework }), /invalid change name|change name is required|must resolve inside/, `${framework}: ${name}`);
            }
        }
        assert.ok(fs.existsSync(path.join(tmpdir, 'src', 'index.ts')), 'project files are never moved');
        assert.ok(fs.existsSync(path.join(tmpdir, 'openspec', 'changes', 'real')));
    });
});

test('SpecKit re-finalize keeps hand-written text, the full purpose, and an index-relative link', async () => {
    await inProject('ag-speckit-refinalize-', async (tmpdir) => {
        const featureRoot = path.join(tmpdir, 'specs', 'feat');
        fs.mkdirSync(featureRoot, { recursive: true });
        fs.mkdirSync(path.join(tmpdir, '.specify'), { recursive: true });
        fs.writeFileSync(path.join(tmpdir, '.specify', 'feature.json'), JSON.stringify({ feature_directory: 'specs/feat' }));
        fs.writeFileSync(path.join(featureRoot, 'spec.md'), '# Feat\n\n## Purpose\nFirst line of purpose\nsecond line of purpose.\n\nA second paragraph.\n\n## Scope\nOut of purpose.\n');
        await runArchive('feat');

        const indexPath = path.join(tmpdir, 'specs', 'system_context.md');
        fs.appendFileSync(indexPath, '\n## Notes\nHand-written note.\n');
        await runArchive('feat');
        await runArchive('feat');

        const index = fs.readFileSync(indexPath, 'utf8');
        assert.match(index, /First line of purpose\nsecond line of purpose\.\n\nA second paragraph\./);
        assert.doesNotMatch(index, /Out of purpose/);
        assert.match(index, /- Feature spec: \[feat\/spec\.md\]\(feat\/spec\.md\)\n\n## Notes\nHand-written note\.\n$/);
        assert.strictEqual((index.match(/architecture-guard:feature=/g) ?? []).length, 1);
        assert.strictEqual(process.exitCode, undefined);
    });
});

test('SpecKit finalize reports a missing spec and an unwritable index explicitly', async () => {
    await inProject('ag-speckit-explicit-', async (tmpdir) => {
        fs.mkdirSync(path.join(tmpdir, '.specify'), { recursive: true });
        fs.mkdirSync(path.join(tmpdir, 'specs', 'feat'), { recursive: true });
        const skipped = await captureStdout(() => runArchive('feat', { json: true }));
        assert.strictEqual(process.exitCode, 1);
        const skippedJson = JSON.parse(skipped.output);
        assert.strictEqual(skippedJson.status, 'skipped');
        assert.match(skippedJson.reason, /feature spec not found/);
        assert.deepStrictEqual(skipped.result, skippedJson);

        process.exitCode = undefined;
        fs.writeFileSync(path.join(tmpdir, 'specs', 'feat', 'spec.md'), '# Feat\n');
        fs.mkdirSync(path.join(tmpdir, 'specs', 'system_context.md'));
        const failed = await captureStdout(() => runArchive('feat', { json: true }));
        assert.strictEqual(process.exitCode, 1);
        const failedJson = JSON.parse(failed.output);
        assert.strictEqual(failedJson.status, 'failed');
        assert.match(failedJson.reason, /unable to update SpecKit context index/);
    });
});

test('archive CLI prints errors once without a stack trace and lists valid frameworks', async () => {
    const { spawnSync } = await import('node:child_process');
    const cli = path.join(__dirname, 'bin', 'cli.js');
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-archive-cli-'));
    try {
        const bogus = spawnSync(process.execPath, [cli, 'archive', 'feat', '--framework', 'bogus'], { cwd, encoding: 'utf8' });
        assert.strictEqual(bogus.status, 1);
        assert.match(bogus.stderr, /^Error: unknown framework "bogus"; use one of: spec-kit, openspec, generic \(or none\)\n$/);

        const traversal = spawnSync(process.execPath, [cli, 'archive', '../../src', '--framework', 'openspec'], { cwd, encoding: 'utf8' });
        assert.strictEqual(traversal.status, 1);
        assert.match(traversal.stderr, /^Error: invalid change name "\.\.\/\.\.\/src"/);
        assert.doesNotMatch(traversal.stderr, /\n\s+at /);
        assert.strictEqual((traversal.stderr.match(/Error:/g) ?? []).length, 1);
    } finally {
        fs.rmSync(cwd, { recursive: true, force: true });
    }
});
