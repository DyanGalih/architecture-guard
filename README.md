# 🛡️ Architecture Guard

> Continuous architecture governance for AI-assisted development.

[![Version](https://img.shields.io/badge/version-1.15.1-22c55e)](extension.yml)
[![Spec Kit](https://img.shields.io/badge/Spec%20Kit-compatible-2563eb)](https://spec-kit.dev)
[![Non-blocking](https://img.shields.io/badge/style-non--blocking-10b981)](https://spec-kit.dev)
[![Orchestration](https://img.shields.io/badge/role-governance--orchestrator-blue)](https://spec-kit.dev)

**Architecture Guard** is a repository-native governance layer for Spec Kit that helps AI agents follow the architecture rules you already defined, surface DRY and boundary drift early, and keep architecture review visible during delivery instead of waiting until code review.

---

✨ **NEW in v1.12.0: Built-in Pragmatism, DRY, and Hygiene Guards!**  
You no longer need to install separate agent skills for code minimalism, duplicated logic cleanup, or repository cleanliness—Architecture Guard now has them built directly into its orchestrated workflows:
* **Ponytail Core:** Applies one shared decision ladder across discovery, planning, tasks, implementation, refactoring, and review—including root-cause caller tracing, a safety floor, and runnable checks for non-trivial logic. *(Inspired by the [Ponytail Pragmatism Skill](https://github.com/DietrichGebert/ponytail))*
* **DRY Cleanup Guidance:** Helps brownfield projects find duplicated business logic, validation, DTO mapping, and orchestration, then turn them into small refactor tasks instead of copy-paste drift.
* **Brownfield Discovery + Verification:** Maps the current codebase, surfaces architectural drift early, and confirms approved refactors actually made it into the final work.
* **Repository Hygiene Guard:** Automatically detects stray `*-copy.ts` drafts, orphaned code, and debug artifacts before they hit your main branch. [Learn more →](docs/repository-hygiene.md)

---

## Core Value: Architecture Guidance Without Hidden Drift

Architecture Guard uses a layered, reviewable workflow to keep architecture decisions explicit:

| Layer | Focus | What It Prevents |
| :--- | :--- | :--- |
| **Governance** | High-level engineering rules | Loose, inconsistent project standards |
| **Architecture** | Boundaries, ownership, and contracts | Drift between modules and layers |
| **Workflow** | Reviews and refactor generation | Hidden architecture debt |

### Why Developers and Teams Use It:

- architecture decisions stop living only in people’s heads
- drift becomes visible as refactor work instead of silent debt
- smaller models get clearer rules to follow
- architecture checks happen during delivery, not only at review time
- the same ideas work across Laravel, NestJS, Next.js, React Native, Django, and more

### Supported Framework Presets

Architecture Guard includes presets for Django, Express.js, Laravel, NestJS, Next.js, Nuxt, React, React Native, Spring Boot, and Vue. Each preset provides framework-specific initialization questions, boundary mappings, review guidance, and non-enforcement guardrails.

See [Framework Presets](docs/presets.md) for the complete comparison and custom-preset contract.

---

## Why Use the Governed Workflows?

```text
idea or rough request
  → governed-discover
  → governed-spec
  → governed-delivery
  → governed-implement
  → architecture-verify

spec already exists
  → governed-delivery
  → governed-implement
  → architecture-verify
```



Instead of manually chaining the raw Spec Kit commands (`/speckit.plan`, `/speckit.tasks`) and their reviews, use `/speckit.architecture-guard.governed-delivery` as the suggested plan-to-tasks flow. Use `governed-discover` and `governed-spec` before it when the feature still needs discovery or specification work.

Use `governed-discover` when you have an idea, request, or rough problem statement but you do not yet have a stable spec. It is the right first step when:

- you are still shaping the feature and want to explore options
- you need to check the idea against existing architecture before writing a spec
- you want to capture assumptions, risks, and rejected alternatives early
- you are not ready to generate formal plan or task artifacts yet

Skip `governed-discover` when the spec already exists and the only job left is to move through planning and tasks. In that case, go straight to `governed-delivery`.

Using the governed orchestrators simplifies the upper Spec Kit flow by adding automatic layers of safety:
1. **Shift-Left Discovery:** It can shape raw feature ideas through `governed-discover` before a formal specification exists.
2. **Context-Aware:** It automatically queries `flash-mem` first to inject historical architectural decisions before generating any new outputs.
3. **Resumable Execution:** `governed-delivery` validates the plan before generating tasks and resumes from the first missing, stale, or blocked phase instead of recreating valid artifacts.
4. **Analyst Auto-Fix Loops:** Rather than finding out your plan violates architecture at the end, the orchestrators use formal analysis (`/speckit.analyze`). If the analyst detects gaps, missing boundaries, or severities, the orchestrator automatically pauses and offers a loop to clarify and repair the artifacts instantly.
5. **Ponytail Core:** Every phase uses the same ordered decision ladder, root-cause rules, safety floor, and verification floor so minimalism does not become careless under-building.

This helps ensure your idea is shaped before planning, your plan is stable before it is broken down into tasks, your tasks remain aligned when the plan changes, and implementation starts from reviewed artifacts.

### Suggested Feature Delivery Flow

```text
governed-discover (optional)
  → governed-spec (optional when spec.md already exists)
  → governed-delivery
      → flash-mem preflight
      → plan generation or reuse
      → security and architecture plan gate
      → task generation or reconciliation
      → security task review and architecture refactors
      → speckit.analyze
  → governed-implement
  → architecture-verify
```

Run the recommended plan-to-tasks workflow with:

```text
/speckit.architecture-guard.governed-delivery
```

Rerunning the command is safe: it reuses accepted artifacts and resumes from the first invalid phase. P0 architecture findings and Critical security findings stop progression; advisory findings remain visible without blocking delivery.

---

## Quick Start

Choose the path that matches your repository state.

### Brownfield Quick Start

Use this when the repository already contains application code.

1. Install the extension

From the Spec Kit extensions registry:
```text
specify extension add architecture-guard
```

Or directly from the release artifact:
```text
specify extension add architecture-guard --from \
  https://github.com/DyanGalih/spec-kit-architecture-guard/archive/refs/tags/v1.15.1.zip
```

2. Map the existing codebase

```text
/speckit.architecture-guard.init-brownfield
```

3. If you are already starting from a clear spec, run the suggested feature delivery flow:

```text
/speckit.architecture-guard.governed-delivery
```

If you are still shaping the feature, run `/speckit.architecture-guard.governed-discover` first, then pass the resulting draft into `/speckit.architecture-guard.governed-spec` before delivery.

For a standalone review of existing work, use:

```text
/speckit.architecture-guard.architecture-workflow
```

### Greenfield Quick Start

Use this when the repository is greenfield or when you want to define constitutions first.

1. Install the extension

From the Spec Kit extensions registry:
```text
specify extension add architecture-guard
```

Or directly from the release artifact:
```text
specify extension add architecture-guard --from \
  https://github.com/DyanGalih/spec-kit-architecture-guard/archive/refs/tags/v1.15.1.zip
```

2. Initialize your constitutions

```text
/speckit.architecture-guard.init
```

3. If you are already starting from a clear spec, run the suggested feature delivery flow:

```text
/speckit.architecture-guard.governed-delivery
```

If you are still shaping the feature, run `/speckit.architecture-guard.governed-discover` first, then pass the resulting draft into `/speckit.architecture-guard.governed-spec` before delivery.

For a standalone review of existing work, use:

```text
/speckit.architecture-guard.architecture-workflow
```

---

## Command Directory

| Command | When To Use | What It Does |
| :--- | :--- | :--- |
| **`/speckit.architecture-guard.init-brownfield`** | For existing codebases | Maps the current state, boundaries, and conventions before governance work. |
| **`/speckit.architecture-guard.init`** | At project setup or when standards change | Creates or refines governance and architecture constitutions. |
| **`/speckit.architecture-guard.consolidate-specs`** | When budgeted context needs a fresh local fallback | Generates a compact, non-authoritative feature index with provenance and conflict reporting. |
| **`/speckit.architecture-guard.governed-discover`** | Idea-stage entry point | Shapes a rough request into a spec-ready direction before formal specification. |
| **`/speckit.architecture-guard.governed-spec`** | Specification stage | Orchestrates specify and clarify with architecture and memory context validation, plus an auto-fix loop. |
| **`/speckit.architecture-guard.governed-delivery`** | Delivery stage | Resumes from the first invalid phase, gates the plan, generates aligned tasks, and runs analysis. |
| **`/speckit.architecture-guard.architecture-workflow`** | For an end-to-end review | Reviews specs, plans, tasks, and implementations for drift and refactors. |
| **`/speckit.architecture-guard.architecture-review`** | After `/specify`, `/plan`, or `/implement` | Checks a spec, plan, or implementation against architecture rules. |
| **`/speckit.architecture-guard.refactor-generator`** | After violations are found | Converts violations into structured refactor tasks. |
| **`/speckit.architecture-guard.architecture-apply`** | When refactors are approved | Injects approved architecture work into plans and tasks. |
| **`/speckit.architecture-guard.architecture-verify`** | Final validation step | Checks whether the final work matches the approved tasks. |

### Budgeted Architecture Context Retrieval

For repositories with many historical feature specs, init can create `.specify/config/architecture_guard.yml` with `context.mode: budgeted`. The workflow always reads the active feature artifacts and constitutions first, then uses a bounded Flash-Mem summary search. It reads `specs/system_context.md` only when Flash-Mem is unavailable or insufficient, and opens individual historical specs only for named gaps or conflicts.

`system_context.md` is an offline fallback index, not a canonical specification. Refresh it with:

```text
/speckit.architecture-guard.consolidate-specs
```

Budgeted mode can reduce repeated historical context in medium and large repositories, but savings depend on the project and must be measured; small repositories may see little benefit.

Use the [Budgeted Context Benchmark](docs/context-budget-benchmark.md) before claiming verified token savings.

---

## Technical Documentation Map

We split the Architecture Guard manual into focused technical resources:

```
spec-kit-architecture-guard/
├── README.md                  ← Readable, high-level project summary
└── docs/
    ├── beginner-guide.md       ← Plain-language explanation and first workflow
    ├── architecture-overview.md ← Problem statement, value, and behavior
    ├── governance-model.md      ← Constitution layers and delegation model
    ├── workflows.md             ← Governed discovery, specification, planning, task, and implementation flows
    ├── reference-manual.md      ← Setup, commands, install, and validation details
    ├── presets.md               ← Supported framework presets and extension contract
    ├── dry-cleanup.md           ← Brownfield DRY cleanup flow and duplication signals
    ├── repository-hygiene.md    ← Repository Hygiene rules and configuration
    └── release-notes.md         ← Change history and workflow updates
```

### Direct Links

- [Beginner Guide](docs/beginner-guide.md) - Plain-language overview for new users
- [Architecture Overview](docs/architecture-overview.md) - Problem statement, value, and how the tool behaves
- [Governance Model](docs/governance-model.md) - Layered constitutions and delegation behavior
- [Workflows](docs/workflows.md) - Governed discovery, specification, planning, tasks, implementation, and companion extension flows
- [Reference Manual](docs/reference-manual.md) - Install, configure, validate, and command details
- [Framework Presets](docs/presets.md) - Built-in preset comparison, selection guidance, and custom-preset contract
- [DRY Cleanup Guide](docs/dry-cleanup.md) - Brownfield flow for finding and removing duplicated logic
- [Repository Hygiene](docs/repository-hygiene.md) - Configuration and rules for the Repository Hygiene Guard
- [Release Notes](docs/release-notes.md) - Recent workflow and README updates

---

## Design Philosophy

- **Non-blocking by default**: violations become refactor tasks unless a rule is explicitly marked blocking
- **Reviewable in Git**: the rules live in markdown files, not hidden state
- **Architecture first**: the extension focuses on boundaries, ownership, and drift
- **Companion-aware**: it can orchestrate other Spec Kit tools without depending on them
- **Ponytail Core**: one shared ladder prevents both over-building and unsafe under-building across every delivery phase

## Versioning Policy

This project strictly adheres to [Semantic Versioning (SemVer) 2.0.0](https://semver.org/). Version numbers follow the `MAJOR.MINOR.PATCH` format:
- **MAJOR** version when making incompatible API changes,
- **MINOR** version when adding functionality in a backward-compatible manner, and
- **PATCH** version when making backward-compatible bug fixes.

## Brownfield init

See the Quick Start above for the brownfield entrypoint.
If you are specifically cleaning up duplicated logic, follow the [DRY Cleanup Guide](docs/dry-cleanup.md) after the brownfield mapping pass.

---

## Legacy Manual Plan and Task Workflow

The separate phase commands remain supported for targeted recovery, debugging, and teams that want manual approval between artifacts:

```text
/speckit.architecture-guard.governed-plan
# Review or repair plan.md until no P0 architecture or Critical security findings remain.

/speckit.architecture-guard.governed-tasks
# Generate tasks only after the plan is accepted, then run security, refactor, and analysis checks.
```

Use the manual flow according to the source of the problem:

- Plan problem: run `governed-plan`, then `governed-tasks` because the previous tasks may be stale.
- Task-only problem: run `governed-tasks`.
- Unknown or cross-phase problem: rerun `governed-delivery` and let it resume from the first invalid phase.
