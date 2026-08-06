# Contributing to Architecture Guard

Thank you for your interest in contributing!

## Repository Structure

```
extension.yml          ← Extension manifest
commands/               ← Spec Kit command definitions (single source of truth)
scripts/               ← Shell/PowerShell scripts for file detection and maintenance
presets/               ← Framework-specific architecture presets
templates/             ← Templates for reports and artifacts
examples/              ← Example architecture reports
```

## Development Workflow

### Prompt Changes

If you want to modify architecture review rules or detection logic:

1. Update the relevant file in `commands/`. Each prompt file is self-contained with its full rules, steps, and output format.
2. Run `npm run test` or `npx architecture-guard test-install` to verify consistency.
3. If you add a new command, register it in `extension.yml` under `provides.commands`.

### Adding Framework Presets

When adding support for a new framework:

1. Create a new preset in `presets/`.
2. Follow the standard boundary mapping template.
3. Update `commands/init.md` to include the new framework in the interview flow.
4. Update `README.md` framework support list.

### Testing

Run the smoke tests:

```bash
npm run test
```

## Guidelines

- **Self-Contained Prompts**: Every prompt file must carry its full rules, steps, and output format inline. Do not reference external files.
- **Actionable Findings**: Every violation must include severity, location, evidence, and a suggested fix.
- **Non-Blocking by Default**: Findings are reported, not enforced. The `refactor-generator` handles task creation.
- **`flash-mem` Integration**: When project memory exists, use it as context — but never require it. The legacy `memory-hub` name is reference-only.
- **Security Awareness**: If a violation affects trust boundaries, classify it as a `Security-Architecture Conflict`.

## Pull Requests

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Run `npm run test` to verify.
5. Submit a PR with a clear description of what changed and why.

## Release Process

See the Release Checklist in the README for version bump procedures.
