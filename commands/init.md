---
description: Initialize or refine the project governance and architecture constitutions for Architecture Guard.
---

# Purpose

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

This command helps teams intentionally define:

* engineering governance principles
* architecture boundaries
* enforcement standards
* validation and contract rules
* architecture evolution policies

This command generates or refines:

* `.specify/memory/constitution.md`
* `.specify/memory/architecture_constitution.md`
* `.specify/memory/security_constitution.md`
* optional `.specify/config/architecture_guard.yml` context-loading configuration

## Workflow Integration

Run this command once per project or whenever the constitution files need refinement. If the constitution files already exist, refine them instead of starting over.

See the README quick start for brownfield and greenfield entrypoints.

After init, the usual next step is `/speckit.architecture-guard.governed-plan` or `/speckit.architecture-guard.governed-tasks`, depending on whether the team wants planning or task generation next.

When Flash-Mem is available, prefer it first for retrieving prior decisions, summaries, and existing constitution context. The repository files remain the source of truth for constitution content, and the legacy `memory-hub` name is reference-only and should not be treated as the runtime backend. If Flash-Mem is unavailable or the context is incomplete, read the repository files directly and treat them as the canonical source of truth. After refining the constitutions, sync durable summaries and major decisions back into Flash-Mem.

The goal is NOT to generate generic best practices.

The goal is to establish:

* enforceable rules
* clear boundaries
* long-term consistency
* architecture evolution discipline
* project-specific standards

---

## Framework-Agnostic vs Framework-Aware

**Framework-Agnostic Core** (applied to all projects):
- Universal boundary concepts apply (Entry, App, Domain, Data, External)
- Core governance principles are framework-independent
- Examples: "Domain logic never touches HTTP", "Persistence is abstracted", "Events flow one direction"

**Framework-Aware Enhancement** (optional, selected during init):
- If user selects framework preset (Laravel, Django, NestJS, etc.):
  - Core principles are enhanced with framework-specific vocabulary
  - Examples become Laravel-idiomatic, Django-idiomatic, etc.
  - Pattern names shift from generic to framework-native
  - But underlying boundary concepts remain identical

**Coexistence**:
- Command starts framework-agnostic
- If preset selected: Constitution gains framework-aware guidance
- Both layers work together: abstract principles + concrete framework patterns
- Switching frameworks: Start over, preset vocabulary changes but core governance remains

---

# Core Principles

## 1. Sequential Interviewing

DO NOT ask all questions at once.

Interview the user in logical phases.

Only continue when the current phase is sufficiently understood.

---

## 2. Context-Aware Guidance

Adapt vocabulary and suggestions based on:

* framework
* architecture style
* project maturity
* existing conventions
* existing constitution files

Examples:

* Laravel → Controllers, Form Requests, Actions, Eloquent
* NestJS → Controllers, Providers, DTOs, Modules
* Next.js → Server Components, Server Actions, Zod
* Nuxt → Composables, Pinia, server/api
* React Native → Screens, hooks, navigation, device services, native modules

---

## 3. Suggestions, Not Forced Opinions

Reference patterns are suggestions.

NEVER force architecture opinions into the Constitution.

A rule only becomes a standard when:

* the user explicitly accepts it
* OR the project already consistently follows it

---

## 4. Architecture Before Implementation

Prioritize:

* boundaries
* ownership
* responsibilities
* contracts
* dependency direction

before implementation details.

---

## 5. Explicit Standards Only

Avoid vague guidance.

BAD:

```text
Follow best practices
```

GOOD:

```text
Controllers must delegate business logic to Services or Actions.
```

---

## 6. Constitution Changes Must Be Intentional

NEVER automatically evolve architecture direction.

If architecture drift is detected:

* summarize the drift
* explain impact
* propose evolution
* require explicit approval

---

## 7. Layered Constitution Strategy

This system separates:

* governance principles
* architecture enforcement rules

The system must maintain:

* `.specify/memory/constitution.md`
* `.specify/memory/architecture_constitution.md`

Avoid duplication between both files.

---

## 8. Graceful Exit and Resume Flow

Users may need to pause the init workflow and resume later. Support this gracefully:

**Pausing Mid-Interview**:
1. Save current answers to `.specify/memory/constitution-draft.md` with timestamp and completion percentage
2. Ask user: "Do you want to resume these answers later?"
3. If YES: Save draft and exit cleanly with resume instructions
4. If NO: Confirm deletion or suggest next steps

**Resuming Saved Draft**:
1. Detect `.specify/memory/constitution-draft.md` on next init run
2. Ask: "I found a draft from [timestamp]. Resume from where you left off?"
3. If YES: Load saved answers, continue from last question
4. If NO: Start fresh (optionally archive old draft)

**Draft Contents**:
```yaml
# Constitution Draft (Paused)
timestamp: 2025-01-15T14:30:00Z
completion: "Phase 1/3 (Framework + Team)"
framework: [answer if provided]
team_size: [answer if provided]
technology_stack: [answer if provided]
architecture_guard_context_mode: [targeted or budgeted if answered]
# ... other captured answers
```

---

# Constitution Responsibilities

---

## `.specify/memory/constitution.md`

Purpose:

High-level governance and engineering philosophy.

Should contain:

* engineering philosophy
* pragmatism & simplicity (Ponytail principles: YAGNI, standard library preference, lazy senior developer mindset)
* testing standards
* security expectations
* documentation standards
* review expectations
* operational expectations
* high-level architecture intent

Should NOT contain:

* controller implementation details
* DTO implementation specifics
* framework-specific structure rules
* module folder naming conventions

---

## `architecture_constitution.md`

Purpose:

Enforceable architecture standards and system boundaries.

Should contain:

* layer boundaries
* business logic placement
* validation flow
* DTO/schema standards
* module ownership rules
* async boundaries
* API contract rules
* framework-specific architectural conventions
* architecture evolution rules

---

## `security_constitution.md`

Purpose:

Project-wide security rules, standards, and requirements.

Should contain:

* trust boundaries
* authentication/authorization standards
* secret management policies
* data isolation rules
* audit/logging requirements
* secure-by-design patterns

---

# Initialization Logic

## Step 1 — Detect Existing Constitution Files

Check for:

* `.specify/memory/constitution.md`
* `.specify/memory/architecture_constitution.md`
* `.specify/memory/security_constitution.md`

---

## If BOTH files exist

1. Summarize:

* governance principles
* architecture rules
* duplicated rules
* conflicting standards
* unclear sections

2. Ask:

```text
Would you like to:
- refine governance rules
- refine architecture rules
- reduce duplication
- evolve architecture direction
- regenerate one of the files
```

3. NEVER overwrite rules automatically.

---

## If ONLY the governance Constitution exists

1. Analyze architecture-related sections.

2. Detect rules that should move into:

```text
.specify/memory/architecture_constitution.md
```

3. Ask:

```text
Would you like to split architecture rules into a dedicated architecture constitution?
```

---

## If NO constitution files exist

Start phased initialization interview.

---

# Interview Flow

---

# Phase 1 — Project Identity & Architecture Style

Determine:

* technology stack
* architecture style
* runtime boundaries
* application type
* deployment shape

---

## Questions

### Technology Stack

Ask:

```text
What is the primary technology stack?

Examples:
- Laravel 12 + Inertia React
- NestJS 10
- Next.js 15 App Router
- Nuxt 3
- Express + React
- React Native + Expo
```

### Framework Preset

If the technology stack matches a built-in preset (e.g., Laravel, NestJS, Next.js, Nuxt.js, Django, Spring Boot, React, React Native, Vue, or Express), ask:

```text
Would you like to use the [Framework] Architecture Preset?

This will:
1. Configure the engine to be [Framework]-aware.
2. Use framework-specific knowledge during constitution generation.
3. Provide specialized detection for [Framework] anti-patterns.
```

---

### Architecture Style

Ask:

```text
What architecture style does this project follow?

- Monolith
- Modular Monolith
- Microservices
- Event-Driven
- Hybrid
```

---

### Application Type

Ask:

```text
What type of application is this?

Examples:
- REST API
- Full-stack web app
- Internal dashboard
- Public SaaS
- Realtime platform
- Background processing system
```

---

### Architecture Context Budget

After the project shape is understood, ask:

```text
Would you like Budgeted Architecture Context Retrieval?

- Targeted (default): preserve the existing Flash-Mem-first workflow.
- Budgeted: cap initial Flash-Mem retrieval, use specs/system_context.md only when memory is unavailable or insufficient, and open historical specs only for named gaps.

Budgeted mode is mainly useful when a repository has many historical feature specs. It does not replace active feature artifacts and does not guarantee savings until benchmarked on this project.
```

If the user selects Budgeted:

1. Create `.specify/config/architecture_guard.yml` from `.specify/extensions/architecture-guard/templates/architecture_guard_config.yml` (or `templates/architecture_guard_config.yml` in the extension source checkout).
2. Set `context.mode: budgeted`.
3. Preserve the default retrieval limits unless the user explicitly requests different limits.
4. If feature specs already exist, run `/speckit.architecture-guard.consolidate-specs` after constitution generation is complete.

If the user selects Targeted or gives no answer, preserve existing behavior. Do not add operational context settings to any constitution.

---

# Architecture-Aware Branching

---

## If Monolith

Focus on:

* layering
* separation of concerns
* entry-point discipline

---

## If Modular Monolith

Focus on:

* module ownership
* cross-module access
* shared contracts
* dependency direction

---

## If Microservices

Focus on:

* service ownership
* API contracts
* event communication
* shared database restrictions
* service boundaries

---

# Framework Preset Interview

Framework-specific questions belong to the selected preset, not this command.

When the user selects a built-in framework preset:

1. Resolve its preset file from `.specify/extensions/architecture-guard/presets/[preset].md`. In the extension source checkout, use `presets/[preset].md`.
2. Locate `## Init Interview` and read that section through the next level-two heading. Do not load unrelated review guidance solely to run the interview when the host can read a section selectively.
3. Merge the preset questions into the matching generic interview phases. Ask them sequentially and only when relevant to the selected application type or an earlier answer; do not ask a generic and preset question twice when they seek the same decision.
4. Record each answer as a framework-neutral architectural decision plus its selected framework implementation.
5. If the preset has no `## Init Interview` section, continue with the generic phases below without inventing framework requirements.

Keep the normalized decisions portable, including use-case invocation style, DTO strategy, authorization strategy, validation, contracts, and boundary ownership. Package-specific options MUST remain inside the matching preset. Selecting a package records a convention; it does not authorize init to install dependencies.

If the user selects no enforced convention, preserve that choice and do not turn the preference into an architecture violation.

---

# Phase 2 — Business Logic & Boundaries

Determine:

* business logic ownership
* dependency direction
* layer responsibilities
* boundary isolation

---

## Questions

Ask:

```text
Where should business logic live?
```

---

Ask:

```text
Which layers may communicate directly?
```

---

Ask:

```text
Should the domain layer remain isolated from transport layers such as HTTP, queues, or UI?
```

---

Ask:

```text
How strict should module boundaries be enforced?
```

---

# Phase 3 — Contracts & Validation

Determine:

* validation strategy
* request/response contracts
* serialization standards
* frontend/backend boundaries

---

## Questions

Ask:

```text
How should input validation be handled?
```

---

Ask:

```text
What is the standard response structure?
```

---

## Preset Contract Questions

If the selected preset's `## Init Interview` includes contract or validation questions, ask them during this phase unless an earlier answer already resolves them. Do not ask the same question twice.

---

# Phase 4 — Data Access & Async Rules

Determine:

* ORM strategy
* repository usage
* query ownership
* async boundaries
* background processing rules

---

## Questions

Ask:

```text
How should data access be handled?

Examples:
- direct ORM usage
- repositories
- query services
- domain repositories
```

---

Ask:

```text
When should async processing be required?
```

---

Ask:

```text
Which operations must never block requests?
```

---

# Phase 5 — Enforcement & Evolution

Determine:

* blocking rules
* architecture governance
* evolution policies
* intentional deviations

---

## Questions

Ask:

```text
Which rules should be treated as blocking violations (P0)?
```

---

Ask:

```text
Are there intentional architectural deviations that should be documented?
```

---

Ask:

```text
How should architecture evolution be handled?

Examples:
- manual review only
- proposal-based evolution
- strict governance
```

---

# Rule Classification Logic

Before generating rules, classify them.

---

## Global Governance Rules → `.specify/memory/constitution.md`

Examples:

* testing philosophy
* documentation standards
* security requirements
* review expectations
* engineering philosophy (Ponytail principles, YAGNI, minimal abstractions)
* operational governance

---

## Architecture Enforcement Rules → `.specify/memory/architecture_constitution.md`

Examples:

* controller/service boundaries
* DTO requirements
* use-case invocation style and its framework implementation, when selected
* DTO strategy and its framework implementation, when selected
* authorization strategy and its framework implementation, when selected
* validation placement
* async boundaries
* response contracts
* module ownership rules
* framework-specific architecture patterns
* DRY and single-source-of-truth rules for repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration
* temporary/scratch files MUST use `-temp` or `-test` suffixes for easier cleanup

---

# Duplication Prevention Rules

DO NOT duplicate rules across both files.

If a rule exists in:

```text
.specify/memory/architecture_constitution.md
```

Then:

```text
.specify/memory/constitution.md
```

should reference architecture rules instead of repeating implementation details.

---

GOOD:

```text
.specify/memory/constitution.md:
- Architecture enforcement rules are defined in `.specify/memory/architecture_constitution.md`
```

```text
.specify/memory/architecture_constitution.md:
- Controllers must delegate business logic to Services or Actions
```

---

BAD:

Duplicating detailed architecture rules in both files.

---

# Constitution Synthesis Rules

DO NOT generate final documents until:

* enough information has been collected
* OR the user explicitly requests a draft

---

# Output Requirements

Generate or refine:

* `.specify/memory/constitution.md`
* `.specify/memory/architecture_constitution.md`
* `.specify/memory/security_constitution.md`

When Budgeted Architecture Context Retrieval is selected, also generate `.specify/config/architecture_guard.yml`. Missing configuration means targeted mode, preserving backward compatibility.

If the `flash-mem` MCP server is available, you MUST run the `update_project_summary` tool to reflect any major changes in architecture, boundaries, or governance rules in the project summary. If it is unavailable, rely on the repository files directly and continue without the sync step.

---

## `.specify/memory/constitution.md` Structure

```text
1. Project Identity
2. Engineering Philosophy
3. Security Expectations
4. Testing Expectations
5. Documentation Standards
6. Review Process
7. High-Level Architecture Intent
8. Governance and Evolution Policy
```

---

## `.specify/memory/architecture_constitution.md` Structure

```text
1. Architecture Style
2. Layer Boundaries
3. Business Logic Placement
4. Contracts & Validation
5. Data Access Rules
6. Async & Integration Rules
7. Module Boundaries
8. Framework-Specific Architecture Rules
9. Blocking Architecture Violations (P0)
10. Architecture Evolution Policy
11. Refactor & Drift Handling
```

---

## `.specify/memory/security_constitution.md` Structure

```text
1. Trust Boundaries
2. Authentication & Authorization Standards
3. Data Isolation & Privacy Rules
4. Secrets Management Policy
5. Secure-by-Design Patterns
6. API & Integration Security
7. Audit, Logging & Monitoring Requirements
8. Security Incident Response Triggers
9. Compliance & Regulatory Mapping
```

---

# Architecture Evolution Rules

Architecture rules may evolve over time.

When repeated architecture drift is detected:

* generate Constitution Update Proposals
* target `.specify/memory/architecture_constitution.md` by default
* only propose updates to `.specify/memory/constitution.md` for governance-level changes

NEVER automatically modify either file.

---

# Preset Reference Patterns

Framework-specific reference patterns belong to the selected preset. Use them as optional guidance while interpreting interview answers, but do not automatically enforce them or copy unselected patterns into the Constitution.

---

# Final Rules

This command exists to help teams intentionally design:

* governance standards
* architecture boundaries
* evolution policies
* enforceable engineering systems

It must NOT:

* generate vague advice
* blindly enforce trends
* automatically rewrite architecture direction
* duplicate rules across constitutions
* duplicate business rules, approvals, validation, DTO mapping, transformations, or orchestration across modules or layers

The generated constitutions must reflect intentional engineering decisions.
