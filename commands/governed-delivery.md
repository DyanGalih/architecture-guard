---
description: Run the recommended resumable plan-to-tasks workflow with Flash-Mem context, security review, architecture gates, and Spec Kit analysis.
---

# Governed Delivery Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). At each resumable phase, its active feature artifacts and applicable constitutions are mandatory and authoritative. Reuse one Flash-Mem synthesis across planning and task generation; do not load `system_context.md` when that synthesis is sufficient.

You are orchestrating `governed-delivery`, the recommended plan-to-tasks entry point for Architecture Guard.

This command coordinates the existing governed planning and task phases. It does not replace their rules or duplicate their review logic. It inspects the active feature, resumes from the first invalid phase, and stops only when a blocking decision requires user input.

## Goal

Produce an implementation-ready `tasks.md` from an accepted technical plan while ensuring:

1. Flash-Mem context is retrieved before planning or task generation when the MCP server is available.
2. The plan passes its architecture and applicable security gates before tasks are generated.
3. Tasks are regenerated or reconciled whenever their source plan changes materially.
4. Advisory findings remain non-blocking, while P0 architecture findings and Critical security findings stop progression.
5. A rerun resumes safely instead of recreating valid artifacts.

## Phase 1 — Detect the Active Feature and Integrations

1. Resolve the active feature from the user's explicit path, Spec Kit feature metadata, current branch, or a single unambiguous directory under `specs/`, in that order.
2. Do not guess when multiple feature directories are plausible. Ask the user to identify the feature.
3. Detect `flash-mem` as an MCP service. Do not look for it in `.specify/extensions.yml`.
4. Detect Security Review from `.specify/extensions.yml`. Accept `security-review` as the canonical extension id and `spec-kit-security-review` as a compatibility alias.
5. Read constitution files directly when present because they may be ignored by repository search:
   - `.specify/memory/constitution.md`
   - `.specify/memory/architecture_constitution.md`
   - `.specify/memory/security_constitution.md`

## Phase 2 — Mandatory Memory Preflight When Available

When Flash-Mem is available, execute both operations before planning, reviewing, or generating tasks:

1. `get_project_summary`
2. `search_memory` scoped to the active feature, architecture boundaries, security-sensitive areas, prior decisions, approved exceptions, and related files

Prefer summaries, metadata, tags, confidence, and related files. Load full entries only when those results are insufficient. If Flash-Mem is unavailable, continue with repository artifacts and report the degraded state.

## Phase 3 — Inspect Resume State

Inspect `spec.md`, `plan.md`, `tasks.md`, `security-constraints.md`, and available architecture review artifacts for the active feature.

Classify the plan:

- `missing`: `plan.md` does not exist or is empty.
- `stale`: `spec.md` or governing constraints changed materially after the plan was produced.
- `blocked`: an unresolved P0 architecture finding, Critical security finding, or material design decision prevents safe task generation.
- `review-required`: the plan exists but has not been validated against current inputs.
- `accepted`: the plan matches current inputs and has no unresolved blocking findings.

Classify tasks:

- `missing`: `tasks.md` does not exist or is empty.
- `stale`: the accepted plan changed materially after tasks were produced.
- `review-required`: tasks exist but have not been analyzed against the accepted plan and current constraints.
- `accepted`: tasks align with the accepted plan and have no unresolved blocking gaps.

Do not use timestamps as the only evidence of material staleness. Compare artifact intent and content when possible.

## Phase 4 — Plan Gate

If the plan is `missing` or `stale`, execute the full `/speckit.architecture-guard.governed-plan` workflow.

If the plan is `review-required`, reuse it and run the applicable security plan review plus `/speckit.architecture-guard.violation-detection`. Do not regenerate a plan merely because review is needed.

- Continue automatically when there are no blocking findings.
- Record advisory architecture drift without stopping.
- Stop before task generation for unresolved P0 architecture or Critical security findings.
- Stop when resolution requires a material product or architecture choice.
- When a safe correction is already authorized, repair the plan, rerun affected reviews, and continue.

The plan does not need to be perfect. It must be sufficiently stable and free of unresolved blocking findings.

## Phase 5 — Task Generation and Analysis

Only enter this phase after the plan is `accepted`.

If tasks are `missing`, `stale`, or `review-required`, execute `/speckit.architecture-guard.governed-tasks` with the accepted plan and cached context.

The governed task phase must:

1. Generate or reconcile `tasks.md` through `/speckit.tasks` or its documented inline fallback.
2. Run the applicable security task review.
3. Convert confirmed architecture findings into explicit work through `refactor-generator`.
4. Run `/speckit.analyze` against the complete plan and task set.
5. Keep implementation, security, migration, and refactor work explicit.

If analysis exposes a plan defect, mark the plan and tasks stale, return to the Plan Gate, and propagate the accepted correction back into tasks.

## Phase 6 — Durable Memory Preservation

When Flash-Mem is available:

1. Capture changed durable artifacts with `capture_artifact_memory` using the appropriate source type.
2. Add or update durable memory only for validated decisions, constraints, approved exceptions, recurring violations, and reusable patterns.
3. Do not store transient run status, speculative findings, secrets, or duplicate synthesis snapshots.

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

- Plan problem: run `governed-plan`, then `governed-tasks` because tasks may be stale.
- Task-only problem: run `governed-tasks`.
- Unknown or cross-phase problem: rerun `governed-delivery`.

## Guardrails

- Remain framework-agnostic unless a preset or constitution supplies framework-specific vocabulary.
- Prefer minimal, incremental corrections and standard platform capabilities.
- Do not silently pass a blocking finding.
- Do not convert advisory preferences into release gates.
- Never generate tasks from a blocked plan.
