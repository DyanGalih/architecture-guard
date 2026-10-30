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
- All adapters under `.architecture-guard/adapters/` (resolution preamble, built-in adapters, and any custom adapters you add).
- Lean mode resolves runtime resources through the `architecture-guard` CLI; `--vendor` copies them under `.architecture-guard/`.
- A managed Architecture Guard section in `AGENTS.md`.

The adapter selected by `architecture-guard init --framework` is persisted in `.architecture-guard/selected-adapter` and is authoritative at command time. The `--adapter` value shown in installed prompts is a one-command prompt input, not an installer flag. If the project switches SDD tools, rerun init with the new framework.

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

Existing Spec Kit projects can continue using the `extension.yml` installation and `/speckit.architecture-guard.ag-*` commands (for example `/speckit.architecture-guard.ag-governed-plan`). This path is maintained for compatibility with the legacy extension workflow; standalone installation is preferred for new projects.

The extension hooks are optional. In standalone mode, the agent-native command preambles explicitly instruct the agent when to run the equivalent governance checks.

The legacy channel receives safety and breakage fixes, while new features ship in the standalone channel. Its verifier covers the active feature and does not accept `base=<ref>` or apply whole-branch change checks. Its final workflow reports those checks as `Unavailable`; use standalone `ag-verify base=<destination branch>` or `ag-review-pr` for that coverage. Jira discovery story sets and governance suggestions are standalone features.

`ag-governed-backlog` is available through the standalone installer, including for Spec Kit projects; it has no legacy `/speckit.architecture-guard.*` command. Both channels' artifact review commands support read-only premise grounding against the destination branch. See the [backlog queue](docs/workflows.md#backlog-queue) and [artifact grounding reference](docs/reference-manual.md#artifact-premise-grounding).

The standalone Spec Kit adapter archives by retaining feature artifacts in `specs/{feature}/` and updating `specs/system_context.md`. Later feedback reads the full retained specification, using the index only to locate it. Archived artifacts stay read-only even at their original paths; requirement changes go to a separately specified follow-up change.

## Detection and Overrides

This section applies to standalone installs only. The legacy `extension.yml` commands are self-contained, use Spec Kit paths directly, and never load SDD adapters or accept `--adapter`.

In a standalone install, use an explicit adapter override in the installed command when the project intentionally contains both workflows:

```text
--adapter spec-kit
```

See [`adapters/spec-kit.md`](adapters/spec-kit.md) for the complete path and command map.
