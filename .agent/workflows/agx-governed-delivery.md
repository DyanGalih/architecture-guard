---
description: Resume governed delivery from an active specification through plan and task generation, with optional Flash-Mem context, security review, architecture gates, task reconciliation, and analysis.
---

# Governed Delivery Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `{adapter_path:budgeted-context-template}`. At each resumable phase, active adapter artifacts and applicable constitutions are authoritative. Reuse one sufficient Flash-Mem synthesis instead of loading a fallback index.

You are orchestrating `ag-governed-delivery`, the recommended plan-to-tasks entry point for Architecture Guard.

This command coordinates the existing governed planning and task phases. It does not replace their rules or duplicate their review logic. It inspects the active feature, resumes from the first invalid phase, and stops only when a blocking decision requires user input.

## Goal

Produce an implementation-ready `tasks.md` from an accepted technical plan while ensuring:

1. Flash-Mem context is retrieved before planning or task generation when the MCP server is available.
2. The plan passes its architecture and applicable security gates before tasks are generated.
3. Tasks are regenerated or reconciled whenever their source plan changes materially.
4. Advisory findings remain non-blocking, while P0 findings always stop progression; security findings block only when governing policy assigns blocking severity.
5. A rerun resumes safely instead of recreating valid artifacts.

## Write Approval Gate

Before the first mutation, resolve and preview the exact branch, change container, specification, plan, and task artifacts together with all planned creation, generation, repair, and reconciliation operations. Obtain explicit user approval, then allow routine writes already previewed within this delivery phase scope without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

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
2. If no active feature directories exist (ignoring archives like `openspec/changes/archive/`), automatically derive a kebab-case name from the user's goal, execute `{adapter_command:create-change}`, then execute `{adapter_command:create-spec}` for that new active work. Stop before planning if either step fails or the resulting specification is empty.
3. If an existing active feature is resolved but its specification is missing or empty, execute `{adapter_command:create-spec}` for that active work. Stop before planning if the command fails or the resulting specification remains empty.
4. Do not guess when multiple active feature directories are plausible. Ask the user to identify the feature.
5. Detect `flash-mem` as an MCP service. Do not look for it in `{adapter_path:extensions}`.
6. Detect Security Review as an independent host capability. It is not an SDD tool feature or extension; detect it from host registrations and never read `{adapter_path:extensions}` for it.
7. Read constitution files directly when present because they may be ignored by repository search:
   - `{adapter_path:constitution}`
   - `{adapter_path:arch-constitution}`
    - `{adapter_path:security-constitution}`
   Missing optional split constitutions are not errors: fall back to the governance/context sections in `{adapter_path:constitution}`. If no applicable constitution exists, continue with generic Architecture Guard rules and report the degraded state.
8. Load `{adapter_path:governance-config}` and `{adapter_path:hygiene-rules}` when present. Apply configured exclusions and severity policy at the plan and task gates; missing optional hygiene configuration is non-blocking and must be reported.

## Phase 2 — Mandatory Memory Preflight When Available

When Flash-Mem is available, execute both operations before planning, reviewing, or generating tasks:

1. `get_project_summary`
2. `search_memory` scoped to the active feature, architecture boundaries, security-sensitive areas, prior decisions, approved exceptions, and related files

Prefer summaries, metadata, tags, confidence, and related files. Load full entries only when those results are insufficient. If Flash-Mem is unavailable, continue with repository artifacts and report the degraded state.

## Phase 3 — Inspect Resume State

Inspect `spec.md`, the technical design artifact, `tasks.md`, `security-constraints.md`, and available architecture review artifacts for the active feature.

Classify the plan:

- `missing`: the technical design artifact does not exist or is empty.
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

## Phase 4 — Plan Gate

If the plan is `missing` or `stale`, run `ag-governed-plan` with the active feature context.

If the plan is `review-required`, reuse it and run the applicable security plan review plus the adapter-registered violation-detection capability. Do not regenerate a plan merely because review is needed.

- Continue automatically when there are no blocking findings.
- Record advisory architecture drift without stopping.
- Stop before task generation for unresolved P0 findings or security findings that governing policy marks blocking. P0 cannot be overridden by a simple proceed prompt.
- Stop when resolution requires a material product or architecture choice.
- When a safe correction is already authorized, repair the plan, rerun affected reviews, and continue.
- Run plan-scope repository hygiene checks. Block only findings whose effective severity is configured to fail; report all others as advisory.

The plan does not need to be perfect. It must be sufficiently stable and free of unresolved blocking findings.

## Phase 5 — Task Generation and Analysis

Only enter this phase after the plan is `accepted`.

If tasks are `missing`, `stale`, or `review-required`, run `ag-governed-tasks` with the accepted plan and cached context.

The governed task phase must:

1. Generate or reconcile `tasks.md` through `{adapter_command:create-tasks}` or its documented inline fallback.
2. Run the applicable security task review.
3. Convert confirmed architecture findings into explicit work through `{adapter_command:refactor-generator}`.
4. Run `{adapter_command:analyze}` against the complete plan and task set.
5. Keep implementation, security, migration, and refactor work explicit.
6. Run task-scope repository hygiene checks with the same configured severity policy.

If analysis exposes a plan defect, mark the plan and tasks stale, return to the Plan Gate, and propagate the accepted correction back into tasks.

## Phase 6 — Durable Memory Preservation

When Flash-Mem is available:

1. Propose artifact captures and durable-memory entries, showing their sources and content summary.
2. Execute `capture_artifact_memory`, `add_memory`, or `update_memory` only after explicit user approval.
3. Store only validated decisions, constraints, approved exceptions, recurring violations, and reusable patterns; never store transient run status, speculative findings, secrets, or duplicate synthesis snapshots.

## Output

Return a concise `Governed Delivery Summary`:

```markdown
# Governed Delivery Summary

## Workflow State
- **Feature**: [feature path]
- **Memory**: [Ready / Unavailable]
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
- Unknown or cross-phase problem: rerun `ag-governed-delivery`.

## Guardrails

- Remain SDD-tool-agnostic unless a preset or constitution supplies application-framework vocabulary.
- Prefer minimal, incremental corrections and standard platform capabilities.
- Do not silently pass a blocking finding.
- Do not convert advisory preferences into release gates.
- Never generate tasks from a blocked plan.


## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `commands/governed-delivery.md` for direct SpecKit use.
