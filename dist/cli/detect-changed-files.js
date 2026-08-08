"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDetectChangedFiles = runDetectChangedFiles;
const child_process_1 = require("child_process");
function runDetectChangedFiles(opts) {
    if (!opts.json) {
        console.log("Detecting changed files...");
    }
    try {
        const output = (0, child_process_1.execSync)("git status --porcelain=v1 --untracked-files=all", { encoding: "utf8" });
        const files = output.split("\n").filter(Boolean).map((line) => line.slice(3));
        if (opts.json) {
            console.log(JSON.stringify(files));
        }
        else {
            console.log(files.join("\n"));
        }
    }
    catch (error) {
        if (opts.json) {
            console.error(JSON.stringify({ error: String(error) }));
            process.exit(1);
        }
        else {
            console.error("Failed to detect changed files", error);
            process.exitCode = 1;
        }
    }
}
