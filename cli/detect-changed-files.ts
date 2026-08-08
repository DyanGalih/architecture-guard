import { execSync } from 'child_process';

export function runDetectChangedFiles(opts: any) {
  if (!opts.json) {
    console.log("Detecting changed files...");
  }
  try {
    const output = execSync("git status --porcelain=v1 --untracked-files=all", { encoding: "utf8" });
    const files = output.split("\n").filter(Boolean).map((line) => line.slice(3));
    if (opts.json) {
      console.log(JSON.stringify(files));
    } else {
      console.log(files.join("\n"));
    }
  } catch (error) {
    if (opts.json) {
      console.error(JSON.stringify({ error: String(error) }));
      process.exit(1);
    } else {
      console.error("Failed to detect changed files", error);
      process.exitCode = 1;
    }
  }
}
