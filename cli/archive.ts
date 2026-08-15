import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const featureStateSchema = z.object({ feature_directory: z.string().min(1) });
const frameworkSchema = z.enum(['speckit', 'openspec']);
type ArchiveOptions = { json?: boolean; framework?: string };

async function exists(target: string) {
    try {
        await access(target);
        return true;
    } catch {
        return false;
    }
}

function reportError(message: string): never {
    process.stderr.write(`Error: ${message}\n`);
    throw new Error(message);
}

function reportWarning(message: string) {
    process.stderr.write(`Warning: ${message}\n`);
}

export async function runArchive(changeName: string, options: ArchiveOptions = {}) {
    if (!changeName) reportError('change name is required');

    const root = process.cwd();
    const framework = await resolveFramework(root, options.framework);
    if (framework === 'speckit') return finalizeSpecKitFeature(changeName, root, options.json === true);
    return archiveOpenSpecChange(changeName, root, options.json === true);
}

async function resolveFramework(root: string, override?: string) {
    if (override) return frameworkSchema.parse(override);
    const hasSpecKit = await exists(path.join(root, '.specify'));
    const hasOpenSpec = await exists(path.join(root, 'openspec', 'config.yaml'));
    if (hasSpecKit && hasOpenSpec) reportError('both SpecKit and OpenSpec markers are present; select an adapter explicitly');
    return hasSpecKit ? 'speckit' : 'openspec';
}

async function archiveOpenSpecChange(changeName: string, root: string, json: boolean) {
    const changesDir = path.join(root, 'openspec', 'changes');
    const sourceDir = path.join(changesDir, changeName);
    if (!await exists(sourceDir)) reportError(`source change directory not found: ${sourceDir}`);

    const date = new Date().toISOString().split('T')[0];
    const targetName = /^\d{4}-\d{2}-\d{2}-/.test(changeName) ? changeName : `${date}-${changeName}`;
    const archiveDir = path.join(changesDir, 'archive');
    const targetDir = path.join(archiveDir, targetName);
    if (await exists(targetDir)) reportError(`destination already exists: ${targetDir}`);

    await mkdir(archiveDir, { recursive: true });
    await cp(sourceDir, targetDir, { recursive: true });
    await rm(sourceDir, { recursive: true, force: true });
    const result = { status: 'success', framework: 'openspec', changeName, targetDir } as const;
    process.stdout.write(json ? `${JSON.stringify(result)}\n` : `Successfully archived ${changeName} to ${targetDir}\n`);
    return result;
}

async function finalizeSpecKitFeature(changeName: string, root: string, json: boolean) {
    let featureDirectory = path.join('specs', changeName);
    const featureJson = path.join(root, '.specify', 'feature.json');

    if (await exists(featureJson)) {
        const rawState = JSON.parse(await readFile(featureJson, 'utf8'));
        const state = featureStateSchema.parse(rawState);
        featureDirectory = state.feature_directory;
    }

    const featureRoot = path.resolve(root, featureDirectory);
    const relativeFeature = path.relative(root, featureRoot);
    if (!relativeFeature || relativeFeature.startsWith('..') || path.isAbsolute(relativeFeature)) {
        reportError('SpecKit feature_directory must resolve under the project root');
    }

    const specPath = path.join(featureRoot, 'spec.md');
    if (!await exists(specPath)) reportWarning(`SpecKit feature spec not found: ${specPath}`);
    if (!await exists(specPath)) return;

    const normalizedFeature = relativeFeature.split(path.sep).join('/');
    const indexPath = path.join(root, 'specs', 'system_context.md');
    const specText = await readFile(specPath, 'utf8');
    const title = specText.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(featureRoot);
    const purpose = specText.match(/^## Purpose\s*\n+([\s\S]*?)(?=^## |$)/m)?.[1].trim().replace(/\s+/g, ' ') ?? 'Completed SpecKit feature.';
    const marker = `<!-- architecture-guard:feature=${normalizedFeature} -->`;
    const entry = `${marker}\n## ${title}\n${purpose}\n\n- Feature spec: [${normalizedFeature}/spec.md](${normalizedFeature}/spec.md)\n`;

    try {
        await mkdir(path.dirname(indexPath), { recursive: true });
        const current = await exists(indexPath) ? await readFile(indexPath, 'utf8') : '# System Context\n\n';
        const markerStart = current.indexOf(marker);
        const nextHeading = markerStart >= 0 ? current.indexOf('\n<!-- architecture-guard:feature=', markerStart + marker.length) : -1;
        const replacementEnd = markerStart >= 0 ? (nextHeading >= 0 ? nextHeading + 1 : current.length) : current.length;
        const updated = markerStart >= 0
            ? current.slice(0, markerStart) + entry + current.slice(replacementEnd)
            : `${current.trimEnd()}\n\n${entry}`;
        await writeFile(indexPath, `${updated.trimEnd()}\n`);
        const result = { status: 'success', framework: 'speckit', featureDirectory: normalizedFeature, indexPath } as const;
        process.stdout.write(json ? `${JSON.stringify(result)}\n` : `Finalized SpecKit feature ${normalizedFeature}\n`);
        return result;
    } catch {
        reportWarning(`unable to update SpecKit context index: ${indexPath}`);
    }
}
