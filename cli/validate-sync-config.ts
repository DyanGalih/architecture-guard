import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

const syncSchema = z.object({
  provider: z.enum(['github', 'jira']),
  repo: z.string().optional(), // For github
  project: z.string().optional(), // For jira
  enabled: z.boolean().default(true),
});

export type SyncConfig = z.infer<typeof syncSchema>;

export function validateSyncConfig(configPath: string): SyncConfig {
  const fullPath = path.resolve(configPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Sync config not found at ${fullPath}`);
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  let parsed: unknown;
  try {
    parsed = parse(content);
  } catch (e) {
    throw new Error(`Invalid YAML format in ${configPath}: ${e}`);
  }
  
  return syncSchema.parse(parsed);
}

// If run directly
if (require.main === module) {
  try {
    const configPath = process.argv[2] || '.architecture-guard/sync.yml';
    const config = validateSyncConfig(configPath);
    console.log(JSON.stringify(config, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
