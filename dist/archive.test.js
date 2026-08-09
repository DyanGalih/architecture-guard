"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const archive_js_1 = require("./cli/archive.js");
(0, node_test_1.default)('archive command completely removes source directory including empty nested dirs', () => {
    const tmpdir = node_fs_1.default.mkdtempSync(node_path_1.default.join(node_os_1.default.tmpdir(), 'ag-archive-test-'));
    // Mock process.cwd() for the test
    const originalCwd = process.cwd;
    process.cwd = () => tmpdir;
    try {
        const changesDir = node_path_1.default.join(tmpdir, 'openspec', 'changes');
        const changeName = 'test-change';
        const sourceDir = node_path_1.default.join(changesDir, changeName);
        // Create source dir and nested empty dirs
        node_fs_1.default.mkdirSync(node_path_1.default.join(sourceDir, 'specs', 'capability'), { recursive: true });
        node_fs_1.default.writeFileSync(node_path_1.default.join(sourceDir, 'specs', 'capability', 'spec.md'), '# Spec');
        // Create an unrelated file
        const unrelatedDir = node_path_1.default.join(changesDir, 'other-change');
        node_fs_1.default.mkdirSync(unrelatedDir, { recursive: true });
        // Run archive
        (0, archive_js_1.runArchive)(changeName);
        // Verify target exists
        const date = new Date().toISOString().split('T')[0];
        const targetDir = node_path_1.default.join(changesDir, 'archive', `${date}-${changeName}`);
        node_assert_1.default.ok(node_fs_1.default.existsSync(targetDir), 'Target archive directory should exist');
        node_assert_1.default.ok(node_fs_1.default.existsSync(node_path_1.default.join(targetDir, 'specs', 'capability', 'spec.md')), 'Archived files should exist');
        // Verify source does NOT exist
        node_assert_1.default.strictEqual(node_fs_1.default.existsSync(sourceDir), false, 'Source directory should be completely removed');
        // Verify unrelated dir still exists
        node_assert_1.default.ok(node_fs_1.default.existsSync(unrelatedDir), 'Unrelated directories should not be deleted');
    }
    finally {
        // Restore cwd and cleanup
        process.cwd = originalCwd;
        node_fs_1.default.rmSync(tmpdir, { recursive: true, force: true });
    }
});
