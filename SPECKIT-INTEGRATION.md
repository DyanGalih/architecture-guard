# Spec Kit + Architecture Guard: Integration Guide

Architecture Guard supports Spec Kit in two ways:

1. **Standalone installation** for new projects and projects that want agent-native `ag-*` commands.
2. **Legacy Spec Kit extension installation** for existing projects that already use `extension.yml` and `/speckit.*` commands.

## Standalone Installation

From the project root:

```bash
npx architecture-guard init . --agent opencode --framework spec-kit --commands all
```

The installer adds:

- Agent-native governance commands such as `ag-governed-spec`, `ag-review-artifacts`, and `ag-verify`.
- `adapters/resolve.md` and `adapters/spec-kit.md`.
- Runtime resources under `.architecture-guard/`.
- Optional governance guidance in `AGENTS.md`.

The adapter selected by `architecture-guard init --framework` is persisted in `.architecture-guard/selected-adapter` and is authoritative at command time. If the project switches SDD tools, rerun init with the new framework or use an explicit `--adapter` override for a single command.

## Spec Kit Artifact Mapping

| Architecture Guard concept | Spec Kit artifact |
|---|---|
| Constitution | `.specify/memory/constitution.md` |
| Architecture rules | `.specify/memory/architecture_constitution.md` |
| Security rules | `.specify/memory/security_constitution.md` |
| Specification | `specs/{feature}/spec.md` |
| Plan | `specs/{feature}/plan.md` |
| Tasks | `specs/{feature}/tasks.md` |
| Security constraints | `specs/{feature}/security-constraints.md` |

## Recommended Flow

```text
ag-governed-discover   (optional)
  -> ag-governed-spec
  -> ag-governed-plan
  -> ag-governed-tasks
  -> ag-governed-implement
  -> ag-verify
```

Use `ag-governed-delivery` when you want the plan-to-tasks stages to resume automatically from the first invalid or stale artifact.

Architecture Guard fills gaps around Spec Kit rather than replacing its native commands:

- Architecture and security review around plans and tasks.
- Task-to-code verification after implementation.
- DRY and repository hygiene checks.
- Refactor task generation for confirmed architecture drift.

## Native Extension Compatibility

Existing Spec Kit projects can continue using the `extension.yml` installation and `/speckit.ag-*` commands. This path is maintained for compatibility with the legacy extension workflow; standalone installation is preferred for new projects.

The extension hooks are optional. In standalone mode, the agent-native command preambles explicitly instruct the agent when to run the equivalent governance checks.

## Detection and Overrides

Spec Kit is detected from `.specify/`. If both `.specify/` and `openspec/config.yaml` exist, Architecture Guard asks which adapter to use. Use an explicit adapter override when the project intentionally contains both workflows:

```text
--adapter spec-kit
```

See [`adapters/spec-kit.md`](adapters/spec-kit.md) for the complete path and command map.
