# Reference Manual

This document collects setup, commands, installation, and validation details.

## Prerequisites

Architecture Guard depends on architecture standards.

Without architecture rules, the orchestrator has nothing meaningful to validate against.

## Validate Your Setup

Before running governed workflows, verify prerequisites with the included setup validator:

```bash
npx architecture-guard validate-setup
```

```powershell
pnpx architecture-guard validate-setup
```

The validator checks constitution files, Spec Kit structure, optional extensions, optimizer status, and source directories. It exits non-zero when blocking errors are present, which makes it safe to use in CI.

## Initialize Your Constitutions

Run:

```text
/ag-init
```

This command can:

- initialize constitutions
- refine existing constitutions
- split governance and architecture rules
- detect duplicated architecture standards
- generate architecture enforcement rules

It may generate:

```text
.specify/memory/constitution.md
.specify/memory/architecture_constitution.md
```

## What the Initializer Defines

### Governance Standards

Examples:

- testing expectations
- documentation standards
- review policies
- engineering philosophy

### Architecture Standards

Examples:

- business logic placement
- validation boundaries
- response contracts
- module ownership
- async boundaries
- layering rules

## Architecture Evolution Support

The initializer also supports:

- constitution refinement
- architecture evolution
- migration planning
- architecture standard extraction

By using explicit markdown files, extensions remain decoupled, and all constraints and decisions are fully reviewable in Git.

## Quick Start

Choose the path that matches the repository state.

### Brownfield Quick Start

Use this path when the repository already contains application code.

1. Install

```text
specify extension add architecture-guard
```

2. Map the existing codebase

```text
/ag-init-brownfield
```

This is the Brownfield Discovery + Verification entrypoint.
If you are specifically cleaning up duplicated logic, follow the [DRY Cleanup Guide](dry-cleanup.md) after the brownfield mapping pass.

3. Run Architecture Workflow

```text
ag-workflow
```

Outputs:

- architecture alignment status
- detected violations with severity and priority
- suggested refactor tasks
- evolution proposals

4. Review Violations and Apply Fixes

```text
ag-apply
```

This injects refactor tasks into `plan.md` and `tasks.md` so the AI has explicit guidance to fix architectural debt while implementing features.

### Greenfield Quick Start

Use this path when the repository is greenfield.

1. Install

```text
specify extension add architecture-guard
```

2. Initialize Constitutions

```text
/ag-init
```

This creates or updates:

- `.specify/memory/constitution.md` - governance and engineering standards
- `.specify/memory/architecture_constitution.md` - architecture rules and boundaries
- `.specify/memory/security_constitution.md` - security standards

3. Run Architecture Workflow

```text
ag-workflow
```

4. Review Violations and Apply Fixes

```text
ag-apply
```

This injects refactor tasks into `plan.md` and `tasks.md` so the AI has explicit guidance to fix architectural debt while implementing features.


## Commands

| Command | Phase | Output | When To Use |
| --- | --- | --- | --- |
| `init-brownfield` | Setup | Current-state baseline, app root detection, boundary map, and brownfield notes | When the repository already contains application code and you need to understand the existing system first |
| `init` | Setup | `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md` | Once at project start; rerun to refine standards |
| `consolidate-specs` | Context maintenance | `specs/system_context.md` | Refresh the compact local fallback used only when Flash-Mem is unavailable or insufficient |
| `governed-discover` | Orchestration | Architecture-aware discovery brief with alignment notes, rejected options, assumptions, and handoff prompt | Use before specification when the feature idea needs discussion against existing architecture constraints |
| `governed-spec` | Orchestration | Specification and Clarification with `flash-mem` synthesis first + security + architecture, plus auto-fix loop | Use when `flash-mem` and Security Review are installed to start from specification |
| `governed-delivery` | Orchestration | Resume governed delivery from an active specification through plan and task generation, with optional memory context, gates, reconciliation, and analysis | Recommended entry point after specification |
| `governed-delivery-team` | Orchestration | Team delivery flow with an approved User Story before planning and task generation | Use when stakeholders need to approve business intent before engineering proceeds |
| `ag-workflow` | General Review | Violations, severity and priority, refactor tasks, evolution proposals | Entry point for end-to-end review; good for dashboards |
| `ag-review-artifacts` | Validation | Validates planning artifacts (spec, plan) against constitution without reading code | After `/specify` or `/plan` |
| `ag-review-implementation` | Validation | Validates implementation codebase against planning artifacts and constitution | After `/implement` |
| `violation-detection` | Detection | Drift summary, boundary violations, module coupling | Focus on specific architecture problems |
| `refactor-generator` | Planning | Refactor task generation | After review; convert violations to non-blocking refactor tasks |
| `ag-apply` | Implementation | After refactor decisions | Inject refactor tasks into `tasks.md` and `plan.md` using the approved review context |
| `ag-verify` | Verification | Implementation verification report with task fulfillment, architecture, and hygiene findings | Final gate after implementation to ensure all tasks are delivered, with cached memory context if available |

### Ponytail Core

All commands load `templates/ponytail_core.md`. The contract applies an ordered YAGNI-to-minimum-code ladder, requires root-cause caller tracing, preserves a correctness and safety floor, and requires a runnable check for non-trivial logic. Framework presets add vocabulary but cannot require a layer or dependency without repository evidence.

See [Framework Presets](presets.md) for the supported built-in frameworks, init interview coverage, review boundaries, guardrails, and custom-preset structure.

# Optimizer-Aware Memory Flow

Architecture Guard integrates with `flash-mem` as the runtime SQLite-backed optimizer to provide high-performance, token-efficient reviews. The legacy `memory-hub` name is reference-only and deprecated.

### Enabling the Optimizer

In your local Spec-Kit project, ensure the optimizer is enabled:

```yaml
# .specify/extensions/memory-md/config.yml
optimizer:
  enabled: true
```

### Benefits

- targeted retrieval: only reads architectural decisions relevant to the current feature
- self-learning: reviews trigger the durable-memory capture alias, and the formal capture flow proposes entries and requests user approval
- lower latency: reduces context window bloat by avoiding massive markdown file reads

| Command | Phase | Optimizer-Aware Output | When To Use |
| --- | --- | --- | --- |
| `governed-discover` | Orchestration | Discovery brief with `flash-mem` synthesis first + architecture-aware discussion + governed-spec handoff | Use when companion extensions are installed and feature ideas should be shaped before specification |
| `governed-spec` | Orchestration | Specification and Clarification with `flash-mem` synthesis first + security + architecture + auto-fix loop | Use when `flash-mem` and Security Review are installed to start from specification |
| `governed-delivery` | Orchestration | Resume governed delivery from an active specification through plan and task generation, with optional memory context, security review, architecture gates, task reconciliation, and analysis | Suggested flow after specification; rerun safely to resume |
| `governed-delivery-team` | Orchestration | Team delivery flow with an approved User Story before planning and task generation | Suggested for stakeholder-reviewed delivery |
| `governed-plan` | Orchestration | Generate and validate a technical plan with optional memory context, Security Review, and Architecture Guard checks | Use when `flash-mem` and Security Review are installed |
| `governed-tasks` | Orchestration | Generate or reconcile implementation tasks, then analyze security, architecture, migration, and refactor coverage | Use when companion extensions are installed |
| `governed-implement` | Orchestration | Execute implementation tasks, then review the result against available security and architecture constraints | Use for end-to-end implementation with governance |

> Use `ag-governed-delivery` as the suggested plan-to-tasks flow. Use `ag-workflow`, `ag-review-artifacts` or `ag-review-implementation` directly for standalone reviews; the individual `ag-governed-plan` and `ag-governed-tasks` commands remain available for targeted recovery.

> `ag-apply` targets `plan.md` and `tasks.md`. If architectural issues are found in the specification stage, refine the specification before generating a technical plan. When `flash-mem` is available, use the cached synthesis and approved review output before writing back.

## Budgeted Architecture Context Retrieval

Create `.specify/config/architecture_guard.yml` from the bundled `templates/architecture_guard_config.yml`:

```yaml
schema_version: "1.0"

context:
  mode: budgeted
  fallback_file: specs/system_context.md
  stale_policy: regenerate
  flash_mem:
    initial_result_limit: 5
    full_entry_limit: 3
```

Missing or invalid configuration preserves targeted Flash-Mem-first behavior. In budgeted mode, commands load mandatory active artifacts and constitutions, query at most five Flash-Mem summaries initially, and expand at most three full entries unless a named conflict requires more. A sufficient Flash-Mem result prevents `system_context.md` from loading.

The fallback is stale when its manifest omits a current spec, lists a missing spec, a source is newer, current artifacts materially conflict, or freshness cannot be established. `regenerate` refreshes it through `consolidate-specs`; `targeted` skips it and opens only sources required for named gaps.

This mode is designed to reduce repeated historical-spec context, not mandatory active-feature context. Verify savings with representative project workflows before describing them as an optimization.

Use the [Budgeted Context Benchmark](context-budget-benchmark.md) for the required fixture profiles, scenarios, measurements, and acceptance criteria.

## Installation

### From Registry

```text
specify extension add architecture-guard
```

### From a Release Artifact (ZIP)

```text
specify extension add architecture-guard --from \
  https://github.com/DyanGalih/architecture-guard/archive/refs/tags/v2.2.2.zip
```

### Global Preset Usage

Built-in presets are documented in [Framework Presets](presets.md). Use a global preset when the built-in adapter does not cover an organization-specific convention or an additional framework.

If you manage multiple projects using the same framework (e.g., Laravel), you can create a global preset and link it to Architecture Guard for greenfield setups.

**Example: Global Laravel Preset**

1. Create your preset somewhere on your system (e.g., `~/.specify/presets/laravel-architecture.md`).
2. Add the Architecture Guard extension and apply the preset URL:

```bash
specify extension add architecture-guard --from \
  https://github.com/DyanGalih/architecture-guard/archive/refs/tags/v2.2.2.zip
```

### From a Local Developer Artifact

```text
specify extension add architecture-guard --dev /path/to/architecture-guard
```

### From GitHub

```text
specify extension add architecture-guard --from \
  https://github.com/DyanGalih/architecture-guard/archive/refs/tags/v2.2.2.zip
```
