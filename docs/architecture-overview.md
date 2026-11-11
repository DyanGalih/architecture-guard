# Architecture Overview

This document explains what Architecture Guard is and why it exists.

## What Is This?

Architecture Guard is a modular, technology-agnostic **SDD Tools Orchestration layer** for AI-assisted development across **OpenSpec**, **Spec Kit**, and generic Markdown workflows. It helps AI agents follow the architectural rules you define and keeps those rules visible across the entire delivery lifecycle.

It reviews specifications, plans, task lists, and implementations against your project's architecture standards and turns the results into:

- architecture drift detection
- structured refactor tasks
- consistency reviews
- architecture evolution proposals
- incremental migration guidance

The goal is to make architecture part of the workflow instead of something you only check at review time.

See the Quick Start in the README for the brownfield and greenfield entrypoints.
If you are specifically cleaning up duplicated logic, follow the [DRY Cleanup Guide](dry-cleanup.md) after the brownfield mapping pass.
For framework-specific initialization and review coverage, see [Framework Presets](presets.md).

## Why It’s Useful

Architecture Guard is helpful because it gives AI a smaller, better set of rules to follow:

- small models stay on rails because they read the right context first
- architecture decisions stop living only in people’s heads
- drift becomes visible as refactor work instead of hidden technical debt
- security and architecture checks happen in the workflow, not after the damage is done
- the system stays technology-agnostic, so the same ideas work across Laravel, NestJS, Next.js, React Native, Django, and more

## Best Features

Architecture Guard stands out because it combines a few practical capabilities in one workflow:

- **Ponytail Core:** Applies an ordered decision ladder, root-cause caller tracing, safety exceptions, and runnable verification across delivery phases. *(Inspired by the [Ponytail Pragmatism Skill](https://github.com/DietrichGebert/ponytail))*
- **DRY Cleanup Guidance:** Helps brownfield projects find duplicated business logic, validation, DTO mapping, and orchestration, then turn them into small refactor tasks instead of copy-paste drift.
- **Brownfield Discovery + Verification:** Maps the current codebase, surfaces architectural drift early, and confirms approved refactors actually made it into the final work.
- **Repository Hygiene Guard:** Automatically detects stray `*-copy.ts` drafts, orphaned code, and debug artifacts before they hit your main branch. [Learn more →](repository-hygiene.md)
- **SonarLint Code Quality Bundle:** Evaluates 37 architecture-relevant rules across Java, JavaScript, TypeScript, Python, and PHP (derived from [SonarSource](https://rules.sonarsource.com)) to detect cognitive/cyclomatic complexity, oversized functions/classes, coupling, and loose boundary casts. [Sonar rules →](../sonar-rules/README.md)
- **Multi-Host Parallel Agent Teams:** Coordinates specialist subagents across Claude Code, OpenAI Codex, Google Antigravity (`agy`), and OpenCode with tiered workspace isolation (`share` or per-role Git worktrees). [Team roles →](standalone-usage.md#team-roles)
- **Backlog & Pull-Request Queues:** Delivers prioritized work items from Jira, [Beads (`bd`)](https://github.com/steveyegge/beads), or `.architecture-guard/backlog.yml` (`ag-governed-backlog`) and orchestrates PR reviews and feedback triage across GitHub, GitLab, Bitbucket, and Azure DevOps (`ag-pr-queue`). [Workflows →](workflows.md)

## The Problem It Solves

AI-generated code usually optimizes for:

- speed
- local correctness
- immediate implementation success

It does not naturally preserve architectural consistency or remember your standards from one feature to the next.

Over time this creates drift:

- business logic leaks into controllers or route handlers
- direct database access bypasses established boundaries
- inconsistent response contracts appear across modules
- modules reach into each other's internals
- new features introduce slightly different patterns

Each issue looks small in isolation. After enough features, boundaries weaken and technical debt spreads silently.

Architecture Guard detects these drifts early and converts them into structured, visible, non-blocking architecture work.

## What It Actually Does

Think of it as a governance layer that sits between Spec Kit and implementation.

When Budgeted Architecture Context Retrieval is enabled, context expands progressively:

```text
active feature artifacts + constitutions
              ↓
bounded Flash-Mem summaries and selected entries
              ↓ only when insufficient
specs/system_context.md
              ↓ only for a named gap
selected historical specs
```

The local system context is an offline fallback, not another default input and not a replacement specification. This avoids loading the same cross-feature material from both Flash-Mem and repository history. Actual savings depend on repository size and retrieval quality and must be benchmarked.

| Phase | What Happens | Output |
| --- | --- | --- |
| Discovery | Architecture-aware brainstorming against constraints and existing patterns | Aligned feature draft with rejected options and open questions, each with a recommendation |
| Specification | Reviews ownership, boundaries, contracts | Missing boundaries or unclear ownership |
| Planning | Detects coupling and architecture drift | Warnings before implementation hardens |
| Task Generation | Converts violations into structured refactor work | Prioritized refactor tasks |
| Implementation | Re-checks implementation against architecture rules | Drift detection and consistency review |
| Architecture Evolution | Detects repeated patterns and proposes architecture updates | Constitution update proposals |
| Approved Changes | Applies accepted updates into planning artifacts | Updated tasks and plans via `ag-apply` |
| Verification | Post-implementation task and requirement audit | Task gap analysis and outcome report |

## Key Philosophy

Architecture Guard is intentionally non-blocking by default.

Violations become:

- refactor tasks
- migration tasks
- architecture proposals

They are not hard errors unless a rule is explicitly marked as blocking in the architecture constitution.

Example:

```text
[Refactor Task]
Title: Move pricing rule out of checkout handler
Reason: The handler currently owns business decisions that belong in the application layer.
Scope: Checkout handler and checkout application service.
Priority: P1
Suggested Fix: Extract pricing logic into the checkout service and keep the handler responsible for validation and delegation only.
```

## Benefits

Architecture Guard can make Spec Kit feel safer, clearer, and easier to scale without adding heavy process.

| Spec Kit Only | Spec Kit + Architecture Guard |
| --- | --- |
| AI starts each feature independently | AI checks work against architecture standards first |
| Drift accumulates silently | Drift becomes visible and actionable |
| Architecture inconsistencies appear during code review | Inconsistencies are detected earlier |
| Constitution exists passively | Constitution becomes actively enforced |
| No structured architecture debt tracking | Violations become prioritized refactor tasks |
| Architecture evolution is manual and inconsistent | Architecture evolution becomes structured and reviewable |

The practical payoff:

- less time re-explaining the same rules
- clearer boundaries for both AI and humans
- earlier feedback before drift hardens
- more visible architecture debt
- more consistent behavior from smaller or mixed-capability models

## Compared to Static Analyzers

Static analyzers are great at rules. Architecture Guard is better at helping AI keep the right shape in mind while it works.

| Static Analyzers | Architecture Guard |
| --- | --- |
| Language-specific tooling | Framework-agnostic architecture review |
| Syntax and code-pattern focus | Architecture and boundary focus |
| Build-time blocking | Non-blocking by default |
| Generic rules | Project-specific architecture rules |
| Runtime/tooling dependencies | Prompt instructions plus the Architecture Guard CLI for resource resolution and hygiene; vendored mode can avoid CLI lookup for static engine resources |

> Architecture Guard is a prompt governance layer, not a static analysis engine.
> Its commands are structured Markdown files that instruct the AI agent on what to check and how to report findings.
> It does not perform AST inspection, syntax analysis, or runtime checks.
> For complementary static guarantees, pair it with SonarLint, ESLint, or a framework-native linter.

## When To Use It

Use Architecture Guard when you want AI-assisted development to stay disciplined over time:

- your project has meaningful boundaries
- AI-generated code tends to drift from your standards
- multiple developers need the same rules enforced consistently
- architecture decisions should be visible instead of tribal knowledge
- you want refactor work to surface before debt becomes expensive
- you want architecture evolution to be intentional instead of accidental

## Best Fit

- modular monoliths
- microservices
- large full-stack applications
- shared API/UI contract systems
- long-lived codebases
- systems where consistency matters more than framework purity
- teams using smaller models that benefit from compact, explicit guidance

## When NOT To Use It

Do not use Architecture Guard when the overhead would outweigh the value:

- tiny projects with no meaningful architecture
- throwaway prototypes
- one-off scripts
- projects with no agreed architectural direction
- teams unwilling to maintain architecture standards
- replacing benchmarking or profiling workflows

If you can fully manage architecture mentally and the project is truly small, this extension may be unnecessary overhead.

## Credits & Ecosystem References

Architecture Guard integrates with and builds upon open-source projects across the SDD and AI-engineering ecosystem:

- **SDD Frameworks**: [Spec Kit](https://github.com/github/spec-kit) ([spec-kit.dev](https://spec-kit.dev)) and [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- **Engineering Pragmatism**: [Ponytail Pragmatism Skill](https://github.com/DietrichGebert/ponytail) (inspiring `templates/ponytail_core.md`)
- **Companion Extensions**: [Flash-Mem](https://github.com/DyanGalih/flash-mem) (durable SQLite/MCP memory), [Security Review](https://github.com/DyanGalih/security-review) (whitebox security governance), and [Spec-Kit E2E Stream](https://github.com/DyanGalih/spec-kit-e2e-stream) / [Playwright](https://playwright.dev)
- **Code Quality & Backlog Tooling**: [SonarSource Rules Catalog](https://rules.sonarsource.com) ([sonar-java](https://github.com/SonarSource/sonar-java), [SonarJS](https://github.com/SonarSource/SonarJS), [sonar-python](https://github.com/SonarSource/sonar-python), [sonar-php](https://github.com/SonarSource/sonar-php)), [Beads (`bd`)](https://github.com/steveyegge/beads), and [Model Context Protocol (MCP)](https://modelcontextprotocol.io)
