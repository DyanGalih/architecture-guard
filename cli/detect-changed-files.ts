import { execSync } from 'child_process';

export function runDetectChangedFiles(opts: any) {
  console.log("Detecting changed files...");
  try {
    const output = execSync('git diff --name-only', { encoding: 'utf8' });
    console.log(output);
  } catch (error) {
    console.error("Failed to detect changed files", error);
  }
}
