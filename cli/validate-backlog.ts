import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

export const BACKLOG_TYPES = ['story', 'feature', 'bug', 'task', 'chore', 'spike'] as const;
export const BACKLOG_PRIORITIES = ['highest', 'high', 'medium', 'low', 'lowest'] as const;

const id = z.string().regex(/^[A-Za-z0-9._-]+$/, 'use letters, digits, dot, underscore, or hyphen');

// Local fallback backlog for ag-governed-backlog (see templates/backlog_item.md)
const itemSchema = z.object({
  id,
  // Custom types are allowed when sync.yml backlog.lanes maps them
  type: z.string().regex(/^[a-z][a-z0-9_-]*$/, 'use a lowercase type name'),
  priority: z.enum(BACKLOG_PRIORITIES),
  title: z.string().min(1),
  description: z.string().optional(),
  acceptance: z.array(z.string().min(1)).optional(),
  group: id.optional(),
  depends_on: z.array(id).optional(),
  size: z.enum(['xs', 's', 'm', 'l', 'xl']).optional(),
}).strict();

const backlogSchema = z.object({
  items: z.array(itemSchema).min(1),
}).strict().superRefine((backlog, ctx) => {
  const itemIds = new Set<string>();
  backlog.items.forEach((item, index) => {
    if (itemIds.has(item.id)) {
      ctx.addIssue({ code: 'custom', path: ['items', index, 'id'], message: `duplicate id ${item.id}` });
    }
    itemIds.add(item.id);
  });
  const groupIds = new Set(backlog.items.map(item => item.group).filter(Boolean));
  for (const groupId of groupIds) {
    if (itemIds.has(groupId)) {
      ctx.addIssue({ code: 'custom', path: ['items'], message: `group ${groupId} reuses an item id` });
    }
  }
  backlog.items.forEach((item, index) => {
    (item.depends_on ?? []).forEach((target, depIndex) => {
      if (!itemIds.has(target) && !groupIds.has(target)) {
        ctx.addIssue({ code: 'custom', path: ['items', index, 'depends_on', depIndex], message: `unknown dependency ${target}` });
      }
    });
  });
  const cycle = findGroupCycle(backlog.items);
  if (cycle) {
    ctx.addIssue({ code: 'custom', path: ['items'], message: `dependency cycle: ${cycle.join(' -> ')}` });
  }
});

export type Backlog = z.infer<typeof backlogSchema>;
type BacklogItem = Backlog['items'][number];

// Items without a group form a group of their own, so cycles are checked between groups
function findGroupCycle(items: BacklogItem[]): string[] | null {
  const groupOf = new Map(items.map(item => [item.id, item.group ?? item.id]));
  const edges = new Map<string, Set<string>>();
  for (const item of items) {
    const from = groupOf.get(item.id);
    for (const target of item.depends_on ?? []) {
      const to = groupOf.get(target) ?? target;
      if (to === from) continue;
      if (!edges.has(from)) edges.set(from, new Set());
      edges.get(from).add(to);
    }
  }
  const state = new Map<string, 'visiting' | 'done'>();
  const stack: string[] = [];
  const visit = (node: string): string[] | null => {
    if (state.get(node) === 'done') return null;
    if (state.get(node) === 'visiting') return [...stack.slice(stack.indexOf(node)), node];
    state.set(node, 'visiting');
    stack.push(node);
    for (const next of edges.get(node) ?? []) {
      const cycle = visit(next);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(node, 'done');
    return null;
  };
  for (const node of edges.keys()) {
    const cycle = visit(node);
    if (cycle) return cycle;
  }
  return null;
}

export function validateBacklog(backlogPath: string): Backlog {
  const fullPath = path.resolve(backlogPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Backlog not found at ${fullPath}`);
  }

  let parsed: unknown;
  try {
    parsed = parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (e) {
    throw new Error(`Invalid YAML format in ${fullPath}`, { cause: e });
  }

  const result = backlogSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map(issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    throw new Error(`Invalid backlog ${fullPath}\n${issues.join('\n')}`);
  }
  return result.data;
}

export function runValidateBacklog(backlogPath = '.architecture-guard/backlog.yml') {
  try {
    console.log(JSON.stringify(validateBacklog(backlogPath)));
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  }
}
