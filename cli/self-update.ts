import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function runSelfUpdate() {
  console.log('Checking for updates...');

  try {
    // 1. Get current version
    const packageJsonPath =
      [join(__dirname, '..', 'package.json'), join(__dirname, '..', '..', 'package.json')]
        .find((candidate) => existsSync(candidate)) ?? join(__dirname, '..', '..', 'package.json');

    if (!existsSync(packageJsonPath)) {
      console.error('Could not find package.json to determine current version.');
      process.exit(1);
    }

    const packageData = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageData.version ?? '0.0.0';

    // 2. Get latest version from npm
    const latestVersionBuffer = execSync('npm view architecture-guard version');
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
      execSync('npm install -g architecture-guard@latest', { stdio: 'inherit' });
      console.log(`Successfully updated to v${latestVersion}`);
    } else {
      console.log('Already up to date');
    }

  } catch (error: any) {
    console.error('Update failed:', error.message);
    console.error('\nPlease try updating manually by running:');
    console.error('npm install -g architecture-guard@latest');
    process.exit(1);
  }
}

export function compareSemver(a: string, b: string): number {
  const parse = (value: string) => {
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
    if (left.core[i] !== right.core[i]) return left.core[i] > right.core[i] ? 1 : -1;
  }
  if (!left.prerelease.length || !right.prerelease.length) {
    return left.prerelease.length === right.prerelease.length ? 0 : left.prerelease.length ? -1 : 1;
  }
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let i = 0; i < length; i++) {
    const x = left.prerelease[i];
    const y = right.prerelease[i];
    if (x === y) continue;
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const xNumber = Number.isInteger(Number(x));
    const yNumber = Number.isInteger(Number(y));
    if (xNumber && yNumber) return Number(x) > Number(y) ? 1 : -1;
    if (xNumber !== yNumber) return xNumber ? -1 : 1;
    return x > y ? 1 : -1;
  }
  return 0;
}
