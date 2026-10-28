import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

const syncSchema = z.object({
  provider: z.enum(['github', 'jira']),
  repo: z.string().optional(), // For github
  project: z.string().optional(), // For jira
  enabled: z.boolean().default(true),
  // Read-only story scope check used by reviews (see templates/story_scope.md)
  scope_check: z.object({
    enabled: z.boolean().default(true),
    candidate_jql: z.string().min(1).optional(),
    max_candidates: z.number().int().min(1).max(50).default(20),
  }).strict().optional(),
}).superRefine((config, ctx) => {
  if (config.scope_check?.enabled && config.provider !== 'jira') {
    ctx.addIssue({ code: 'custom', path: ['scope_check'], message: 'scope_check supports provider jira only' });
  }
  if (config.scope_check?.enabled && !config.project) {
    ctx.addIssue({ code: 'custom', path: ['project'], message: 'scope_check needs the jira project key' });
  }
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
    throw new Error(`Invalid YAML format in ${fullPath}`, { cause: e });
  }
  
  return syncSchema.parse(parsed);
}

export function runValidateSyncConfig(configPath = '.architecture-guard/sync.yml') {
  try {
    console.log(JSON.stringify(validateSyncConfig(configPath)));
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  }
}
