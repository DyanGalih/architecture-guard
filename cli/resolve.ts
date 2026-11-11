import fs from 'node:fs';
import path from 'node:path';

export interface ResolveOptions {
  path?: boolean;
  json?: boolean;
  list?: boolean;
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
  flow: 'flow',
  flows: 'flow',
  manifest: 'manifest',
  config: 'manifest',
};

function unsupportedCategoryError(rawCategory: string): Error {
  const category = rawCategory.toLowerCase().trim();
  if (category === "adapter" || category === "adapters") {
    return new Error("Adapter selection is file-based, not a resource category. Read .architecture-guard/selected-adapter and .architecture-guard/adapters/{name}.md; resolve supports engine resources only.");
  }
  return new Error("Unknown category \"" + rawCategory + "\". Supported categories: " + Object.keys(CATEGORY_MAP).join(", "));
}

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

// Treat the workspace/package root as the trusted anchor; reject links that escape it or dangle.
// When allowCategorySymlink is true, category directories under .architecture-guard or ag
// (e.g. templates -> /shared/templates) are allowed as local override directories. Files
// inside must stay within that directory.
function rejectSymlinks(root: string, target: string, allowCategorySymlink = false): void {
  const realRoot = fs.existsSync(root) ? fs.realpathSync(root) : path.resolve(root);
  const realPkg = fs.existsSync(ROOT_DIR) ? fs.realpathSync(ROOT_DIR) : ROOT_DIR;
  const relative = path.relative(root, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Resource path escapes root: ${target}`);
  }
  let current = root;
  let currentAnchor = realRoot;
  const parts = relative.split(path.sep).filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) {
        try {
          const real = fs.realpathSync(current);
          const isCategoryDir = allowCategorySymlink &&
            i === 1 &&
            (parts[0] === '.architecture-guard' || parts[0] === 'ag') &&
            fs.statSync(current).isDirectory();
          if (isCategoryDir) {
            currentAnchor = real;
            continue;
          }
          const relAnchor = path.relative(currentAnchor, real);
          const relPkg = path.relative(realPkg, real);
          const escapesAnchor = relAnchor === '..' || relAnchor.startsWith(`..${path.sep}`) || path.isAbsolute(relAnchor);
          const escapesPkg = relPkg === '..' || relPkg.startsWith(`..${path.sep}`) || path.isAbsolute(relPkg);
          if (escapesAnchor && escapesPkg) {
            throw new Error(`Symlink resource path is not allowed: ${current}`);
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('Symlink resource path is not allowed:')) throw e;
          throw new Error(`Symlink resource path is not allowed: ${current}`, { cause: e });
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
  }
}

function candidateExistsOrIsSymlink(filePath: string): boolean {
  try {
    const lstat = fs.lstatSync(filePath);
    return lstat.isFile() || lstat.isSymbolicLink();
  } catch {
    return false;
  }
}

function resolveManifestResource(targetDir: string): ResolvedResource {
  const candidatePaths = [
    path.join(targetDir, '.architecture-guard', 'config.yml'),
    path.join(targetDir, '.architecture-guard', 'config.yaml'),
    path.join(targetDir, 'ag', 'config.yml'),
    path.join(targetDir, '.architecture-guard', 'selected-adapter'),
  ];

  for (const candidate of candidatePaths) {
    if (candidateExistsOrIsSymlink(candidate)) {
      rejectSymlinks(targetDir, candidate);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return {
          category: 'manifest',
          name: path.basename(candidate),
          source: 'local',
          path: candidate,
          content: fs.readFileSync(candidate, 'utf8'),
        };
      }
    }
  }

  throw new Error(`No configuration manifest found in ${targetDir} (.architecture-guard/config.yml)`);
}

function findCandidateResource(
  dirs: string[],
  cleanName: string,
  extensions: string[],
  allowedDirs: string[],
  symlinkBase: string,
  allowCategorySymlink = false
): string | null {
  for (const dir of dirs) {
    for (const ext of extensions) {
      const candidate = path.join(dir, `${cleanName}${ext}`);
      if (!candidateExistsOrIsSymlink(candidate)) {
        continue;
      }
      rejectSymlinks(symlinkBase, candidate, allowCategorySymlink);
      if (ensureWithinBounds(candidate, allowedDirs) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    }
  }
  return null;
}

export function resolveResource(
  rawCategory: string,
  rawName?: string,
  options: ResolveOptions = {}
): ResolvedResource {
  const targetDir = options.target ? path.resolve(options.target) : process.cwd();
  const categoryKey = rawCategory.toLowerCase().trim();
  if (categoryKey === "adapter" || categoryKey === "adapters") {
    throw unsupportedCategoryError(rawCategory);
  }

  const normalizedCategory = CATEGORY_MAP[categoryKey];

  if (!normalizedCategory) {
    throw new Error(
      `Unknown category "${rawCategory}". Supported categories: ${Object.keys(CATEGORY_MAP).join(', ')}`
    );
  }

  // Handle manifest / config resolution
  if (normalizedCategory === 'manifest') {
    return resolveManifestResource(targetDir);
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
  const localCandidate = findCandidateResource(localDirs, cleanName, extensionsToTry, allowedDirs, targetDir, true);
  if (localCandidate) {
    return {
      category: normalizedCategory,
      name: path.basename(localCandidate),
      source: 'local',
      path: localCandidate,
      content: fs.readFileSync(localCandidate, 'utf8'),
    };
  }

  // 2. Fall back to bundled package resources
  const bundledCandidate = findCandidateResource([bundledDir], cleanName, extensionsToTry, allowedDirs, ROOT_DIR);
  if (bundledCandidate) {
    return {
      category: normalizedCategory,
      name: path.basename(bundledCandidate),
      source: 'bundled',
      path: bundledCandidate,
      content: fs.readFileSync(bundledCandidate, 'utf8'),
    };
  }

  throw new Error(`Resource "${name}" not found in category "${normalizedCategory}" (checked local workspace and bundled resources)`);
}

export function listCategoryResources(
  rawCategory: string,
  options: ResolveOptions = {}
): string[] {
  const targetDir = options.target ? path.resolve(options.target) : process.cwd();
  const categoryKey = rawCategory.toLowerCase().trim();
  if (categoryKey === "adapter" || categoryKey === "adapters") {
    throw unsupportedCategoryError(rawCategory);
  }

  const normalizedCategory = CATEGORY_MAP[categoryKey];

  if (!normalizedCategory || normalizedCategory === 'manifest') {
    throw new Error(`Cannot list resources for category "${rawCategory}"`);
  }

  const items = new Set<string>();

  // Bundled
  const bundledDir = path.join(ROOT_DIR, normalizedCategory);
  rejectSymlinks(ROOT_DIR, bundledDir);
  if (fs.existsSync(bundledDir)) {
    for (const file of fs.readdirSync(bundledDir)) {
      rejectSymlinks(ROOT_DIR, path.join(bundledDir, file));
      if (fs.statSync(path.join(bundledDir, file)).isFile()) {
        items.add(file);
      }
    }
  }

  // Local overrides
  const localDirs = [
    path.join(targetDir, '.architecture-guard', normalizedCategory),
    path.join(targetDir, 'ag', normalizedCategory),
  ];
  for (const localDir of localDirs) {
    if (!fs.existsSync(localDir) && !candidateExistsOrIsSymlink(localDir)) continue;
    rejectSymlinks(targetDir, localDir, true);
    if (fs.existsSync(localDir)) {
      for (const file of fs.readdirSync(localDir)) {
        const filePath = path.join(localDir, file);
        rejectSymlinks(targetDir, filePath, true);
        if (fs.statSync(filePath).isFile()) {
          items.add(file);
        }
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
    if (options.list) {
      if (rawName) {
        throw new Error('A resource name cannot be combined with --list');
      }
      if (options.path) {
        throw new Error('--path cannot be combined with --list');
      }
      const resources = listCategoryResources(rawCategory, options);
      if (options.json) {
        console.log(JSON.stringify(resources, null, 2));
      } else {
        process.stdout.write(resources.join('\n'));
        if (resources.length > 0) process.stdout.write('\n');
      }
      return;
    }
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
