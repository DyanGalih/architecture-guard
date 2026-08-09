import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runArchive } from './cli/archive.js';

test('archive command completely removes source directory including empty nested dirs', () => {
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
        runArchive(changeName);
        
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
