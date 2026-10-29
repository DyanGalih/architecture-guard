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

## Host Agent Execution

The canonical `agent_execution` template defines three modes: sequential (default), read-only subagents, and coordinated implementation. Coordinated implementation requires explicit selection for the current run; installing roles does not activate it. Callable host capabilities and session policy govern every delegation. Claude keeps its native Agent Teams flag; Codex does not require Claude settings.

| Work | Delegation threshold when permitted |
| --- | --- |
| Review analysis | 15 changed files or 500 changed lines |
| Memory synthesis | 20 relevant memory results or 15 relevant active decision documents |
| Independent convergence/final review | Prefer a fresh reviewer regardless of size |

Below the thresholds execute inline. Explicit inline/delegate preferences affect thresholds only; they cannot override authorization, host capabilities, required permissions, or read-only constraints. These are skill arguments when the host supports them, not standalone CLI flags. A fresh reviewer never recursively delegates the same complete scope.

Handoffs include the workspace, owning repository, adapter/change, artifact paths, trusted rule sources, constraints, approval scope, and expected evidence; reviews also need changed files, review root, and destination base. The lead assigns files before parallel implementation, serializes overlaps, respects concurrency limits, and merges findings. Unavailable external Security Review remains unavailable.

Context is reused only while current content and trust roots match. Context loss requires reloading; a missing memory store uses repository fallback without repeated identical probes or implicit initialization. Caller approval is reusable only for the identical action, phase, exact targets, and repository. Distinct human gates, expanded scope, memory writes, and external effects still require approval.
