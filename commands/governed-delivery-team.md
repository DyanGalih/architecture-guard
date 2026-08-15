---
description: Run team delivery with stakeholder approval of the User Story before governed planning and task generation.
---

# Governed Team Delivery Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). At each resumable phase, its active feature artifacts and applicable constitutions are mandatory and authoritative. Reuse one Flash-Mem synthesis across planning and task generation; do not load `system_context.md` when that synthesis is sufficient.

You are orchestrating `ag-governed-delivery-team`, the recommended team workflow entry point for Architecture Guard.

This command coordinates business collaboration via User Story generation before running the existing governed planning and task phases.

## Goal

Produce an approved User Story and an implementation-ready `tasks.md` from an accepted technical plan while ensuring:

1. A business-oriented User Story is generated before engineering execution.
2. Flash-Mem context is retrieved before planning or task generation when the MCP server is available.
3. The plan passes its architecture and applicable security gates before tasks are generated.
4. Tasks are regenerated or reconciled whenever their source plan changes materially.
5. Advisory findings remain non-blocking, while Constitution P0 architecture findings and findings marked blocking by Security Review policy stop progression independently.
6. A rerun resumes safely instead of recreating valid artifacts.

## Write Approval Gate

Before the first mutation, resolve and preview the exact branch, feature/change container, User Story, plan, and task artifacts together with all planned creation, status, linkage, generation, repair, and reconciliation operations. Obtain explicit user approval, then allow routine writes already previewed within this team-delivery phase scope without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

## Mandatory Branch Preflight

Before creating, planning, or modifying any active change:

1. Run `git branch --show-current`.
2. If the branch is `main`, `master`, `dev`, `staging`, or another protected branch:
   - MUST create and switch to `feature/<change-name>`.
   - MUST NOT continue on the protected branch.
3. If already on a feature branch, reuse it.
4. Preserve existing uncommitted changes; never reset or discard them.
5. Report the selected branch before creating artifacts.

## Phase 1 — Detect the Active Feature and Integrations

1. Resolve the active feature from the user's explicit path, Spec Kit feature metadata, current branch, or a single unambiguous directory under `specs/`, in that order.
2. If no active feature directories exist (ignoring archives), automatically derive a kebab-case name from the user's goal and create the new feature directory using the active SDD tool's workflow.
3. Do not guess when multiple feature directories are plausible. Ask the user to identify the feature.
4. Detect `flash-mem` as an MCP service. Do not look for it in `.specify/extensions.yml`.
5. Inspect the installed list in `.specify/extensions.yml` for `security-review` or its compatibility alias `spec-kit-security-review`. Manifest presence alone is not availability.
6. For each phase, select the SpecKit integration only after verifying its applicable command is registered and callable: `/speckit.security-review.plan` for plan review and `/speckit.security-review.tasks` for task review. If an applicable command is absent, detect an independently registered Architecture Guard-compatible Security Review host capability and use its corresponding plan or tasks operation. If neither path is callable, mark that phase's Security Review `Unavailable` and degrade without claiming a pass.
7. Detect OpenSpec by looking for `openspec/config.yaml` or an `openspec` directory.
8. Read constitution files directly when present because they may be ignored by repository search:
   - `.specify/memory/constitution.md`
   - `.specify/memory/architecture_constitution.md`
   - `.specify/memory/security_constitution.md`

## Phase 2 — Mandatory Memory Preflight When Available

When Flash-Mem is available, execute both operations before planning, reviewing, or generating tasks:

1. `get_project_summary`
2. `search_memory` scoped to the active feature, architecture boundaries, security-sensitive areas, prior decisions, approved exceptions, and related files

Prefer summaries, metadata, tags, confidence, and related files. Load full entries only when those results are insufficient. If Flash-Mem is unavailable, continue with repository artifacts and report the degraded state.

## Phase 3 — Branch Management

Before generating artifacts or modifying files, you MUST ensure work happens on a feature branch.
1. Check the current git branch.
2. If on `main`, `master`, `dev*` (e.g., `dev`, `develop`, `development`), or `staging`, ask the user if they want to create a new branch for this feature.
3. If they approve, create the branch using available tools before proceeding.

## Phase 4 — Generate User Story

Before engineering planning begins, generate a business-oriented User Story representing the approved business intent.

1. Look in the root `<root>/user-stories/` directory. If multiple stories exist, use an interactive prompt to ask the user which User Story they are fulfilling, or if they want to create a new one.
2. If creating a new story, analyze the Discovery context and generate a User Story containing:
   - Business objective
   - User stories
   - Acceptance criteria
   - Business rules
   - Out of scope items
   - Assumptions
   - Risks
   - Open questions
3. Ensure the User Story is understandable by technical and non-technical stakeholders.
4. Persist the generated User Story as `<feature-name>.md` in the `<root>/user-stories/` directory with status `draft`.
5. Present it for stakeholder review and stop before engineering planning until the user explicitly accepts it. Record the result as `approved` in the file.
6. Once the User Story is approved, check for the presence of `.architecture-guard/sync.yml`. If it exists:
   - Run `npx tsx src/cli/validate-sync-config.ts` to strictly validate the configuration.
   - If the configuration is valid and `enabled: true`, preview the configured provider and project/repository target and require explicit user approval of that target before any remote write.
   - Before creating anything, inspect `.architecture-guard/sync_status.json` and query the approved target for an existing item linked to this User Story. Reuse a confirmed match; never create a duplicate. Reruns with unchanged content and a confirmed remote ID are a no-op, while changed content updates that same remote item when supported.
   - After approval and duplicate checks, read the User Story content and create or update it through the configured provider (e.g., via `github-mcp-server`).
   - Record `status: success` only after the provider returns and confirms a stable remote ID and URL. Persist that identity and target in `.architecture-guard/sync_status.json`; a missing or unconfirmed remote ID is a failed sync, not success.
   - If the push fails, write `{ "status": "failed" }` to `.architecture-guard/sync_status.json` and output a non-blocking warning. Do NOT stop the delivery workflow.
7. If a previously approved User Story has been modified after engineering artifacts were generated, mark it `review-required`, warn the user, and require re-approval before proceeding.

## Phase 5 — Spec & Proposal Gate

Check if a formal specification or proposal already exists for the active feature. If missing, automatically generate it using the available discovery context or prompt the user for input:

1. **If OpenSpec is detected:** Run the OpenSpec proposal generation (`openspec new change`) to define what to build. Ensure all OpenSpec artifacts (`proposal.md`, `design.md`, `specs/**/*.md`, `tasks.md`) are generated and wired into the corresponding SpecKit directories for subsequent validation.
2. **If SpecKit (without OpenSpec) is detected:** Automatically run `/ag-governed-spec` to generate `spec.md` from the discovery draft.

## Phase 6 — Inspect Resume State

Inspect `spec.md` (or equivalent specification artifacts), the technical design artifact, `tasks.md`, `security-constraints.md`, and available architecture review artifacts for the active feature.

Classify the plan:

- `missing`: the design artifact (the technical design artifact, `design.md`, or `proposal.md`) does not exist or is empty.
- `stale`: `spec.md` or governing constraints changed materially after the plan was produced.
- `blocked`: an unresolved Constitution P0 architecture finding, independently blocking Security Review finding, or material design decision prevents safe task generation.
- `review-required`: the plan exists but has not been validated against current inputs.
- `accepted`: the plan matches current inputs and has no unresolved blocking findings.

Classify tasks:

- `missing`: `tasks.md` does not exist or is empty.
- `stale`: the accepted plan changed materially after tasks were produced.
- `review-required`: tasks exist but have not been analyzed against the accepted plan and current constraints.
- `accepted`: tasks align with the accepted plan and have no unresolved blocking gaps.

Do not use timestamps as the only evidence of material staleness. Compare artifact intent and content when possible.

## Phase 7 — Plan Gate

If the plan is `missing` or `stale`, execute the full `/ag-governed-plan` (or `/ag-governed-plan`) workflow.
- **Linkage metadata**: When generating the new technical plan (the technical design artifact, `design.md`, or `proposal.md`), inject the YAML frontmatter `Story: ../../../user-stories/<selected-story>.md` to establish the explicit link between the technical change and the business epic.

If the plan is `review-required`, reuse it and run the selected security plan operation plus `/ag-review-artifacts`. Recheck command or host-operation registration immediately before dispatch. Do not regenerate a plan merely because review is needed.

- Continue automatically when there are no blocking findings.
- Record advisory architecture drift without stopping.
- Stop before task generation for unresolved Constitution P0 architecture findings or independently blocking Security Review findings.
- Stop when resolution requires a material product or architecture choice.
- When a safe correction is already authorized, repair the plan, rerun affected reviews, and continue.

The plan does not need to be perfect. It must be sufficiently stable and free of unresolved blocking findings.

## Phase 8 — Task Generation and Analysis

Only enter this phase after the plan is `accepted`.

If tasks are `missing`, `stale`, or `review-required`, execute `/ag-governed-tasks` (or `/ag-governed-tasks`) with the accepted plan and cached context.

The governed task phase must:

1. Generate or reconcile `tasks.md` through `/speckit.tasks` (or the SDD tool's native task generator/inline fallback).
2. Run the selected security tasks operation, after rechecking that the command or host operation is registered.
3. Convert confirmed architecture findings into explicit work through `ag-refactor-generator`.
4. Run analysis (e.g., `/speckit.analyze`) against the complete plan and task set if available in the SDD tool.
5. Keep implementation, security, migration, and refactor work explicit.

If analysis exposes a plan defect, mark the plan and tasks stale, return to the Plan Gate, and propagate the accepted correction back into tasks.

## Phase 9 — Durable Memory Preservation

When Flash-Mem is available:

1. Propose artifact captures and durable-memory entries, showing their sources and content summary.
2. Execute `capture_artifact_memory`, `add_memory`, or `update_memory` only after explicit user approval.
3. Store only validated decisions, constraints, approved exceptions, recurring violations, and reusable patterns; never store transient run status, speculative findings, secrets, or duplicate synthesis snapshots.

## Output

Return a concise `Governed Team Delivery Summary`:

```markdown
# Governed Team Delivery Summary

## Workflow State
- **Feature**: [feature path]
- **Memory**: [Ready / Unavailable]
- **User Story**: [Generated / Reused / Out of Sync]
- **Plan**: [Generated / Reused / Repaired / Blocked]
- **Plan Security Review**: [Passed / Advisory / Blocked / Not Applicable / Unavailable]
- **Plan Architecture Review**: [Passed / Advisory / Blocked]
- **Tasks**: [Generated / Reconciled / Reused / Blocked]
- **Task Security Review**: [Passed / Advisory / Blocked / Not Applicable / Unavailable]
- **Analysis**: [Passed / Repaired / Blocked]

## Findings
- **Blocking**: [None or explicit findings]
- **Advisory**: [Non-blocking findings]

## Next Step
- [Continue to governed-implement, resolve a blocking decision, or rerun a targeted phase]
```

## Targeted Recovery Commands

- Plan problem: run `ag-governed-plan`, then `ag-governed-tasks` because tasks may be stale.
- Task-only problem: run `ag-governed-tasks`.
- Unknown or cross-phase problem: rerun `ag-governed-delivery-team`.

## Guardrails

- Remain SDD-tool-agnostic unless a preset or constitution supplies application-framework vocabulary.
- Prefer minimal, incremental corrections and standard platform capabilities.
- Do not silently pass a blocking finding.
- Do not convert advisory preferences into release gates.
- Never generate tasks from a blocked plan.
