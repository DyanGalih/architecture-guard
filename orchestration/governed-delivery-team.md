---
description: Run team delivery with stakeholder approval of the User Story before governed planning and task generation.
---

# Governed Team Delivery Command

## SDD Tool Detection

Before executing command, read `adapters/detect.md` to determine the active SDD tool. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `{adapter_path:budgeted-context-template}`. At each resumable phase, active adapter artifacts and applicable constitutions are authoritative. Reuse one sufficient Flash-Mem synthesis instead of loading a fallback index.

You are orchestrating `ag-governed-delivery-team`, the recommended team workflow entry point for Architecture Guard.

This command coordinates business collaboration via User Story generation before running the existing governed planning and task phases.

## Goal

Produce an approved User Story and an implementation-ready `tasks.md` from an accepted technical plan while ensuring:

1. A business-oriented User Story is generated before engineering execution.
2. Flash-Mem context is retrieved before planning or task generation when the MCP server is available.
3. The plan passes its architecture and applicable security gates before tasks are generated.
4. Tasks are regenerated or reconciled whenever their source plan changes materially.
5. Advisory findings remain non-blocking, while P0 findings always stop progression; security findings block only when governing policy assigns blocking severity.
6. A rerun resumes safely instead of recreating valid artifacts.

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

1. Resolve the active work from the user's explicit path, adapter artifact paths, current branch metadata when supported, or one unambiguous result from `{adapter_command:list-specs}`, in that order.
2. If no active feature directories exist (ignoring archives like `openspec/changes/archive/`), automatically derive a kebab-case name from the user's goal and create the new feature directory using the active SDD tool's workflow.
3. Do not guess when multiple active feature directories are plausible. Ask the user to identify the feature.
4. Detect `flash-mem` as an MCP service. Do not look for it in `{adapter_path:extensions}`.
5. Detect Security Review from the adapter when it declares a supported extensions artifact; otherwise use host capability detection. Accept `security-review` as the canonical extension id and `spec-kit-security-review` as a compatibility alias.
6. Read constitution files directly when present because they may be ignored by repository search:
   - `{adapter_path:constitution}`
   - `{adapter_path:arch-constitution}`
   - `{adapter_path:security-constitution}`

## Phase 2 — Mandatory Memory Preflight When Available

When Flash-Mem is available, execute both operations before planning, reviewing, or generating tasks:

1. `get_project_summary`
2. `search_memory` scoped to the active feature, architecture boundaries, security-sensitive areas, prior decisions, approved exceptions, and related files

Prefer summaries, metadata, tags, confidence, and related files. Load full entries only when those results are insufficient. If Flash-Mem is unavailable, continue with repository artifacts and report the degraded state.

## Phase 3 — Generate User Story

Before engineering planning begins, generate a business-oriented User Story representing the approved business intent.

1. Check if a `user-story.md` file already exists in the active feature directory.
2. If it does not exist, analyze the Discovery context and generate a User Story containing:
   - Business objective
   - User stories
   - Acceptance criteria
   - Business rules
   - Out of scope items
   - Assumptions
   - Risks
   - Open questions
3. Ensure the User Story is understandable by technical and non-technical stakeholders.
4. Persist the generated User Story as `user-story.md` in the active feature directory with status `draft`.
5. Present it for stakeholder review and stop before engineering planning until the user explicitly accepts it. Record the result as `approved` in the file.
6. If a previously approved `user-story.md` has been modified after engineering artifacts were generated, mark it `review-required`, warn the user, and require re-approval before proceeding.

## Phase 4 — Inspect Resume State

Inspect `spec.md`, `plan.md`, `tasks.md`, `security-constraints.md`, and available architecture review artifacts for the active feature.

Classify the plan:

- `missing`: `plan.md` does not exist or is empty.
- `stale`: `spec.md` or governing constraints changed materially after the plan was produced.
- `blocked`: an unresolved P0 finding, policy-designated blocking security finding, or material design decision prevents safe task generation.
- `review-required`: the plan exists but has not been validated against current inputs.
- `accepted`: the plan matches current inputs and has no unresolved blocking findings.

Classify tasks:

- `missing`: `tasks.md` does not exist or is empty.
- `stale`: the accepted plan changed materially after tasks were produced.
- `review-required`: tasks exist but have not been analyzed against the accepted plan and current constraints.
- `accepted`: tasks align with the accepted plan and have no unresolved blocking gaps.

Do not use timestamps as the only evidence of material staleness. Compare artifact intent and content when possible.

## Phase 5 — Plan Gate

If the plan is `missing` or `stale`, run `ag-governed-plan` with the active feature context.

If the plan is `review-required`, reuse it and run the applicable security plan review plus the adapter-registered violation-detection capability. Do not regenerate a plan merely because review is needed.

- Continue automatically when there are no blocking findings.
- Record advisory architecture drift without stopping.
- Stop before task generation for unresolved P0 findings or security findings that governing policy marks blocking. P0 cannot be overridden by a simple proceed prompt.
- Stop when resolution requires a material product or architecture choice.
- When a safe correction is already authorized, repair the plan, rerun affected reviews, and continue.

The plan does not need to be perfect. It must be sufficiently stable and free of unresolved blocking findings.

## Phase 6 — Task Generation and Analysis

Only enter this phase after the plan is `accepted`.

If tasks are `missing`, `stale`, or `review-required`, run `ag-governed-tasks` with the accepted plan and cached context.

The governed task phase must:

1. Generate or reconcile `tasks.md` through `{adapter_command:create-tasks}` or its documented inline fallback.
2. Run the applicable security task review.
3. Convert confirmed architecture findings into explicit work through `{adapter_command:refactor-generator}`.
4. Run `{adapter_command:analyze}` against the complete plan and task set.
5. Keep implementation, security, migration, and refactor work explicit.

If analysis exposes a plan defect, mark the plan and tasks stale, return to the Plan Gate, and propagate the accepted correction back into tasks.

## Phase 7 — Durable Memory Preservation

When Flash-Mem is available:

1. Capture changed durable artifacts with `capture_artifact_memory` using the appropriate source type.
2. Add or update durable memory only for validated decisions, constraints, approved exceptions, recurring violations, and reusable patterns.
3. Do not store transient run status, speculative findings, secrets, or duplicate synthesis snapshots.

## Output

Return a concise `Governed Delivery Summary`:

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

## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `commands/governed-delivery-team.md` for direct SpecKit use.
