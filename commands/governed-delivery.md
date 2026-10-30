---
description: Resume governed delivery from an active specification through plan and task generation, with optional Flash-Mem context, security review, architecture gates, task reconciliation, and analysis.
---

# Governed Delivery Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Capability Composition

Read and apply `.specify/extensions/architecture-guard/templates/capability_composition.md` (or `templates/capability_composition.md` in the extension source checkout) before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name, slash-command spelling, or Markdown path as an invocation. On Spec Kit extension installs, resolve a capability `<capability>` to the registered `speckit.architecture-guard.ag-<capability>` command file in the agent's command directory, or to `.specify/extensions/architecture-guard/commands/<capability>.md`.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). At each resumable phase, its active feature artifacts and applicable constitutions are mandatory and authoritative. Reuse one Flash-Mem synthesis across planning and task generation; do not load `system_context.md` when that synthesis is sufficient.

You are orchestrating `ag-governed-delivery`, the recommended plan-to-tasks entry point for Architecture Guard.

This command coordinates the existing governed planning and task phases. It does not replace their rules or duplicate their review logic. It inspects the active feature, resumes from the first invalid phase, and stops only when a blocking decision requires user input.

## Goal

Produce an implementation-ready `tasks.md` from an accepted technical plan while ensuring:

1. Flash-Mem context is retrieved before planning or task generation when the MCP server is available.
2. The plan passes its architecture and applicable security gates before tasks are generated.
3. Tasks are regenerated or reconciled whenever their source plan changes materially.
4. Advisory findings remain non-blocking, while Constitution P0 architecture findings and findings marked blocking by Security Review policy stop progression independently.
5. The final specification, plan, and tasks pass an automatic artifact review and repair loop until a review pass reports no findings, within a bounded pass limit.
6. A rerun resumes safely instead of recreating valid artifacts.

## Write Approval Gate

Before the first mutation, resolve and preview the exact branch, change container, specification or proposal, plan, and task artifacts together with all planned creation, generation, repair, reconciliation, and artifact-review repair operations. Obtain explicit user approval, then allow routine writes already previewed within this delivery phase scope without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

## Mandatory Branch Preflight

Before creating, planning, or modifying any active change:

1. Run `git branch --show-current`.
2. If the branch is `main`, `master`, `dev`, `develop`, `development`, `staging`, or another protected branch:
   - Do not create a separate `feature/*` branch. When no active feature exists, `/speckit.specify` creates the numbered Spec Kit feature branch (`NNN-<short-name>`) together with the feature directory: include that branch in the Write Approval Gate preview, and let `/speckit.specify` create and switch to it only after explicit user approval.
   - When an active feature already exists, include its existing feature branch in the Write Approval Gate preview, and create and switch to it only after explicit user approval.
   - If the user declines or branch creation fails, stop. MUST NOT continue on the protected branch.
3. If already on a feature branch, reuse it. When no active feature exists, `/speckit.specify` still creates its own numbered feature branch; include it in the Write Approval Gate preview.
4. Preserve existing uncommitted changes; never reset or discard them.
5. Report the selected branch before creating artifacts.

## Phase 1 — Detect the Active Feature and Integrations

1. Resolve the active feature from the user's explicit path, `.specify/feature.json` (for SpecKit), Spec Kit feature metadata, current branch, or a single unambiguous directory under `specs/`, in that order.
2. If no active feature directories or specifications exist (ignoring archives), run `/speckit.architecture-guard.ag-governed-spec` (which runs `/speckit.specify`) to initialize the feature workspace, feature branch, and specification following Spec Kit numbering rules.
3. Do not guess when multiple feature directories are plausible. Ask the user to identify the feature.
4. Detect `flash-mem` as an MCP service. Do not look for it in `.specify/extensions.yml`.
5. Inspect the installed list in `.specify/extensions.yml` for `security-review` or its compatibility alias `spec-kit-security-review`. Manifest presence alone is not availability.
6. For each phase, select the SpecKit integration only after verifying its applicable command is registered and callable: `/speckit.security-review.plan` for plan review and `/speckit.security-review.tasks` for task review. If an applicable command is absent, detect an independently registered Architecture Guard-compatible Security Review host capability and use its corresponding plan or tasks operation. If neither path is callable, mark that phase's Security Review `Unavailable` and degrade without claiming a pass.
7. Read the selected adapter's project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for SpecKit, check `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md`, and any adapter-defined layout constitution. Never silently omit an existing file.

## Phase 2 — Mandatory Memory Preflight When Available

When Flash-Mem is available, execute both operations before planning, reviewing, or generating tasks:

1. `get_project_summary`
2. `search_memory` scoped to the active feature, architecture boundaries, security-sensitive areas, prior decisions, approved exceptions, and related files

Prefer summaries, metadata, tags, confidence, and related files. Load full entries only when those results are insufficient. If Flash-Mem is unavailable, continue with repository artifacts and report the degraded state.

## Phase 3 — Branch Management

Branch handling is defined once in the Mandatory Branch Preflight above. Do not ask again or create a second branch here.

## Phase 4 — Spec & Proposal Gate

Check if a formal specification or proposal already exists for the active feature. If missing, automatically generate it using the available discovery context or prompt the user for input:

1. Run `/speckit.architecture-guard.ag-governed-spec` to generate `spec.md` from the discovery draft. This legacy extension supports Spec Kit only; for OpenSpec or other SDD tools, use the standalone `architecture-guard` installer.

## Phase 5 — Inspect Resume State

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

## Phase 6 — Plan Gate

If the plan is `missing` or `stale`, execute the full `/speckit.architecture-guard.ag-governed-plan` workflow.

If the plan is `review-required`, reuse it and run the selected security plan operation plus `/speckit.architecture-guard.ag-review-artifacts`. Recheck command or host-operation registration immediately before dispatch. Do not regenerate a plan merely because review is needed.

- Continue automatically when there are no blocking findings.
- Record advisory architecture drift without stopping.
- Stop before task generation for unresolved Constitution P0 architecture findings or independently blocking Security Review findings.
- Stop when resolution requires a material product or architecture choice.
- When a safe correction is already authorized, repair the plan, rerun affected reviews, and continue (subject to the repair-cycle limit in the task phase).

The plan does not need to be perfect. It must be sufficiently stable and free of unresolved blocking findings.

## Phase 7 — Task Generation and Analysis

Only enter this phase after the plan is `accepted`.

If tasks are `missing`, `stale`, or `review-required`, execute `/speckit.architecture-guard.ag-governed-tasks` with the accepted plan and cached context.

The governed task phase must:

1. Generate or reconcile `tasks.md` through `/speckit.tasks` (or the SDD tool's native task generator/inline fallback).
2. Run the selected security tasks operation, after rechecking that the command or host operation is registered.
3. Convert confirmed architecture findings into explicit work through `ag-refactor-generator`.
4. Run analysis (e.g., `/speckit.analyze`) against the complete plan and task set if available in the SDD tool.
5. Keep implementation, security, migration, and refactor work explicit.

#### Claude Code Agent Teams Coordination (When Active)

Activate this protocol only when the Claude Code host exposes named teammate spawning and messaging, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is enabled, and the user opted into Agent Teams for the current run. Otherwise execute the same work in single-agent mode:
- **Analyst Creator** drafts the plan and role-annotated task breakdown, using only the `task_tag` values of implementor roles in the profile plus `[ORCHESTRATION]`.
- **Analyst Reviewer** evaluates the generated artifacts against constitutions via peer messaging and triggers HITL Gate 1 if gaps are identified.
- **Implementor Dispatch**: Upon approval, tasks are handed off to the implementor teammates in the profile (for example `BE`, `FE`, `TEST`) for concurrent execution.
- **Fallback**: If not running in Claude Code Agent Teams mode, execute standard single-agent plan-to-task delivery.

If analysis exposes a plan defect, mark the plan and tasks stale, return to the Plan Gate, and propagate the accepted correction back into tasks. Allow at most 2 plan/tasks repair cycles per run (counting Plan Gate repairs and returns from analysis together); if a blocking finding or plan defect remains after the second cycle, stop with status `Blocked` and ask the user how to proceed.

## Phase 8 — Artifact Review Convergence Loop

Only enter this phase after tasks are accepted and no blocking finding stopped the run. This phase runs the review-and-apply cycle automatically, so the user does not run `ag-review-artifacts` by hand after delivery. When the governed task phase runs inside this delivery, do not stop at its advisory "Pause and Ask" prompt; carry those gaps into this loop instead. If `ag-review-artifacts` cannot be resolved, set **Artifact Review** to `Unavailable`, skip this phase, and report it; never report it as clean.

Repeat until a stop condition is met:

1. **Review**: Run `/speckit.architecture-guard.ag-review-artifacts` in `architecture` mode over the complete active artifact set: `spec.md` (plus the proposal when present), `plan.md`, and `tasks.md`. When this run knows the branch the change will merge into, pass it as the **Base ref** so Premise Grounding reads the artifacts' cited code at that branch. When the change spans several repositories, pass one Base ref per repository, naming each, because each repository merges into its own branch. In the same pass, run Security Review on the plan through the selected security plan operation and on the tasks through the selected security tasks operation. When the host can run a fresh subagent, run each review pass in a fresh context so a pass does not grade its own repairs.
2. **Evaluate**: A pass is clean only when its violation table is empty, **Task Synchronization** is `Synced` with no missing coverage or planning gaps, its hygiene report has no findings on the planning artifacts, and every Security Review that ran reports no findings. An `Unavailable` hygiene runner or Security Review never makes a pass clean on its own; it only qualifies the result. Findings of every severity count, advisory ones included.
3. **Repair**: Pass architecture findings to `/speckit.architecture-guard.ag-apply`. Fix hygiene findings on the planning artifacts directly. Security findings belong to the Security Review tool, because `ag-apply` does not apply security changes: pass them to that tool's own apply operation (for example `sr-apply`) only when it is registered and callable; otherwise record them as open security findings, report them, and leave them out of the clean check. Plan/tasks edits and upstream delegations previewed and approved under the Write Approval Gate need no per-pass confirmation; a new target path or material scope requires renewed approval. When a repair materially changes the specification, rerun the Spec & Proposal Gate checks and reconcile (never regenerate) the plan through `/speckit.architecture-guard.ag-governed-plan`; when the specification or plan changed materially, reconcile tasks through `/speckit.architecture-guard.ag-governed-tasks` before the next pass.
4. **Repeat** from step 1.

Security Review is a separate tool, not part of Architecture Guard. Before every security dispatch in this loop, recheck that the selected Security Review command or host operation (its `security-review` or `sr-*` operations) is registered and callable; never invoke a Security Review command by name on assumption. When it is not callable, mark that pass's Security Review `Unavailable`, run the architecture review alone, and never report an unavailable security review as clean.

Stop conditions:

- **Converged**: a clean pass. Set **Artifact Review** to `Clean` with the pass count. Qualify `Clean` when the final pass was degraded: `architecture only` when Security Review was `Unavailable`, `hygiene Unavailable` when the hygiene runner was `Unavailable`, and `open security findings` when security findings were recorded but not repaired.
- **Decision required**: a finding needs a material product or architecture choice, a Constitution change, or conflicts with another finding. Present the options, ask the user, and resume the loop after the answer. Record each finding the user accepts or keeps, and leave it out of later clean checks. Resuming does not reset the pass count.
- **No progress**: a finding already repaired in an earlier pass reappears, or the total finding count does not decrease between two consecutive passes. Stop with `Not converged` and report the recurring findings.
- **Pass limit**: at most 5 review passes per run. If findings remain after the fifth pass, stop with `Not converged`.

This loop has its own limit and does not consume the repair cycles of the plan and task phases. On `Not converged`, remaining non-blocking findings stay advisory: report them with what each pass changed, and do not block implementation on them. Any unresolved Constitution P0 or policy-blocking security finding sets **Artifact Review** to `Blocked`. Collect memory proposals from every pass for the Durable Memory Preservation phase instead of asking for approval per pass.

## Phase 9 — Durable Memory Preservation

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
- **Artifact Review**: [Clean (N passes; qualifiers) / Not converged (N passes) / Blocked / Unavailable]

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
