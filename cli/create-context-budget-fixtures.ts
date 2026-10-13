import fs from 'node:fs';
import path from 'node:path';

const PROFILES: Array<[string, number]> = [['small', 3], ['medium', 12], ['large', 31]];

function specContent(profile: string, index: number) {
  const id = String(index).padStart(3, '0');
  const lines = [
    `# Feature ${id}`,
    '',
    `Purpose: Provide benchmark behavior for ${profile} profile feature ${id}.`,
    '',
    '## Requirements',
    `- FR-${id}: Preserve tenant isolation across every request.`,
    `- AC-${id}: The active workflow records notification delivery evidence.`,
  ];
  // Medium and large profiles must contain one explicit conflict (see docs/context-budget-benchmark.md).
  if (profile !== 'small' && index === 2) {
    lines.push(`- FR-${id}: Conflicts with FR-001 over synchronous versus asynchronous notification delivery.`);
  }
  lines.push('', '## Dependencies', '- Depends on the shared identity boundary defined by feature 001.', '');
  return lines.join('\n');
}

// Writes reproducible benchmark spec trees into an empty directory, refusing to touch existing content.
export function createContextBudgetFixtures(targetRoot: string) {
  if (fs.existsSync(targetRoot) && fs.readdirSync(targetRoot).length > 0) {
    throw new Error(`Target must be empty: ${targetRoot}`);
  }
  for (const [profile, count] of PROFILES) {
    for (let index = 1; index <= count; index++) {
      const featureDir = path.join(targetRoot, profile, 'specs', `${String(index).padStart(3, '0')}-feature`);
      fs.mkdirSync(featureDir, { recursive: true });
      fs.writeFileSync(path.join(featureDir, 'spec.md'), specContent(profile, index));
    }
  }
}

export function runCreateContextBudgetFixtures(target: string) {
  try {
    createContextBudgetFixtures(path.resolve(target));
    console.log(`Created context-budget fixtures under ${target}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
