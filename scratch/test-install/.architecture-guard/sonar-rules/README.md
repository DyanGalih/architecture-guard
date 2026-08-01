# SonarLint Rules Bundle

This directory contains the bundled SonarLint rules used by `architecture-review` command during code quality scanning phase (Step 7b).
The bundle is repository-native, not VS Code-specific, so any IDE or CLI that can read the repository can participate in the same scan.
When this extension is installed into a project, the same bundle is available at `.specify/extensions/architecture-guard/.github/sonar-rules/`.

## Purpose

- **Offline access**: Rules are committed to git; no network required during review
- **Deterministic results**: All team members use identical rule set
- **Version control**: Rule changes are visible in git history
- **Fallback**: If SonarQube server unavailable, use these rules

## Files

- `sonarlint-rules.json` — Architecture-relevant rule set (template rules provided; regenerate with CLI)
- `rules-manifest.json` — Metadata (version, date, language support, architecture rule count)
- `README.md` — This file

## Initial Bundle

The initial `sonarlint-rules.json` contains **18 representative architecture-relevant rules** covering:
- Brain overload (high complexity, oversized functions/classes)
- Coupling/dependencies (circular deps, tight coupling, public fields)
- Structure (encapsulation, boundaries, naming consistency)
- Performance anti-patterns (common architectural misuse)

**These are template/example rules**, formatted as they would appear from SonarLint CLI output. They serve as working examples for the MVP. You can customize or replace them by:
1. Running the extraction script to use real SonarLint CLI rules
2. Manually editing to match your project's needs

## Updating Rules with Real SonarLint CLI

When ready, regenerate rules from actual SonarLint CLI (quarterly recommended):

```bash
# From repository root
./scripts/bash/extract-sonar-rules.sh --commit
```

This will:
1. Check for `sonarlint` CLI (`npm install -g sonarlint` if needed)
2. Extract all available rules with `sonarlint --list-all-rules --format=json`
3. Filter for architecture-relevant tags (coupling, complexity, structure, dependency, performance)
4. Replace `sonarlint-rules.json` with actual extracted rules
5. Update `rules-manifest.json` with version info
6. Auto-commit if changes detected

Commit the diff to track what changed in SonarLint:

```bash
git add .github/sonar-rules/
git commit -m "chore: update SonarLint rules bundle"
```

## Customizing Rules Locally

You can also manually edit `sonarlint-rules.json` to:
- Remove rules not relevant to your project
- Reorder by severity or frequency
- Add custom rule mappings
- Document why each rule matters for your architecture

## Architecture-Relevant Rule Tags

The extraction script filters for these tags:

- `brain-overload` — Function/class complexity (indicates untested/hidden boundaries)
- `complexity` — Cyclomatic complexity (signals module coupling or oversized scope)
- `dependency` — Dependency structure (detects cross-layer coupling)
- `structure` — Code organization (indicators of boundary erosion)
- `performance` — Performance anti-patterns (may signal architectural misuse)

Pure style rules (formatting, naming conventions) are excluded.

## Usage in architecture-review

The `architecture-review` command Step 7b loads rules from this bundle and:

1. Scans changed files with loaded rules
2. Generates violations report
3. Cross-correlates with architecture violations (suppresses duplicates)
4. Produces combined output: "Architecture Violations" + "SonarLint Findings"

## SonarQube Server Integration (Future)

When SonarQube server integration is added (Phase 3b):
- Init process will ask for SonarQube URL + token
- At review time: Try server API first → fall back to CLI rules if unavailable
- This bundle remains as permanent fallback
