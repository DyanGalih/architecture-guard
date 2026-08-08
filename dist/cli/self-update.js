"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSelfUpdate = runSelfUpdate;
exports.compareSemver = compareSemver;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function runSelfUpdate() {
    console.log('Checking for updates...');
    try {
        // 1. Get current version
        const packageJsonPath = [(0, node_path_1.join)(__dirname, '..', 'package.json'), (0, node_path_1.join)(__dirname, '..', '..', 'package.json')]
            .find((candidate) => (0, node_fs_1.existsSync)(candidate)) ?? (0, node_path_1.join)(__dirname, '..', '..', 'package.json');
        if (!(0, node_fs_1.existsSync)(packageJsonPath)) {
            console.error('Could not find package.json to determine current version.');
            process.exit(1);
        }
        const packageData = JSON.parse((0, node_fs_1.readFileSync)(packageJsonPath, 'utf8'));
        const currentVersion = packageData.version ?? '0.0.0';
        // 2. Get latest version from npm
        const latestVersionBuffer = (0, node_child_process_1.execSync)('npm view architecture-guard version');
        const latestVersion = latestVersionBuffer.toString().trim();
        if (!latestVersion) {
            console.error('Failed to retrieve latest version from npm registry.');
            process.exit(1);
        }
        console.log(`Current version: v${currentVersion}`);
        console.log(`Latest version : v${latestVersion}`);
        // 3. Compare and Update
        const isNewer = compareSemver(latestVersion, currentVersion) > 0;
        if (isNewer) {
            console.log(`A newer version is available. Updating to v${latestVersion}...`);
            (0, node_child_process_1.execSync)('npm install -g architecture-guard@latest', { stdio: 'inherit' });
            console.log(`Successfully updated to v${latestVersion}`);
        }
        else {
            console.log('Already up to date');
        }
    }
    catch (error) {
        console.error('Update failed:', error.message);
        console.error('\nPlease try updating manually by running:');
        console.error('npm install -g architecture-guard@latest');
        process.exit(1);
    }
}
function compareSemver(a, b) {
    const parse = (value) => {
        const normalized = value.trim().startsWith("v") ? value.trim().slice(1) : value.trim();
        const [withoutBuild] = normalized.split("+", 1);
        const [core, prerelease = ""] = withoutBuild.split("-", 2);
        const parts = core.split(".").map(Number);
        if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part < 0)) {
            throw new Error(`Invalid semantic version: ${value}`);
        }
        return { core: parts, prerelease: prerelease ? prerelease.split(".") : [] };
    };
    const left = parse(a);
    const right = parse(b);
    for (let i = 0; i < 3; i++) {
        if (left.core[i] !== right.core[i])
            return left.core[i] > right.core[i] ? 1 : -1;
    }
    if (!left.prerelease.length || !right.prerelease.length) {
        return left.prerelease.length === right.prerelease.length ? 0 : left.prerelease.length ? -1 : 1;
    }
    const length = Math.max(left.prerelease.length, right.prerelease.length);
    for (let i = 0; i < length; i++) {
        const x = left.prerelease[i];
        const y = right.prerelease[i];
        if (x === y)
            continue;
        if (x === undefined)
            return -1;
        if (y === undefined)
            return 1;
        const xNumber = Number.isInteger(Number(x));
        const yNumber = Number.isInteger(Number(y));
        if (xNumber && yNumber)
            return Number(x) > Number(y) ? 1 : -1;
        if (xNumber !== yNumber)
            return xNumber ? -1 : 1;
        return x > y ? 1 : -1;
    }
    return 0;
}
