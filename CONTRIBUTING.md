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

Architecture Guard has two supported delivery channels:

- `orchestration/` is authoritative for standalone installation and all cross-SDD behavior. It must use adapter tokens rather than hard-coded Spec Kit or OpenSpec commands.
- `commands/` is the self-contained compatibility surface registered by `extension.yml` for the legacy Spec Kit extension. It may use Spec Kit-native paths and commands, but must preserve the same safety, approval, severity, memory, and governance rules as its orchestration counterpart.

The files intentionally are not generated from one another: standalone prompts load adapters at runtime, while legacy extension prompts must remain self-contained.

When modifying a prompt:

1. Make cross-SDD behavior changes in `orchestration/` first.
2. Apply shared rule or safety changes to the same-name file in `commands/` without copying adapter placeholders into the legacy prompt.
3. Keep SDD-specific invocation details in `adapters/`; only the legacy command may encode Spec Kit-native details directly.
4. Run `npm test` to verify both delivery channels remain complete.
5. If you add a command, add both prompt files and register the legacy file in `extension.yml` under `provides.commands`.

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
