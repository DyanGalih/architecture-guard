import fs from 'node:fs';
import path from 'node:path';

export interface ResolveOptions {
  path?: boolean;
  json?: boolean;
  target?: string;
}

export interface ResolvedResource {
  category: string;
  name: string;
  source: 'local' | 'bundled';
  path: string;
  content: string;
}

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const CATEGORY_MAP: Record<string, string> = {
  template: 'templates',
  templates: 'templates',
  preset: 'presets',
  presets: 'presets',
  'hygiene-rule': 'hygiene-rules',
  'hygiene-rules': 'hygiene-rules',
  'sonar-rule': 'sonar-rules',
  'sonar-rules': 'sonar-rules',
  manifest: 'manifest',
  config: 'manifest',
};

function sanitizeIdentifier(input: string): string {
  if (input.includes('..') || path.isAbsolute(input)) {
    throw new Error(`Invalid identifier: path traversal detected in "${input}"`);
  }
  const normalized = path.normalize(input);
  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new Error(`Invalid identifier: path traversal detected in "${input}"`);
  }
  return normalized;
}

function ensureWithinBounds(targetPath: string, allowedDirs: string[]): boolean {
  const resolved = path.resolve(targetPath);
  return allowedDirs.some((allowed) => {
    const allowedResolved = path.resolve(allowed);
    return resolved === allowedResolved || resolved.startsWith(allowedResolved + path.sep);
  });
}

export function resolveResource(
  rawCategory: string,
  rawName?: string,
  options: ResolveOptions = {}
): ResolvedResource {
  const targetDir = options.target ? path.resolve(options.target) : process.cwd();
  const categoryKey = rawCategory.toLowerCase().trim();
  const normalizedCategory = CATEGORY_MAP[categoryKey];

  if (!normalizedCategory) {
    throw new Error(
      `Unknown category "${rawCategory}". Supported categories: ${Object.keys(CATEGORY_MAP).join(', ')}`
    );
  }

  // Handle manifest / config resolution
  if (normalizedCategory === 'manifest') {
    const candidatePaths = [
      path.join(targetDir, '.architecture-guard', 'config.yml'),
      path.join(targetDir, '.architecture-guard', 'config.yaml'),
      path.join(targetDir, 'ag', 'config.yml'),
      path.join(targetDir, '.architecture-guard', 'selected-adapter'),
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        return {
          category: 'manifest',
          name: path.basename(candidate),
          source: 'local',
          path: candidate,
          content: fs.readFileSync(candidate, 'utf8'),
        };
      }
    }

    throw new Error(`No configuration manifest found in ${targetDir} (.architecture-guard/config.yml)`);
  }

  let name = rawName ? rawName.trim() : '';

  // Default filenames for categories when name is omitted
  if (!name) {
    if (normalizedCategory === 'sonar-rules') {
      name = 'sonarlint-rules.json';
    } else {
      throw new Error(`Resource name is required for category "${rawCategory}"`);
    }
  }

  const cleanName = sanitizeIdentifier(name);
  const extensionsToTry = cleanName.includes('.') ? [''] : ['.md', '.json', '.yml', '.yaml'];

  const localDirs = [
    path.join(targetDir, '.architecture-guard', normalizedCategory),
    path.join(targetDir, 'ag', normalizedCategory),
  ];

  const bundledDir = path.join(ROOT_DIR, normalizedCategory);
  const allowedDirs = [...localDirs, bundledDir, targetDir, ROOT_DIR];

  // 1. Check local workspace overrides first
  for (const dir of localDirs) {
    for (const ext of extensionsToTry) {
      const candidate = path.join(dir, `${cleanName}${ext}`);
      if (ensureWithinBounds(candidate, allowedDirs) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return {
          category: normalizedCategory,
          name: path.basename(candidate),
          source: 'local',
          path: candidate,
          content: fs.readFileSync(candidate, 'utf8'),
        };
      }
    }
  }

  // 2. Fall back to bundled package resources
  for (const ext of extensionsToTry) {
    const candidate = path.join(bundledDir, `${cleanName}${ext}`);
    if (ensureWithinBounds(candidate, allowedDirs) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return {
        category: normalizedCategory,
        name: path.basename(candidate),
        source: 'bundled',
        path: candidate,
        content: fs.readFileSync(candidate, 'utf8'),
      };
    }
  }

  throw new Error(`Resource "${name}" not found in category "${normalizedCategory}" (checked local workspace and bundled resources)`);
}

export function listCategoryResources(
  rawCategory: string,
  options: ResolveOptions = {}
): string[] {
  const targetDir = options.target ? path.resolve(options.target) : process.cwd();
  const categoryKey = rawCategory.toLowerCase().trim();
  const normalizedCategory = CATEGORY_MAP[categoryKey];

  if (!normalizedCategory || normalizedCategory === 'manifest') {
    throw new Error(`Cannot list resources for category "${rawCategory}"`);
  }

  const items = new Set<string>();

  // Bundled
  const bundledDir = path.join(ROOT_DIR, normalizedCategory);
  if (fs.existsSync(bundledDir)) {
    for (const file of fs.readdirSync(bundledDir)) {
      if (fs.statSync(path.join(bundledDir, file)).isFile()) {
        items.add(file);
      }
    }
  }

  // Local overrides
  const localDir = path.join(targetDir, '.architecture-guard', normalizedCategory);
  if (fs.existsSync(localDir)) {
    for (const file of fs.readdirSync(localDir)) {
      if (fs.statSync(path.join(localDir, file)).isFile()) {
        items.add(file);
      }
    }
  }

  return Array.from(items).sort();
}

export async function runResolveCommand(
  rawCategory: string,
  rawName?: string,
  options: ResolveOptions = {}
): Promise<void> {
  try {
    const result = resolveResource(rawCategory, rawName, options);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (options.path) {
      console.log(result.path);
      return;
    }

    process.stdout.write(result.content);
    if (!result.content.endsWith('\n')) {
      process.stdout.write('\n');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exitCode = 1;
  }
}
