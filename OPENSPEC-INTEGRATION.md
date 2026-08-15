# OpenSpec + Architecture Guard: Integration Guide

Architecture Guard provides architecture governance that works alongside OpenSpec. This guide explains how the two systems interact.

## How They Fit Together

OpenSpec manages the SDD workflow lifecycle: propose, spec, design, tasks, apply, archive.
Architecture Guard adds governance checks around and between those steps.

```
OpenSpec flow:
  propose → spec → design → tasks → apply → archive
                ↑         ↑         ↑
          architecture  plan      implement
          review       review    verify

Architecture Guard runs at each intersection:
  - After spec: boundary check, DRY drift detection
  - After design: architecture review, violation detection
  - During apply: task-by-task hygiene check
  - After archive: final architecture verify
```

## Installation

```bash
npx architecture-guard
# or
npm install -g architecture-guard
architecture-guard
```

Then select:
1. **AI agent**: Your IDE tool (OpenCode, Claude Code, etc.)
2. **SDD tool**: `openspec`
3. **Commands**: Select desired governance commands

### What Gets Installed

- Command files in your agent's commands/skills directory
- `adapters/resolve.md` and `adapters/openspec.md` in project root
- AGENTS.md governance rules (optional)

## Key Differences From SpecKit

| Feature | SpecKit + ArchGuard | OpenSpec + ArchGuard |
|---|---|---|
| Spec creation | `/speckit.specify` | `openspec new change` + `openspec instructions specs` |
| Plan artifact | `specs/{feature}/plan.md` | `openspec/changes/{change}/design.md` |
| Tasks artifact | `specs/{feature}/tasks.md` | `openspec/changes/{change}/tasks.md` |
| Clarify step | `/speckit.clarify` | Inline clarification loop |
| Branch creation | Automatic | Offered as gap fill |
| Architecture verify | Separate command | Runs after `openspec archive` |

## Gap Fill Actions

OpenSpec does not automatically:

1. **Create git branches** — Architecture Guard offers `git checkout -b` before `openspec new change`.
2. **Clarify specifications** — After spec creation, Architecture Guard offers interactive clarifications.
3. **Verify task-to-code evidence** — After archive, Architecture Guard reads tasks.md checkboxes and validates against code.
4. **Detect DRY violations** — Architecture Guard scans for duplicated business rules across modules.

## SDD Adapter Resolution

Architecture Guard uses `openspec` when `.architecture-guard/selected-adapter` contains `openspec`. The `openspec/config.yaml` marker is only a fallback when no adapter has been persisted. Use `--adapter openspec` for a one-command override.

## Agent Files

The OpenSpec adapter (`adapters/openspec.md`) also provides a Command Map for all OpenSpec CLI invocations. This lets Architecture Guard orchestrate `openspec *` commands naturally.
