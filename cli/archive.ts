import { access, cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const featureStateSchema = z.object({ feature_directory: z.string().min(1) });
const frameworkSchema = z.enum(['speckit', 'openspec', 'generic']);
const FRAMEWORK_CHOICES = 'spec-kit, openspec, generic (or none)';
type ArchiveOptions = { json?: boolean; framework?: string };

async function exists(target: string) {
    try {
        await access(target);
        return true;
    } catch {
        return false;
    }
}

// The CLI action prints the message once and sets a non-zero exit code.
function reportError(message: string): never {
    throw new Error(message);
}

function reportWarning(message: string) {
    process.stderr.write(`Warning: ${message}\n`);
}

export async function runArchive(changeName: string, options: ArchiveOptions = {}) {
    validateChangeName(changeName);

    const root = process.cwd();
    const framework = await resolveFramework(root, options.framework);
    if (framework === 'speckit') return finalizeSpecKitFeature(changeName, root, options.json === true);
    if (framework === 'generic') return archiveGenericChange(changeName, root, options.json === true);
    return archiveOpenSpecChange(changeName, root, options.json === true);
}

// A change name is a single directory name; anything else could move files outside the changes directory.
function validateChangeName(changeName: string) {
    if (!changeName || !changeName.trim()) reportError('change name is required');
    if (path.isAbsolute(changeName) || /[/\\]/.test(changeName) || changeName.includes('..')) {
        reportError(`invalid change name "${changeName}": use a single directory name without "/", "\\", or ".."`);
    }
}

// Accepts the installer's adapter names (spec-kit, none) as well as the historical CLI spelling (speckit).
function normalizeFramework(name: string) {
    const normalized = name === 'spec-kit' ? 'speckit' : name === 'none' ? 'generic' : name;
    const parsed = frameworkSchema.safeParse(normalized);
    if (!parsed.success) reportError(`unknown framework "${name}"; use one of: ${FRAMEWORK_CHOICES}`);
    return parsed.data;
}

async function resolveFramework(root: string, override?: string) {
    if (override) return normalizeFramework(override);

    // The installer-selected adapter is authoritative; filesystem markers are only a fallback.
    const selectedAdapterPath = path.join(root, '.architecture-guard', 'selected-adapter');
    if (await exists(selectedAdapterPath)) {
        const selected = (await readFile(selectedAdapterPath, 'utf8')).trim();
        if (['generic', 'none', 'openspec', 'spec-kit'].includes(selected)) return normalizeFramework(selected);
        reportError(`the archive CLI supports only the spec-kit, openspec, and generic adapters; selected adapter "${selected}" must archive through its own archive command`);
    }

    const hasSpecKit = await exists(path.join(root, '.specify'));
    const hasOpenSpec = await exists(path.join(root, 'openspec', 'config.yaml'));
    if (hasSpecKit && hasOpenSpec) reportError('both SpecKit and OpenSpec markers are present; select an adapter explicitly');
    if (hasSpecKit) return 'speckit';
    return 'openspec';
}

function archiveGenericChange(changeName: string, root: string, json: boolean) {
    return archiveChangeDirectory(changeName, path.join(root, 'changes'), 'generic', json);
}

function archiveOpenSpecChange(changeName: string, root: string, json: boolean) {
    return archiveChangeDirectory(changeName, path.join(root, 'openspec', 'changes'), 'openspec', json);
}

async function archiveChangeDirectory(changeName: string, changesDir: string, framework: 'generic' | 'openspec', json: boolean) {
    const sourceDir = path.resolve(changesDir, changeName);
    const relativeSource = path.relative(changesDir, sourceDir);
    if (!relativeSource || relativeSource.startsWith('..') || path.isAbsolute(relativeSource)) {
        reportError(`change "${changeName}" must resolve inside ${changesDir}`);
    }
    if (!await exists(sourceDir)) reportError(`source change directory not found: ${sourceDir}`);

    const date = new Date().toISOString().split('T')[0];
    const targetName = /^\d{4}-\d{2}-\d{2}-/.test(changeName) ? changeName : `${date}-${changeName}`;
    const archiveDir = path.join(changesDir, 'archive');
    const targetDir = path.join(archiveDir, targetName);
    if (await exists(targetDir)) reportError(`destination already exists: ${targetDir}`);

    await mkdir(archiveDir, { recursive: true });
    await moveDirectory(sourceDir, targetDir);
    const result = { status: 'success', framework, changeName, targetDir } as const;
    process.stdout.write(json ? `${JSON.stringify(result)}\n` : `Successfully archived ${changeName} to ${targetDir}\n`);
    return result;
}

// rename is atomic and never leaves a half-copied tree; copy+remove is only for moves across devices.
async function moveDirectory(sourceDir: string, targetDir: string) {
    try {
        await rename(sourceDir, targetDir);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error;
        await cp(sourceDir, targetDir, { recursive: true });
        await rm(sourceDir, { recursive: true, force: true });
    }
}

async function finalizeSpecKitFeature(changeName: string, root: string, json: boolean) {
    let featureDirectory = path.join('specs', changeName);
    const featureJson = path.join(root, '.specify', 'feature.json');

    if (await exists(featureJson)) {
        const state = featureStateSchema.safeParse(JSON.parse(await readFile(featureJson, 'utf8')));
        if (!state.success) reportError('.specify/feature.json must define a non-empty feature_directory');
        featureDirectory = state.data.feature_directory;
    }

    const featureRoot = path.resolve(root, featureDirectory);
    const relativeFeature = path.relative(root, featureRoot);
    if (!relativeFeature || relativeFeature.startsWith('..') || path.isAbsolute(relativeFeature)) {
        reportError('SpecKit feature_directory must resolve under the project root');
    }

    const normalizedFeature = relativeFeature.split(path.sep).join('/');
    const specPath = path.join(featureRoot, 'spec.md');
    if (!await exists(specPath)) {
        return finalizeIncomplete('skipped', normalizedFeature, `SpecKit feature spec not found: ${specPath}`, json);
    }

    const indexPath = path.join(root, 'specs', 'system_context.md');
    const specText = await readFile(specPath, 'utf8');
    const title = specText.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(featureRoot);
    // The Purpose section runs to the next level-2 heading or the true end of the spec.
    const purpose = specText.replace(/\r\n/g, '\n').match(/^## Purpose[ \t]*\n+([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1].trim() || 'Completed SpecKit feature.';
    const marker = `<!-- architecture-guard:feature=${normalizedFeature} -->`;
    // Links inside specs/system_context.md resolve relative to the specs/ directory.
    const specLink = `${path.posix.relative('specs', normalizedFeature)}/spec.md`;
    const entry = `${marker}\n## ${title}\n${purpose}\n\n- Feature spec: [${specLink}](${specLink})`;

    try {
        await mkdir(path.dirname(indexPath), { recursive: true });
        const current = await exists(indexPath) ? await readFile(indexPath, 'utf8') : '# System Context\n\n';
        const markerStart = current.indexOf(marker);
        const entryEnd = markerStart >= 0 ? managedEntryEnd(current, markerStart + marker.length) : null;
        if (markerStart >= 0 && entryEnd === null) {
            return finalizeIncomplete('failed', normalizedFeature, `managed entry for ${normalizedFeature} in ${indexPath} has no "- Feature spec:" line; restore that line or remove the entry, then finalize again`, json);
        }
        const updated = entryEnd !== null
            ? current.slice(0, markerStart) + entry + current.slice(entryEnd)
            : `${current.trimEnd()}\n\n${entry}`;
        await writeFile(indexPath, `${updated.trimEnd()}\n`);
    } catch (error) {
        return finalizeIncomplete('failed', normalizedFeature, `unable to update SpecKit context index ${indexPath}: ${error instanceof Error ? error.message : error}`, json);
    }
    const result = { status: 'success', framework: 'speckit', featureDirectory: normalizedFeature, indexPath } as const;
    process.stdout.write(json ? `${JSON.stringify(result)}\n` : `Finalized SpecKit feature ${normalizedFeature}\n`);
    return result;
}

// A managed entry is its marker, its own "## title" line, and the body up to its "- Feature spec:"
// line. It never extends past the next level-2 heading or managed marker, so hand-written text
// after an entry survives re-finalizing. Without that line the entry's end is unknown: return null
// rather than guess a boundary that could swallow hand-written text.
function managedEntryEnd(current: string, start: number): number | null {
    const rest = current.slice(start);
    const ownHeading = rest.match(/^\r?\n## [^\n]*/)?.[0].length ?? 0;
    const nextBoundary = rest.slice(ownHeading).search(/^(?:## |<!-- architecture-guard:feature=)/m);
    const limit = nextBoundary >= 0 ? ownHeading + nextBoundary : rest.length;
    const specLine = /^- Feature spec: [^\n]*/m.exec(rest.slice(0, limit));
    return specLine ? start + specLine.index + specLine[0].length : null;
}

// Finalize did not update the index: say so explicitly and exit non-zero.
function finalizeIncomplete(status: 'skipped' | 'failed', featureDirectory: string, reason: string, json: boolean) {
    const result = { status, framework: 'speckit', featureDirectory, reason } as const;
    if (json) process.stdout.write(`${JSON.stringify(result)}\n`);
    else reportWarning(reason);
    process.exitCode = 1;
    return result;
}
