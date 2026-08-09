"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runArchive = runArchive;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function runArchive(changeName) {
    if (!changeName) {
        console.error('Error: change name is required');
        process.exit(1);
    }
    const changesDir = node_path_1.default.join(process.cwd(), 'openspec', 'changes');
    const sourceDir = node_path_1.default.join(changesDir, changeName);
    if (!node_fs_1.default.existsSync(sourceDir)) {
        console.error(`Error: source change directory not found: ${sourceDir}`);
        process.exit(1);
    }
    const date = new Date().toISOString().split('T')[0];
    const targetName = changeName.match(/^\d{4}-\d{2}-\d{2}-/) ? changeName : `${date}-${changeName}`;
    const archiveDir = node_path_1.default.join(changesDir, 'archive');
    const targetDir = node_path_1.default.join(archiveDir, targetName);
    if (node_fs_1.default.existsSync(targetDir)) {
        console.error(`Error: destination already exists: ${targetDir}`);
        process.exit(1);
    }
    node_fs_1.default.mkdirSync(archiveDir, { recursive: true });
    // Perform copy and explicit empty directory cleanup
    node_fs_1.default.cpSync(sourceDir, targetDir, { recursive: true });
    node_fs_1.default.rmSync(sourceDir, { recursive: true, force: true });
    console.log(`Successfully archived ${changeName} to ${targetDir}`);
}
