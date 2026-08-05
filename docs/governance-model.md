# Governance Model

This document explains how Architecture Guard separates governance, architecture, and execution behavior.

## Layered Constitution Model

Architecture Guard separates engineering governance and architecture enforcement into different documents.

| Artifact | Purpose | Location |
| --- | --- | --- |
| `constitution.md` | Engineering philosophy and high-level governance | `.specify/memory/constitution.md` |
| `architecture_constitution.md` | Layer boundaries, module ownership, and architectural rules | `.specify/memory/architecture_constitution.md` |
| `security_constitution.md` | Repository-wide security rules and trust boundaries | `.specify/memory/security_constitution.md` |

Architecture Guard primarily validates against:

```text
.specify/memory/architecture_constitution.md
```

See the Quick Start in the README for the brownfield and greenfield entrypoints.

This separation prevents implementation-level architecture rules from polluting broader engineering governance.

## Non-Blocking Governance

Architecture Guard is intentionally non-blocking by default.

Violations are turned into:

- refactor tasks
- migration tasks
- architecture proposals

Only rules explicitly marked as `P0` in the architecture constitution should block delivery.

## Sub-Agent Delegation Model

Throughout Architecture Guard commands, complex analysis steps can offer optional sub-agent delegation for workload distribution.

### How It Works

When a command encounters analysis marked `[OPTIONAL SUB-AGENT DELEGATION]`:

- the model assesses complexity such as file count, line count, and decision count
- it decides between inline execution or delegation to a sub-agent
- explicit `--inline` or `--delegate` flags override the decision

### Decision Criteria

| Scenario | Decision |
| --- | --- |
| Fewer than 50 files and fewer than 10,000 lines | Inline execution |
| 50 files or more, or 10,000 lines or more | Sub-agent execution |
| 20 or more memory documents | Sub-agent execution |

### Override Flags

```bash
ag-review --inline
/ag-governed-plan --delegate
```

### Where Delegation Appears

- `ag-review` Step 7b — SonarLint code quality scanning
- `governed-plan.md` Step 2 — Memory synthesis for planning
- `governed-tasks.md` Step 2 — Memory synthesis for task generation
- `governed-implement.md` Step 2 — Memory synthesis for implementation

This keeps typical PRs fast while still allowing large refactors to distribute work more thoroughly.
