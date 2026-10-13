# Contributing to Architecture Guard

Thank you for your interest in contributing!

## Repository Structure

```
extension.yml          ← Extension manifest
orchestration/          ← Canonical cross-SDD command definitions
commands/               ← Legacy Spec Kit extension command definitions
adapters/               ← SDD-specific path and command mappings
scripts/               ← Shell/PowerShell scripts for file detection and maintenance
presets/               ← Framework-specific architecture presets
templates/             ← Templates for reports and artifacts
examples/              ← Example architecture reports
```

## Development Workflow

### Prompt Changes

Architecture Guard has one primary product and one legacy channel:

- **Standalone orchestration (primary)** — `orchestration/`, `adapters/`, and the CLI installer. It must work for every SDD tool: the built-in Spec Kit, OpenSpec, and generic adapters, and any custom adapter (see `ADAPTERS.md`). All new features are developed and delivered here.
- **Legacy Spec Kit extension (limited support)** — `commands/` registered by `extension.yml`. It only needs to work with Spec Kit. It receives safety and breakage fixes only; do not backport new features, and feature parity with `orchestration/` is not expected.

The files intentionally are not generated from one another: standalone prompts get adapter tokens resolved at install time, while legacy extension prompts must remain self-contained.

When modifying a prompt:

1. Make behavior changes in `orchestration/`. Refer to SDD artifacts and commands through adapter tokens (`{adapter_path:<key>}`, `{adapter_command:<key>}`) rather than hard-coded Spec Kit or OpenSpec paths and commands.
2. Put SDD-specific paths and invocations in the built-in adapters. A new adapter token is a contract change: define it in every built-in adapter, add it to the Required Keys list in `ADAPTERS.md` (the tests check both), and call it out in release notes because custom adapters must add it too.
3. Change `commands/` only to fix a safety issue (for example, a write without approval) or something broken for Spec Kit users. Legacy prompts stay self-contained and must not use adapter tokens.
4. Run `npm test`.
5. If you add a command, add it to `orchestration/` and the installer's `COMMANDS` list. Add a legacy `commands/` file only if Spec Kit extension users need it.

### Adding Framework Presets

When adding support for a new framework:

1. Create a new preset in `presets/`.
2. Follow the standard boundary mapping template.
3. Update `orchestration/init.md` to include the new framework in the interview flow.
4. Update `commands/init.md` only when the framework affects the legacy Spec Kit extension experience.
5. Update `README.md` framework support list.

### Testing

Run the smoke tests:

```bash
npm run test
```

## Guidelines

- **Canonical Orchestration**: Cross-SDD capabilities, adapter contracts, and phase handoffs are defined in `orchestration/`.
- **Legacy Compatibility**: `commands/` remains self-contained for Spec Kit extension installation and must not weaken canonical safety or governance rules.
- **Self-Contained Legacy Prompts**: Every file under `commands/` must carry its full rules, steps, and output format inline.
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
