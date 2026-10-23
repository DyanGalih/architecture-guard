---
description: Initialize or refine the project governance and architecture constitutions for Architecture Guard.
---

## SDD Adapter Resolution

Before executing this command, read `.architecture-guard/adapters/resolve.md` and resolve the adapter with its chain (explicit `--adapter` override, `.architecture-guard/selected-adapter`, `.architecture-guard/config.yml`, then filesystem markers), then load `.architecture-guard/adapters/{tool}.md` for path maps, command maps, and gap fills. Stop with `Unavailable` and the exact path if the adapter file is missing. Do not use the Architecture Guard resource resolver for adapter selection: adapter files are not a `resolve` resource category. Resolve every adapter path and command token before continuing; all paths and commands below use the loaded adapter.

# Purpose

## Standalone Resource Resolution

Architecture Guard engine resources are standalone package resources. Never search an SDD-tool directory, an extension directory, or a source checkout for them. An adapter path under `.architecture-guard` is an editable local override location, not proof that the resource was copied.

- Directly inspect the matching `.architecture-guard/<category>/` directory first for workspace overrides.
- If the named local resource exists, read it. Otherwise run `architecture-guard resolve <category> <name>` and use the returned content.
- For a resource collection, run `architecture-guard resolve <category> --list`, then resolve every returned name individually in deterministic order so local overrides replace bundled files without hiding bundled defaults.
- If the CLI is unavailable and a mandatory resource is not vendored locally, stop and report the missing runtime dependency. For optional resources, report `Unavailable` and continue only when this command explicitly permits degradation.

## Ponytail Core Contract

Before continuing, you **MUST** resolve and apply the `ponytail_core` template with `architecture-guard resolve template ponytail_core` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

## Input & Context Loading

Before refining governance, read these inputs explicitly with file-reading tools:

1. **Manifest & Configuration**: Read the selected adapter's project configuration (`{adapter_path:project-config}`) first, then inspect it for references to further governance and constitution Markdown files (for example a `context` block). Never rely on a hardcoded partial list.
2. **Authoritative Constitutions (read all that exist)**: Read every declared or present governance, constitution, architecture, security, and layout Markdown file. Explicitly check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.
3. **Initialization Artifacts**: Read any constitution draft, existing governance configuration, and framework preset required by this skill.

This command helps teams intentionally define:

* engineering governance principles
* architecture boundaries
* enforcement standards
* validation and contract rules
* architecture evolution policies

This command generates or refines:

* `{adapter_path:constitution}`
* `{adapter_path:arch-constitution}`
* `{adapter_path:security-constitution}`
* optional `{adapter_path:governance-config}` context-loading configuration

## Workflow Integration

Run this command once per project or whenever the constitution files need refinement. If the constitution files already exist, refine them instead of starting over.

See the README quick start for brownfield and greenfield entrypoints.

After init, the usual next step is to run the applicable governance command for the active SDD tool (planning or task generation) via the orchestration flow.

When Flash-Mem is available, call `get_project_summary`, then `search_memory`; prefer summaries and metadata and load full entries only as needed. The repository files remain the source of truth for constitution content, and the legacy `memory-hub` name is reference-only and should not be treated as the runtime backend. If Flash-Mem is unavailable or the context is incomplete, resolve the selected adapter project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), then explicitly read every declared or present constitution, architecture, security, and layout Markdown file and treat those repository files as canonical. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file. After refinement, propose `capture_artifact_memory` calls for changed constitution artifacts and validated `add_memory` or `update_memory` entries, and execute only those the user explicitly approves. Ask permission before any `update_project_summary` call.

The goal is NOT to generate generic best practices.

The goal is to establish:

* enforceable rules
* clear boundaries
* long-term consistency
* architecture evolution discipline
* project-specific standards

---

## SDD-Tool-Agnostic vs Application-Framework-Aware

**SDD-Tool-Agnostic Core** (applied to all projects):
- Universal boundary concepts apply (Entry, App, Domain, Data, External)
- Core governance principles are framework-independent
- Examples: "Domain logic never touches HTTP", "Persistence is abstracted", "Events flow one direction"

**Application-Framework-Aware Enhancement** (optional, selected during init):
- If user selects framework preset (Laravel, Django, NestJS, etc.):
  - Core principles are enhanced with framework-specific vocabulary
  - Examples become Laravel-idiomatic, Django-idiomatic, etc.
  - Pattern names shift from generic to framework-native
  - But underlying boundary concepts remain identical

**Coexistence**:
- Command starts technology-agnostic
- If preset selected: Constitution gains framework-aware guidance
- Both layers work together: abstract principles + concrete framework patterns
- Switching application frameworks: preserve accepted framework-neutral rules, re-run only affected preset questions, and explicitly approve replacement of framework-specific rules; do not start over or change the selected SDD adapter implicitly
- Refining the current framework preset: keep unaffected accepted rules and ask only questions needed for the requested refinement

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

* `{adapter_path:constitution}`
* `{adapter_path:arch-constitution}`

Avoid duplication between both files.

---

## 8. Graceful Exit and Resume Flow

Users may need to pause the init workflow and resume later. Support this gracefully:

**Pausing Mid-Interview**:
1. Ask user: "Do you want to save these answers to resume later?"
2. If YES: Preview the target `{adapter_path:draft}` and the captured answers (with timestamp and completion percentage), then write the draft only after explicit approval and exit cleanly with resume instructions
3. If NO: Write nothing; suggest next steps (and delete an existing draft only after explicit confirmation)

**Resuming Saved Draft**:
1. Detect `{adapter_path:draft}` on next init run
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

## `{adapter_path:constitution}`

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

## `{adapter_path:arch-constitution}`

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

## `{adapter_path:security-constitution}`

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

Before assessing the existing state, read the selected adapter project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), and explicitly read every declared or present governance, constitution, architecture, security, and layout Markdown file. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.

Check for:

* `{adapter_path:constitution}`
* `{adapter_path:arch-constitution}`
* `{adapter_path:security-constitution}`

---

## Existing-State Rules

Treat the governance artifact as complete only after reading the selected configuration context and every declared or present governance, constitution, architecture, security, and layout Markdown file. Explicitly check {adapter_path:constitution-set} when present. The architecture and security split files remain optional when their rules are embedded in the governance artifact; if either split exists, reconcile ownership and remove duplication only after approval.

| Existing state | Behavior |
|---|---|
| All three exist | Summarize, reconcile conflicts and duplication, then offer targeted refinement. |
| Governance + architecture exist | Preserve both; offer embedded security rules or the optional security split. |
| Governance + security exist | Preserve both; offer embedded architecture rules or the optional architecture split. |
| Architecture + security exist | Ask for the governance artifact path/content and offer to create it; do not rewrite either split first. |
| Governance only | Analyze embedded architecture/security rules and offer optional splits. |
| Architecture only | Preserve it and offer governance plus security coverage. |
| Security only | Preserve it and offer governance plus architecture coverage. |
| None exist | Start the phased initialization interview. |

## If all three files exist

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

2. Detect architecture and security rules that could remain embedded or move into:

```text
{adapter_path:arch-constitution}
{adapter_path:security-constitution}
```

3. Ask:

```text
Would you like to keep these rules embedded, or split architecture and/or security rules into dedicated constitution files?
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
* Unresolved user-provided paths (generic adapter only) for the constitution, architecture constitution, security constitution, and any requested governance configuration before generation; other adapters use their mapped paths

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

If the technology stack matches a built-in preset (e.g., Angular, Laravel, NestJS, Next.js, Nuxt.js, Django, Spring Boot, React, React Native, Vue, or Express), ask:

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

### Delivery Topology (Solo vs Team vs Agent Teams)

Ask:

```text
How will development be delivered on this project?

- Solo Development (Single developer / AI pair)
- Team Development (Human team with Issue Tracker sync)
- Claude Code Agent Teams (a lead session plus teammate roles sized to this project: analysts, one implementor per stack layer, and a code reviewer)
```

Offer the Claude Code Agent Teams option only when this session runs in Claude Code. On any other host, ask with the first two options only and do not create `.architecture-guard/agents.yml` or `.claude/agents/` files; the governed skills run there in their normal single-agent flow.

If the user selects Team Development:
1. Record `Mode: Team` for the proposed governance changes.
2. Ask: "Which issue tracker MCP server should be used to sync User Stories? (e.g., github-mcp-server, jira, none)". Save this preference in the governance rules.
3. Propose scaffolding a `user-stories/` directory at the project root and obtain explicit approval before creating it.
4. If an issue tracker is selected (not "none"), ask for the required provider configuration (e.g., `repo` string for GitHub or `project` string for Jira). Propose `.architecture-guard/sync.yml` with the chosen provider, project/repo string, and `enabled: true`; obtain explicit approval before creating it.

If the user selects Claude Code Agent Teams:
1. Read the proposed Architecture Guard role profile by resolving `agents_template` with `architecture-guard resolve template agents_template`. A local `.architecture-guard/templates/agents_template.yml` override is used automatically when present; do not assume vendor files exist. It is the full catalog of roles; the project keeps only the roles it needs.
2. Explain that the profile is not a native Claude Code configuration file. Each kept role becomes a Claude Code agent type at `.claude/agents/agteam-<role>.md`, which limits that teammate to the role's `allowed_tools`.
3. **Team Roster Interview.** Recommend a roster from evidence before asking, then let the user confirm or adjust:
   - Inspect the repository (each repository listed under `repositories` in `.architecture-guard/config.yml`, when present) and reuse the Technology Stack and Application Type answers:
     - Frontend evidence: UI framework dependencies (for example React, Vue, Angular, Svelte, Next.js, Nuxt, React Native), view or component directories, server-rendered templates.
     - Backend evidence: server framework, API routes or controllers, database migrations, queue workers or jobs.
     - Test evidence: a test runner configuration, test directories, or a constitution rule that requires tests.
   - Always keep **Analyst Creator**, **Analyst Reviewer**, and **Code Reviewer**: they review each other's work and are not tied to a stack layer.
   - Keep **Implementor - BE** only with backend evidence, **Implementor - FE** only with frontend evidence (web or mobile UI), and **Implementor - Unit Test** when tests exist or are required. A backend-only API has no FE implementor; a static or UI-only project has no BE implementor.
   - When the evidence for a role is missing or contradictory, say so and recommend leaving the role out. Work for a role that is not in the roster stays in the lead session, and the role can be added later.
   - Ask:

   ```text
   Recommended Agent Teams roster for this project:
   - Analyst Creator, Analyst Reviewer, Code Reviewer (always)
   - Implementor - BE: [keep / leave out] — [evidence]
   - Implementor - FE: [keep / leave out] — [evidence]
   - Implementor - Unit Test: [keep / leave out] — [evidence]
   Teammates: [N]. Claude Code suggests 3-5; each teammate is a separate session with its own token cost.

   Accept this roster, or adjust it (keep or leave out a role, or add a custom implementor such as Mobile or Data)?
   ```

   - A custom implementor needs a role key, name, description, system prompt, a unique uppercase `task_tag` (for example `MOBILE`), and `allowed_tools` of `Read`, `Write`, `Edit`, `Bash`.
   - Then ask: "Run every teammate on the lead session's model (default), or a smaller model for implementors to reduce cost?" Record the answer as each role's `model` (`inherit` by default).
4. Build `.architecture-guard/agents.yml` from the catalog with only the confirmed roles. Remove `can_message` entries that name a removed role.
5. Include `.architecture-guard/agents.yml`, the exact `{adapter_path:constitution}` changes, and the role files that will be generated or removed in the write preview, then require explicit approval before any write.
6. After approval, set `topology: claude-code-agent-teams`, record the roster and role boundaries in `{adapter_path:constitution}`, and write the profile.
7. Run `architecture-guard sync-team-roles` to generate `.claude/agents/agteam-<role>.md` for each kept role and remove generated files for roles left out. It never touches agent files it did not generate. The command validates the whole profile first: every role needs at least one of `Read`, `Write`, `Edit`, `Grep`, `Glob`, `Bash` in `allowed_tools` (otherwise the teammate would inherit every tool), role keys must map to distinct file names (`mobile_ui` and `mobile-ui` collide), and `roles` must be a mapping (`roles: {}` for an empty roster). If any check fails it changes no files, lists the problems, and exits non-zero; fix the profile and run it again. If the CLI is unavailable, report the command for the user to run.
8. Note that Agent Teams also requires host support and `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Fall back to single-agent execution when either is absent.

---

### Architecture Context Budget

After the project shape is understood, ask:

```text
Would you like Budgeted Architecture Context Retrieval?

- Targeted (default): preserve the existing Flash-Mem-first workflow.
- Budgeted: cap initial Flash-Mem retrieval, use `{adapter_path:fallback-spec-index}` only when supported and memory is unavailable or insufficient, and open historical specs only for named gaps.

Budgeted mode is mainly useful when a repository has many historical feature specs. It does not replace active feature artifacts and does not guarantee savings until benchmarked on this project.
```

If the user selects Budgeted:

1. If `{adapter_path:governance-config}` resolves to the same file as `{adapter_path:constitution}`, `{adapter_path:arch-constitution}`, or `{adapter_path:security-constitution}`, stop and report an adapter configuration error: operational settings must not be written into a constitution.
2. Add a `context` block with `mode: budgeted` to `{adapter_path:governance-config}`, based on the bundled `architecture_guard_config.yml` template (`architecture-guard resolve template architecture_guard_config`). Merge into the existing file; keep its other keys (such as `adapter`, `presets`, and `repository_hygiene`). Omit `context.fallback_file`; the adapter's `fallback-spec-index` mapping governs the fallback location.
3. Preserve the default retrieval limits unless the user explicitly requests different limits.
4. If feature specs already exist, offer to run `ag-consolidate-specs` after constitution generation is complete; it follows {adapter_command:consolidate-specs} and writes only after its own confirmation.

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

1. Resolve its preset with `architecture-guard resolve preset <preset>` so a workspace override under `.architecture-guard/presets/` takes precedence over the bundled preset.
2. Locate `## Init Interview` and read that section through the next level-two heading. Do not load unrelated review guidance solely to run the interview when the host can read a section selectively.
3. Merge the preset questions into the matching generic interview phases. Ask them sequentially and only when relevant to the selected application type or an earlier answer; do not ask a generic and preset question twice when they seek the same decision.
   - Preset `### API Conventions & Tooling` questions belong to Phase 3.
   - Preset `### Code Style & Tooling` questions belong to Phase 6.
   - When a preset question overlaps a generic question, ask the preset wording only when it adds framework-specific detail; otherwise ask the generic question once and record the answer for both decisions.
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

Ask:

```text
Are there specific subfolder conventions for features/modules?
(Only ask if the project has or plans more than a trivial single-module shape)

Examples:
- consistent subfolders (dto/, entities/, interfaces/, guards/, strategy/)
```

---

# Phase 3 — Contracts & API Conventions

Determine:

* validation strategy
* request/response contracts (REST/API conventions)
* API documentation standards
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

Ask:

```text
What are the generic REST/API contract conventions?

Examples:
- status code conventions per verb
- pagination shape
- error response shape / error codes
- versioning strategy
```

---

Ask:

```text
What is the API documentation strategy?

Examples:
- Is Swagger/OpenAPI (or equivalent) required?
- Does its presence gate merge/review?
```

---

## Preset Contract Questions

If the selected preset's `## Init Interview` includes contract or validation questions, ask them during this phase unless an earlier answer already resolves them. Do not ask the same question twice.

Preset API-convention questions are also part of this phase. Ask them only when the selected application exposes the relevant kind of API, using the deduplication rule above.

---

# Phase 4 — Data Access & Async Rules

Determine:

* ORM strategy
* repository usage
* query ownership
* async boundaries
* background processing rules
* performance constraints (optional)

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

Ask:

```text
Are there performance constraints the project must meet? (Optional; answer "none" to skip.)

Examples:
- latency target for key endpoints (e.g. p95 under 300 ms)
- maximum page size for list endpoints
- expected data volume (rows per table, items per request)
- caching rules (what may be cached, and for how long)
```

Record only constraints the user states, under `Performance Constraints` in `{adapter_path:arch-constitution}`. Do not suggest targets the user has not asked for. If the answer is "none", write `Not applicable`; reviews then treat performance as advisory.

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

Ask:

```text
Does a developer/operational guide already exist, or will one be maintained?

Examples:
- setup steps, DB migration/seed commands
- CI/release process
- third-party integration configs (OIDC providers, CORS setup)

(If yes, record its path as a "Useful file refs" entry in the generated constitution instead of absorbing that operational content into the constitution itself.)
```

---

Ask:

```text
If the active adapter's Constitution Layout supports per-artifact rules, do you want lightweight checklists for its artifacts?
(Use only the rule keys the adapter's Constitution Layout allows. Verification/testing rules belong in the shared governance context.)
(Skip if the active adapter lacks a per-artifact rule mechanism)
```

---

# Phase 6 — Code Style & Tooling

Determine:

* linting/formatting strictness and progressive rollout policy
* naming conventions across identifier kinds
* forbidden/required patterns and enforcement subset
* logging standards (structured vs console, levels, retention if applicable)

If the selected preset's `## Init Interview` includes a `### Code Style & Tooling` section, merge those questions here. Ask framework-specific questions only when the project uses the corresponding tool or pattern; do not turn examples into mandatory rules.

---

## Questions

Ask:

```text
How strict should code styling and tooling be enforced?

Examples:
- lint/format as advisory or blocking
- is there a progressive-strictness policy (e.g., rules start at warn and promote to error once stable)? (Capture as explicit rollout policy)
```

---

Ask:

```text
What are the naming conventions per identifier kind?

(Ask for a short table covering variables, booleans, types/classes/interfaces, enum members, constants, object literal keys - don't invent one)
```

---

Ask:

```text
Are there any general forbidden/required patterns?

Examples:
- no console.log in committed code
- no implicit any, explicit return types
- strict equality, no wrapper-object constructors
- secure randomness instead of Math.random() for security-sensitive values

(Ask what subset of these the project actually wants enforced rather than dumping a fixed checklist)
```

---

Ask:

```text
What is the logging standard?

Examples:
- structured logger vs console.log
- log levels
- rotation/retention rules (only ask retention specifics if the project already has or plans a logging module)
```

---

# Rule Classification Logic

Before generating rules, classify them.

---

## Global Governance Rules → `{adapter_path:constitution}`

Examples:

* testing philosophy
* documentation standards
* security requirements
* review expectations
* engineering philosophy (Ponytail principles, YAGNI, minimal abstractions)
* operational governance
* naming conventions, linting strictness, and code style rules

---

## Architecture Enforcement Rules → `{adapter_path:arch-constitution}`

Examples:

* controller/service boundaries
* DTO requirements
* use-case invocation style and its framework implementation, when selected
* DTO strategy and its framework implementation, when selected
* authorization strategy and its framework implementation, when selected
* validation placement
* async boundaries
* performance constraints the user declared (targets and limits only)
* response contracts and REST/API conventions
* module ownership rules
* module and feature subfolder shapes
* framework-specific architecture and decorator patterns
* DRY and single-source-of-truth rules for repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration
* temporary/scratch files MUST use `-temp` or `-test` suffixes for easier cleanup

---

# Duplication Prevention Rules

DO NOT duplicate rules across both files.

If a rule exists in:

```text
{adapter_path:arch-constitution}
```

Then:

```text
{adapter_path:constitution}
```

should reference architecture rules instead of repeating implementation details.

---

GOOD:

```text
{adapter_path:constitution}:
- Architecture enforcement rules are defined in `{adapter_path:arch-constitution}`
```

```text
{adapter_path:arch-constitution}:
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

Before creating, modifying, deleting, moving, or scaffolding any file or directory, show the exact target paths and proposed operations and obtain explicit user approval. Interviewing, detection, analysis, and previews remain read-only. This applies to `{adapter_path:draft}`, team scaffolds, Generic user-provided paths, optional split constitution files, and `{adapter_path:governance-config}`.

---

# Output Requirements

Generate or refine:

* `{adapter_path:constitution}`
* `{adapter_path:arch-constitution}`
* `{adapter_path:security-constitution}`

When Budgeted Architecture Context Retrieval is selected, also generate `{adapter_path:governance-config}`. Missing configuration means targeted mode, preserving backward compatibility.

If the `flash-mem` MCP server is available, propose changed-artifact captures and durable `add_memory` or `update_memory` entries, then execute only those the user explicitly approves. For major changes in architecture, boundaries, or governance rules, propose `update_project_summary` and call it only after explicit permission. If Flash-Mem is unavailable, rely on repository files and continue without sync.

---

## Constitution Structures

When the selected adapter's Constitution Layout section defines the section list for a file, the adapter's layout wins. The structures below are the default for files the adapter does not lay out, and a reference for optional sections (such as Useful File References) an adapter layout may add.

## `{adapter_path:constitution}` Structure

```text
1. Project Identity
2. Engineering Philosophy
3. Security Expectations
4. Testing Expectations
5. Documentation Standards
6. Review Process
7. High-Level Architecture Intent
8. Governance and Evolution Policy
9. Useful File References (optional)
10. Per-Artifact Rules (only when the adapter's Constitution Layout supports them)
```

---

## `{adapter_path:arch-constitution}` Structure

```text
1. Architecture Style
2. Layer Boundaries
3. Business Logic Placement
4. Contracts & Validation
5. Data Access Rules
6. Async & Integration Rules
7. Performance Constraints
8. Module Boundaries
9. Code Style & Tooling Rules
10. Framework-Specific Architecture Rules
11. Blocking Architecture Violations (P0)
12. Architecture Evolution Policy
13. Refactor & Drift Handling
14. Useful File References (optional)
15. Per-Artifact Rules (only when the adapter's Constitution Layout supports them)
```

---

## `{adapter_path:security-constitution}` Structure

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
* target `{adapter_path:arch-constitution}` by default
* only propose updates to `{adapter_path:constitution}` for governance-level changes

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

---

## Framework Output

The init interview produces framework-specific constitution files:

The init interview writes the constitution files the active adapter maps: `{adapter_path:constitution}`, `{adapter_path:arch-constitution}`, and `{adapter_path:security-constitution}`. Follow the adapter's Constitution Layout section for format and for any per-artifact rule constraints. When the adapter marks the architecture or security file as an optional split, reconcile it with `{adapter_path:constitution}` so each rule has one canonical owner.

---
