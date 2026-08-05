"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDetectChangedFiles = runDetectChangedFiles;
const child_process_1 = require("child_process");
function runDetectChangedFiles(opts) {
    console.log("Detecting changed files...");
    try {
        const output = (0, child_process_1.execSync)('git diff --name-only', { encoding: 'utf8' });
        console.log(output);
    }
    catch (error) {
        console.error("Failed to detect changed files", error);
    }
}
