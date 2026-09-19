import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { listCategoryResources, resolveResource } from './resolve';

export interface HygieneOptions {
  target?: string;
  json?: boolean;
  rules?: string;
}

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'WARNING' | 'INFO';
type ExecutionMode = 'builtin' | 'manual';

interface ProjectFile {
  relativePath: string;
  absolutePath: string;
  content: string | null;
}

interface HygieneRule {
  identifier: string;
  name: string;
  defaultSeverity: Severity;
  recommendation: string;
  sourcePath: string;
  source: 'local' | 'bundled';
  execution: ExecutionMode;
  content: string;
}

interface RawFinding {
  relativePath: string;
  line?: number;
  message: string;
}

interface HygieneFinding extends RawFinding {
  rule: string;
  severity: Severity;
  blocking: boolean;
  recommendation: string;
}

interface HygienePolicy {
  enabled: boolean;
  failOn: string[];
  warnOn: string[];
  ignore: {
    paths: string[];
    files: string[];
    patterns: string[];
  };
}

export interface HygieneReport {
  status: 'passed' | 'failed' | 'degraded' | 'disabled';
  target: string;
  policy: {
    enabled: boolean;
    failOn: string[];
    warnOn: string[];
  };
  rules: Array<{
    identifier: string;
    sourcePath: string;
    source: 'local' | 'bundled';
    execution: ExecutionMode;
    severity: Severity;
    blocking: boolean;
    findings: number;
  }>;
  findings: HygieneFinding[];
  manualRules: string[];
  counts: {
    loadedRules: number;
    executedRules: number;
    manualRules: number;
    findings: number;
    blocking: number;
  };
}

const SOURCE_EXTENSIONS = new Set([
  '.c', '.cc', '.cpp', '.cs', '.go', '.h', '.hpp', '.java', '.js', '.jsx',
  '.kt', '.php', '.py', '.rb', '.rs', '.scss', '.sh', '.sql', '.swift',
  '.ts', '.tsx', '.vue', '.xml', '.yaml', '.yml'
]);

const TEXT_EXTENSIONS = new Set([
  ...SOURCE_EXTENSIONS,
  '.json', '.md', '.mdx', '.toml', '.txt', '.html', '.css', '.graphql'
]);

const DEFAULT_IGNORED_PATHS = ['.git/**', 'node_modules/**'];

const SeverityDetectors: Record<string, (rule: HygieneRule, files: ProjectFile[]) => RawFinding[]> = {};

function isSourceFile(file: ProjectFile) {
  return SOURCE_EXTENSIONS.has(path.extname(file.relativePath).toLowerCase());
}

function readableContent(file: ProjectFile) {
  return file.content !== null;
}

function lineMatches(file: ProjectFile, pattern: RegExp, message: string): RawFinding[] {
  if (!readableContent(file)) return [];
  const findings: RawFinding[] = [];
  const lines = file.content!.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      findings.push({ relativePath: file.relativePath, line: index + 1, message });
    }
    pattern.lastIndex = 0;
  });
  return findings;
}

function globMatches(value: string, pattern: string) {
  let expression = '^';
  const specialCharacters = '.+^$()|[]\\';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === '*') {
      if (pattern[index + 1] === '*') {
        if (pattern[index + 2] === '/') {
          expression += '(?:.*/)?';
          index += 2;
        } else {
          expression += '.*';
          index += 1;
        }
      } else {
        expression += '[^/]*';
      }
    } else if (char === '?') {
      expression += '[^/]';
    } else if (specialCharacters.includes(char)) {
      expression += '\\' + char;
    } else {
      expression += char;
    }
  }
  return new RegExp(expression + '$').test(value);
}

function ignored(relativePath: string, policy: HygienePolicy) {
  const normalized = relativePath.split(path.sep).join('/');
  const candidates = [
    ...DEFAULT_IGNORED_PATHS,
    ...policy.ignore.paths,
    ...policy.ignore.files,
    ...policy.ignore.patterns,
  ];
  return candidates.some(pattern => {
    const normalizedPattern = String(pattern).replace(/\\/g, '/');
    return globMatches(normalized, normalizedPattern) || globMatches(path.posix.basename(normalized), normalizedPattern);
  });
}

function walkFiles(root: string, current: string, output: ProjectFile[], policy: HygienePolicy) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolutePath = path.join(current, entry.name);
    const relativePath = path.relative(root, absolutePath);
    if (ignored(relativePath, policy)) continue;
    if (entry.isDirectory()) {
      walkFiles(root, absolutePath, output, policy);
      continue;
    }
    if (!entry.isFile()) continue;
    output.push({
      relativePath,
      absolutePath,
      content: TEXT_EXTENSIONS.has(path.extname(relativePath).toLowerCase())
        ? readText(absolutePath)
        : null,
    });
  }
}

function gitFiles(root: string, policy: HygienePolicy): ProjectFile[] | null {
  try {
    const output = execFileSync(
      'git',
      ['-C', root, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    return output
      .split('\0')
      .filter(Boolean)
      .map(relativePath => ({
        relativePath,
        absolutePath: path.join(root, relativePath),
        content: TEXT_EXTENSIONS.has(path.extname(relativePath).toLowerCase())
          ? readText(path.join(root, relativePath))
          : null,
      }))
      .filter(file => !ignored(file.relativePath, policy));
  } catch {
    return null;
  }
}

function readText(filePath: string) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 2 * 1024 * 1024) return null;
    const content = fs.readFileSync(filePath);
    if (content.includes(0)) return null;
    return content.toString('utf8');
  } catch {
    return null;
  }
}

function projectFiles(root: string, policy: HygienePolicy) {
  return gitFiles(root, policy) ?? (() => {
    const files: ProjectFile[] = [];
    walkFiles(root, root, files, policy);
    return files;
  })();
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item));
}

function normalizedArray(value: unknown): string[] {
  return stringArray(value).map(item => item.toLowerCase());
}

function parsePolicyContent(content: string): any | null {
  let parsed: any = null;
  try {
    parsed = parseYaml(content) ?? {};
  } catch {
    // Markdown constitution files are handled by the embedded-block fallback below.
  }

  const directPolicy = parsed?.repository_hygiene ?? (
    parsed && (parsed.enabled !== undefined || parsed.fail_on || parsed.warn_on || parsed.ignore)
      ? parsed
      : null
  );
  if (directPolicy) return directPolicy;

  const lines = content.split(/\r?\n/);
  const policyLine = lines.findIndex(line => /^\s*repository_hygiene:\s*$/.test(line));
  if (policyLine < 0) return null;
  const baseIndent = lines[policyLine].match(/^\s*/)?.[0].length ?? 0;
  const body: string[] = [];
  for (let index = policyLine + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '') {
      body.push(line);
      continue;
    }
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent <= baseIndent) break;
    body.push(line.slice(baseIndent));
  }
  try {
    return parseYaml(['repository_hygiene:', ...body].join('\n')).repository_hygiene ?? null;
  } catch {
    return null;
  }
}

function loadPolicy(root: string): HygienePolicy {
  const candidates = [
    path.join(root, '.architecture-guard', 'config.yml'),
    path.join(root, '.architecture-guard', 'config.yaml'),
    path.join(root, '.specify', 'config', 'repository_hygiene.yml'),
    path.join(root, '.specify', 'config', 'repository_hygiene.yaml'),
    path.join(root, 'openspec', 'config.yaml'),
    path.join(root, '.specify', 'memory', 'architecture_constitution.md'),
    path.join(root, '.specify', 'memory', 'constitution.md'),
  ];

  let rawPolicy: any = {};
  for (const candidate of candidates) {
    const content = readText(candidate);
    if (!content) continue;
    const candidatePolicy = parsePolicyContent(content);
    if (candidatePolicy) {
      rawPolicy = candidatePolicy;
      break;
    }
  }

  const ignore = rawPolicy.ignore ?? {};
  return {
    enabled: rawPolicy.enabled !== false,
    failOn: normalizedArray(rawPolicy.fail_on),
    warnOn: normalizedArray(rawPolicy.warn_on),
    ignore: {
      paths: stringArray(ignore.paths),
      files: stringArray(ignore.files),
      patterns: stringArray(ignore.patterns),
    },
  };
}
function parseRule(name: string, content: string, sourcePath: string, source: 'local' | 'bundled'): HygieneRule {
  const lines = content.split(/\r?\n/);
  const title = lines.find(line => line.startsWith('# Rule:'))?.replace(/^# Rule:\s*/, '').trim() || name;
  const identifierLine = lines.find(line => line.startsWith('**Identifier**:'));
  const identifier = identifierLine?.match(/\x60([^\x60]+)\x60/)?.[1] || name.replace(/\.[^.]+$/, '');
  const severityLine = lines.find(line => line.startsWith('**Default Severity**:')) || '';
  const severityText = severityLine.match(/Critical|High|Medium|Low|Warning|Info/i)?.[0] || 'Info';
  const defaultSeverity = severityText.toUpperCase() as Severity;
  const recommendation = lines.find(line => line.startsWith('**Recommendation**:'))
    ?.replace(/^\*\*Recommendation\*\*:\s*/, '').trim() || 'Review the finding.';
  return {
    identifier,
    name: title,
    defaultSeverity,
    recommendation,
    sourcePath,
    source,
    execution: SeverityDetectors[identifier] ? 'builtin' : 'manual',
    content,
  };
}

function effectiveSeverity(rule: HygieneRule, policy: HygienePolicy): Severity {
  const key = rule.defaultSeverity.toLowerCase();
  if (policy.failOn.includes(key) || policy.failOn.includes(rule.identifier.toLowerCase())) {
    return 'CRITICAL';
  }
  if (policy.warnOn.includes(key) || policy.warnOn.includes(rule.identifier.toLowerCase())) {
    return 'WARNING';
  }
  return rule.defaultSeverity;
}

function applyFindingPolicy(rule: HygieneRule, finding: RawFinding, policy: HygienePolicy): HygieneFinding {
  const severity = effectiveSeverity(rule, policy);
  return {
    ...finding,
    rule: rule.identifier,
    severity,
    blocking: severity === 'CRITICAL',
    recommendation: rule.recommendation,
  };
}

SeverityDetectors['temporary-files'] = (_rule, files) => files
  .filter(file => /\.(?:tmp|bak|old|orig|rej|swp|temp)$/i.test(file.relativePath)
    || file.relativePath.split('/').some(part => /^(?:tmp|temp|scratch|playground|sandbox)$/i.test(part)))
  .map(file => ({ relativePath: file.relativePath, message: 'Temporary file or directory detected.' }));

SeverityDetectors['ai-scratch-files'] = (_rule, files) => files
  .filter(file => /(?:-copy|-final|^old[-_.]|test\d+|draft|prototype)/i.test(path.basename(file.relativePath)))
  .map(file => ({ relativePath: file.relativePath, message: 'AI scratch or draft filename detected.' }));

SeverityDetectors['debug-artifacts'] = (_rule, files) => files.flatMap(file => {
  if (/debug\.log$/i.test(file.relativePath)) {
    return [{ relativePath: file.relativePath, message: 'Debug output file detected.' }];
  }
  if (!isSourceFile(file)) return [];
  return lineMatches(
    file,
    /\bconsole\.(?:log|debug|info|warn|error)\s*\(|\b(?:print|println|var_dump|dd|dump)\s*\(|\bSystem\.out\.println\s*\(/,
    'Debug output statement detected.'
  );
});

SeverityDetectors['empty-files'] = (_rule, files) => files
  .filter(file => isSourceFile(file) && readableContent(file) && !file.content!.trim())
  .map(file => ({ relativePath: file.relativePath, message: 'Source file is empty.' }));

SeverityDetectors['generated-artifacts'] = (_rule, files) => files
  .filter(file => /^(?:dist|build|out|coverage|\.cache)(?:\/|$)/i.test(file.relativePath)
    || /\.(?:min\.js|map)$/i.test(file.relativePath))
  .map(file => ({ relativePath: file.relativePath, message: 'Generated artifact detected.' }));

SeverityDetectors['todo-comments'] = (_rule, files) => files.flatMap(file => {
  if (!readableContent(file)) return [];
  return lineMatches(file, /\b(?:TODO|FIXME|HACK|TEMP|XXX)\b/i, 'Unresolved marker detected.');
});

SeverityDetectors['commented-out-code'] = (_rule, files) => files.flatMap(file => {
  if (!isSourceFile(file) || !readableContent(file)) return [];
  return lineMatches(
    file,
    /^\s*(?:\/\/|#|\/\*|\*)\s*(?:function|class|if|for|while|return|const|let|var|import|export|def)\b/,
    'Commented-out code pattern detected.'
  );
});

SeverityDetectors['duplicate-experimental-files'] = (_rule, files) => {
  const groups = new Map<string, ProjectFile[]>();
  for (const file of files) {
    const extension = path.extname(file.relativePath);
    const stem = path.basename(file.relativePath, extension)
      .replace(/(?:[_-](?:new|v\d+|backup|alt|copy))$/i, '');
    const key = path.join(path.dirname(file.relativePath), stem) + extension;
    const group = groups.get(key) ?? [];
    group.push(file);
    groups.set(key, group);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .flatMap(([, group]) => group.map(file => ({
      relativePath: file.relativePath,
      message: 'Experimental duplicate filename group detected.',
    })));
};

SeverityDetectors['duplicate-business-logic'] = (_rule, files) => {
  const groups = new Map<string, ProjectFile[]>();
  for (const file of files) {
    if (!isSourceFile(file) || !readableContent(file)) continue;
    const normalized = file.content!.replace(/\/\*[\s\S]*?\*\/|\/\/.*|#.*|\s+/g, ' ').trim();
    if (normalized.length < 120) continue;
    const group = groups.get(normalized) ?? [];
    group.push(file);
    groups.set(normalized, group);
  }
  return [...groups.values()]
    .filter(group => group.length > 1)
    .flatMap(group => group.map(file => ({
      relativePath: file.relativePath,
      message: 'Identical normalized source logic appears in multiple files.',
    })));
};

SeverityDetectors['deprecated-and-dangerous-code'] = (_rule, files) => {
  const patterns: Array<[RegExp, string]> = [
    [/new\s+Buffer\s*\(/, 'Deprecated Buffer constructor detected.'],
    [/\b(?:eval|new\s+Function)\s*\(/, 'Dynamic code execution detected.'],
    [/\b(?:unserialize|create_function|each|mysql_query|mysql_connect)\s*\(/, 'Deprecated or unsafe API detected.'],
    [/\b(?:md5|sha1)\s*\(/, 'Weak hashing API detected.'],
    [/\bMath\.random\s*\(/, 'Insecure random source detected.'],
    [/\b(?:document\.write|fs\.exists|substr)\s*\(/, 'Deprecated or unsafe API detected.'],
  ];
  return files.flatMap(file => {
    if (!isSourceFile(file) || !readableContent(file)) return [];
    return patterns.flatMap(([pattern, message]) => lineMatches(file, pattern, message));
  });
};

export function scanHygiene(options: HygieneOptions = {}): HygieneReport {
  const target = path.resolve(options.target || process.cwd());
  const policy = loadPolicy(target);
  const names = listCategoryResources('hygiene-rules', { target });
  const requested = options.rules
    ? new Set(options.rules.split(',').map(value => value.trim().toLowerCase()).filter(Boolean))
    : null;
  const selectedNames = requested
    ? names.filter(name => requested.has(name.toLowerCase()) || requested.has(name.replace(/\.[^.]+$/, '').toLowerCase()))
    : names;

  const files = projectFiles(target, policy);
  const rules = selectedNames.map(name => {
    const resource = resolveResource('hygiene-rules', name, { target });
    return parseRule(name, resource.content, resource.path, resource.source);
  });

  if (!policy.enabled) {
    return {
      status: 'disabled',
      target,
      policy: { enabled: false, failOn: policy.failOn, warnOn: policy.warnOn },
      rules: rules.map(rule => ({
        identifier: rule.identifier,
        sourcePath: rule.sourcePath,
        source: rule.source,
        execution: rule.execution,
        severity: effectiveSeverity(rule, policy),
        blocking: false,
        findings: 0,
      })),
      findings: [],
      manualRules: rules.filter(rule => rule.execution === 'manual').map(rule => rule.identifier),
      counts: {
        loadedRules: rules.length,
        executedRules: rules.filter(rule => rule.execution === 'builtin').length,
        manualRules: rules.filter(rule => rule.execution === 'manual').length,
        findings: 0,
        blocking: 0,
      },
    };
  }

  const findings = rules.flatMap(rule => {
    const detector = SeverityDetectors[rule.identifier];
    if (!detector) return [];
    return detector(rule, files).map(finding => applyFindingPolicy(rule, finding, policy));
  });
  const uniqueFindings = [...new Map(
    findings.map(finding => [
      [finding.rule, finding.relativePath, finding.line ?? 0, finding.message].join('\0'),
      finding,
    ])
  ).values()];
  const manualRules = rules.filter(rule => rule.execution === 'manual').map(rule => rule.identifier);
  const blocking = uniqueFindings.filter(finding => finding.blocking).length;

  return {
    status: blocking > 0 ? 'failed' : manualRules.length > 0 ? 'degraded' : 'passed',
    target,
    policy: { enabled: true, failOn: policy.failOn, warnOn: policy.warnOn },
    rules: rules.map(rule => {
      const ruleFindings = uniqueFindings.filter(finding => finding.rule === rule.identifier);
      return {
        identifier: rule.identifier,
        sourcePath: rule.sourcePath,
        source: rule.source,
        execution: rule.execution,
        severity: effectiveSeverity(rule, policy),
        blocking: ruleFindings.some(finding => finding.blocking),
        findings: ruleFindings.length,
      };
    }),
    findings: uniqueFindings,
    manualRules,
    counts: {
      loadedRules: rules.length,
      executedRules: rules.filter(rule => rule.execution === 'builtin').length,
      manualRules: manualRules.length,
      findings: uniqueFindings.length,
      blocking,
    },
  };
}

function humanReport(report: HygieneReport) {
  const lines = [
    'Repository Hygiene: ' + report.status.toUpperCase(),
    'Target: ' + report.target,
    'Rules loaded: ' + report.counts.loadedRules,
    'Rules executed: ' + report.counts.executedRules,
    'Manual rules: ' + report.counts.manualRules,
    'Findings: ' + report.counts.findings + ' (blocking: ' + report.counts.blocking + ')',
  ];
  for (const finding of report.findings) {
    const location = finding.relativePath + (finding.line ? ':' + finding.line : '');
    lines.push('[' + finding.severity + '] ' + finding.rule + ' ' + location + ' - ' + finding.message);
  }
  if (report.manualRules.length > 0) {
    lines.push('Manual review required: ' + report.manualRules.join(', '));
  }
  return lines.join('\n') + '\n';
}

export async function runHygiene(options: HygieneOptions = {}) {
  try {
    const report = scanHygiene(options);
    if (options.json) {
      process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    } else {
      process.stdout.write(humanReport(report));
    }
    if (report.status === 'failed') process.exitCode = 1;
    return report;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write('Error: ' + message + '\n');
    process.exitCode = 1;
    return null;
  }
}
