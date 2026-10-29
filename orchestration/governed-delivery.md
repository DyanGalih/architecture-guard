---
description: Resume governed delivery from an active specification through plan and task generation, with optional Flash-Mem context, security review, architecture gates, task reconciliation, and analysis.
---

# Governed Delivery Command

## SDD Adapter Resolution

Before executing this command, read `.architecture-guard/adapters/resolve.md` and resolve the adapter with its chain (explicit `--adapter` override, `.architecture-guard/selected-adapter`, `.architecture-guard/config.yml`, then filesystem markers), then load `.architecture-guard/adapters/{tool}.md` for path maps, command maps, and gap fills. Stop with `Unavailable` and the exact path if the adapter file is missing. Do not use the Architecture Guard resource resolver for adapter selection: adapter files are not a `resolve` resource category. Resolve every adapter path and command token before continuing; all paths and commands below use the loaded adapter.

## Standalone Resource Resolution

Architecture Guard engine resources are standalone package resources. Never search an SDD-tool directory, an extension directory, or a source checkout for them. An adapter path under `.architecture-guard` is an editable local override location, not proof that the resource was copied.

- Directly inspect the matching `.architecture-guard/<category>/` directory first for workspace overrides.
- If the named local resource exists, read it. Otherwise run `architecture-guard resolve <category> <name>` and use the returned content.
- For a resource collection, run `architecture-guard resolve <category> --list`, then resolve every returned name individually in deterministic order so local overrides replace bundled files without hiding bundled defaults.
- Valid resource categories are engine resources such as `template`, `preset`, `hygiene-rules`, `sonar-rules`, and `manifest`/`config`; adapter selection is file-based and is not one of these categories.
- If the CLI is unavailable and a mandatory resource is not vendored locally, stop and report the missing runtime dependency. For optional resources, report `Unavailable` and continue only when this command explicitly permits degradation.

## Ponytail Core Contract

Before continuing, you **MUST** resolve and apply the `ponytail_core` template with `architecture-guard resolve template ponytail_core` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Host Agent Execution

Resolve and apply `agent_execution` with `architecture-guard resolve template agent_execution`. It owns mode activation, delegation decisions, complete handoffs, role restrictions, and ownership. Preserve phase-specific gates below. All retrieval instructions below accept current sufficient run-local context under `budgeted_context_sdd`: reuse it instead of repeating calls. An exposed memory tool is not usable when this run has recorded an absent store; reuse that unavailable outcome until tools or environment change.

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

## Repository Context

Resolve and apply the `repository_context` template with `architecture-guard resolve template repository_context`. When `.architecture-guard/config.yml` lists `repositories`, every git, branch, test, hygiene, commit, push, and code-host step in this skill runs in the repository that owns the files it concerns, as that template defines, and paths are workspace-relative; rules, constitutions, and configuration still come from the workspace. Without `repositories`, the workspace is the only repository and nothing changes.

## Change Scope

Before any SDD artifact lookup or command, establish the active change scope with {adapter_command:change-scope}. If no unambiguous scope can be resolved, stop and ask the user rather than continuing without one.

## Budgeted Context Contract

Resolve and apply the `budgeted_context_sdd` template with `architecture-guard resolve template budgeted_context_sdd`. At each resumable phase, active adapter artifacts and applicable constitutions are authoritative. Reuse one sufficient Flash-Mem synthesis instead of loading a fallback index.

You are orchestrating `ag-governed-delivery`, the recommended plan-to-tasks entry point for Architecture Guard.

This command coordinates the existing governed planning and task phases. It does not replace their rules or duplicate their review logic. It inspects the active feature, resumes from the first invalid phase, and stops only when a blocking decision requires user input.

## Goal

Produce an implementation-ready `{adapter_path:tasks}` from an accepted technical plan while ensuring:

1. Flash-Mem context is retrieved before planning or task generation when the MCP server is available.
2. The plan passes its architecture and applicable security gates before tasks are generated.
3. Tasks are regenerated or reconciled whenever their source plan changes materially.
4. Advisory findings remain non-blocking, while P0 findings always stop progression; security findings block only when governing policy assigns blocking severity.
5. The final specification, plan, and tasks pass an automatic artifact review and repair loop until a review pass reports no findings, within a bounded pass limit.
6. A rerun resumes safely instead of recreating valid artifacts.

## Write Approval Gate

Accept an existing caller approval only for the identical action, phase, exact targets, and owning repository under `capability_composition`; distinct human decisions and material scope expansions still require approval.

Before the first mutation, resolve and preview the exact branch, change container, specification, plan, and task artifacts together with all planned creation, generation, repair, reconciliation, and artifact-review repair operations. Obtain explicit user approval, then allow routine writes already previewed within this delivery phase scope without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

## Mandatory Branch Preflight

Before creating, planning, or modifying any active change:

1. Run `git branch --show-current` in the workspace and in every repository this phase writes to (Repository Context); apply the steps below to each.
2. If the branch is `main`, `master`, `dev`, `develop`, `development`, `staging`, or another protected branch:
   - Include `feature/<change-name>` in the Write Approval Gate preview, and create and switch to it only after explicit user approval.
   - If the user declines or branch creation fails, stop. MUST NOT continue on the protected branch.
3. If already on a feature branch, reuse it.
4. Preserve existing uncommitted changes; never reset or discard them.
5. Report the selected branch before creating artifacts.

## Phase 1 — Detect the Active Feature and Integrations

1. Resolve the active work from the user's explicit path, adapter artifact paths, current branch metadata when supported, or one unambiguous result from {adapter_command:list-specs}, in that order.
2. If no active feature directories exist (ignoring archived or completed work), derive a kebab-case name from the user's goal, show the derived name and change container in the Write Approval Gate preview, and after approval execute {adapter_command:create-change}, then execute {adapter_command:create-spec} for that new active work. Stop before planning if either step fails or the resulting specification is empty.
3. If an existing active feature is resolved but its specification is missing or empty, execute {adapter_command:create-spec} for that active work. Stop before planning if the command fails or the resulting specification remains empty.
4. Do not guess when multiple active feature directories are plausible. Ask the user to identify the feature.
5. Detect `flash-mem` as an MCP service. Do not inspect an SDD extension manifest for it.
6. Detect Security Review as an independent host capability. It is not an SDD tool feature or extension; detect it only from host registrations.
7. Resolve the selected adapter's project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.
8. Load `.architecture-guard/config.yml` when present, then resolve the complete hygiene-rule set through `architecture-guard`. Apply configured exclusions and severity policy at the plan and task gates; missing optional hygiene configuration is non-blocking and must be reported.

After a new or repaired spec is written, immediately run {adapter_command:validate-spec}. If validation fails, repair the spec against {adapter_command:spec-template} and validate again, at most 2 repair attempts; if it still fails, stop before planning and report the remaining validation errors. Do not continue with an invalid spec.

## Phase 2 — Mandatory Memory Preflight When Available

When no current sufficient cached synthesis exists and Flash-Mem is usable under the run-local context contract, execute both operations before planning, reviewing, or generating tasks:

1. `get_project_summary`
2. `search_memory` scoped to the active feature, architecture boundaries, security-sensitive areas, prior decisions, approved exceptions, and related files

Prefer summaries, metadata, tags, confidence, and related files. Load full entries only when those results are insufficient. If Flash-Mem is unavailable, continue with repository artifacts and report the degraded state.

## Phase 3 — Inspect Resume State

Inspect `{adapter_path:spec}`, the technical design artifact `{adapter_path:plan}`, `{adapter_path:tasks}`, `{adapter_path:security-constraints}`, and available architecture review artifacts for the active feature.

Classify the plan:

- `missing`: the technical design artifact does not exist or is empty.
- `stale`: the specification or governing constraints changed materially after the plan was produced.
- `blocked`: an unresolved P0 finding, policy-designated blocking security finding, or material design decision prevents safe task generation.
- `review-required`: the plan exists but has not been validated against current inputs.
- `accepted`: the plan matches current inputs and has no unresolved blocking findings.

Classify tasks:

- `missing`: `{adapter_path:tasks}` does not exist or is empty.
- `stale`: the accepted plan changed materially after tasks were produced.
- `review-required`: tasks exist but have not been analyzed against the accepted plan and current constraints.
- `accepted`: tasks align with the accepted plan and have no unresolved blocking gaps.

Do not use timestamps as the only evidence of material staleness. Compare artifact intent and content when possible.

## Phase 4 — Plan Gate

If the plan is `missing` or `stale`, run `ag-governed-plan` with the active feature context.

If the plan is `blocked`, report the blocking findings, set **Plan** to `Blocked`, and stop; do not regenerate it or continue to task generation until the finding is resolved.

If the plan is `review-required`, reuse it and run the applicable security plan review plus the adapter-registered violation-detection capability. Do not regenerate a plan merely because review is needed.

- Continue automatically when there are no blocking findings.
- Record advisory architecture drift without stopping.
- Stop before task generation for unresolved P0 findings or security findings that governing policy marks blocking. P0 cannot be overridden by a simple proceed prompt.
- Stop when resolution requires a material product or architecture choice.
- When a safe correction is already authorized, repair the plan, rerun affected reviews, and continue, within the repair limit below.
- Run plan-scope repository hygiene checks. Block only findings whose effective severity is configured to fail; report all others as advisory.

The plan does not need to be perfect. It must be sufficiently stable and free of unresolved blocking findings.

## Phase 5 — Task Generation and Analysis

Only enter this phase after the plan is `accepted`.

If tasks are `missing`, `stale`, or `review-required`, run `ag-governed-tasks` with the accepted plan and cached context.

The governed task phase must:

1. Generate or reconcile `{adapter_path:tasks}` through {adapter_command:create-tasks} or its documented inline fallback.
2. Run the applicable security task review.
3. Convert confirmed architecture findings into explicit work through {adapter_command:refactor-generator}.
4. Run {adapter_command:analyze} against the complete plan and task set.
5. Keep implementation, security, migration, and refactor work explicit.
6. Run task-scope repository hygiene checks with the same configured severity policy.

#### Coordinated Host Roles (When Active)

Apply this coordination in the explicitly selected coordinated implementation mode defined by `agent_execution`. Claude retains its native activation prerequisites; Codex uses callable host capabilities and its own profile:
- **Analyst Creator** drafts the plan and role-annotated task breakdown. **Analyst Reviewer** audits it through host messaging and the shared task list. This path bypasses `delivery-team` User Story branching only when stakeholder story approval is not required.
- **Human-in-the-Loop Gate**: Lead session presents the reconciled `{adapter_path:tasks}` and requires explicit human approval after the Artifact Review Convergence Loop, before concluding delivery or advancing to implementation.

If analysis exposes a plan defect, mark the plan and tasks stale, return to the Plan Gate, and propagate the accepted correction back into tasks.

**Repair limit**: Allow at most 2 plan-repair cycles per run, counting both in-gate plan repairs and returns from analysis. If a plan defect remains after the second cycle, stop: set **Plan** to `Blocked`, report the unresolved defect and what each cycle changed, and ask the user how to proceed. Never generate tasks from a plan that is still defective.

## Phase 6 — Artifact Review Convergence Loop

Only enter this phase after tasks are accepted and no blocking finding stopped the run. This phase runs the review-and-apply cycle automatically, so the user does not run `ag-review-artifacts` by hand after delivery. When the governed task phase runs inside this delivery, do not stop at its advisory "Pause and Ask" prompt; carry those gaps into this loop instead. If `ag-review-artifacts` cannot be resolved, set **Artifact Review** to `Unavailable`, skip this phase, and report it; never report it as clean.

Repeat until a stop condition is met:

1. **Review**: Run the registered `ag-review-artifacts` capability in `architecture` mode over the complete active artifact set: `{adapter_path:spec}` (plus the proposal when the adapter defines one), `{adapter_path:plan}`, and `{adapter_path:tasks}`. Tell it that this skill is the Security Review owner. In the same pass, run Security Review on the plan through {adapter_command:security-review-plan} and on the tasks through {adapter_command:security-review-tasks}. When the host can run a fresh subagent, run each review pass in a fresh context so a pass does not grade its own repairs.
2. **Evaluate**: A pass is clean only when its violation table is empty, **Task Synchronization** is `Synced` with no missing coverage or planning gaps, its hygiene report has no findings on the planning artifacts, and every Security Review that ran reports no findings. An `Unavailable` hygiene runner or Security Review never makes a pass clean on its own; it only qualifies the result. Findings of every severity count, advisory ones included.
3. **Repair**: Pass architecture findings to {adapter_command:architecture-apply}. Fix hygiene findings on the planning artifacts directly. Security findings belong to the Security Review tool, because `ag-apply` does not apply security changes: pass them to that tool's own apply operation (for example `sr-apply`) only when it is registered and callable; otherwise record them as open security findings, report them, and leave them out of the clean check. Plan/tasks edits and upstream delegations previewed and approved under the Write Approval Gate need no per-pass confirmation; a new target path or material scope requires renewed approval. When a repair materially changes the specification, rerun {adapter_command:validate-spec} and reconcile (never regenerate) the plan through `ag-governed-plan`; when the specification or plan changed materially, reconcile tasks through `ag-governed-tasks` before the next pass.
4. **Repeat** from step 1.

Security Review is a separate tool, not part of Architecture Guard. Before every security dispatch in this loop, recheck that the selected Security Review command or host operation (its `security-review` or `sr-*` operations) is registered and callable; never invoke a Security Review command by name on assumption. When it is not callable, mark that pass's Security Review `Unavailable`, run the architecture review alone, and never report an unavailable security review as clean.

Stop conditions:

- **Converged**: a clean pass. Set **Artifact Review** to `Clean` with the pass count. Qualify `Clean` when the final pass was degraded: `architecture only` when Security Review was `Unavailable`, `hygiene Unavailable` when the hygiene runner was `Unavailable`, and `open security findings` when security findings were recorded but not repaired.
- **Decision required**: a finding needs a material product or architecture choice, a Constitution change, or conflicts with another finding. Present the options, ask the user, and resume the loop after the answer. Record each finding the user accepts or keeps, and leave it out of later clean checks. Resuming does not reset the pass count.
- **No progress**: a finding already repaired in an earlier pass reappears, or the total finding count does not decrease between two consecutive passes. Stop with `Not converged` and report the recurring findings.
- **Pass limit**: at most 5 review passes per run. If findings remain after the fifth pass, stop with `Not converged`.

This loop has its own limit and does not consume the repair cycles of the plan and task phases. On `Not converged`, remaining non-blocking findings stay advisory: report them with what each pass changed, and do not block implementation on them. Any unresolved Constitution P0 or policy-blocking security finding sets **Artifact Review** to `Blocked`. Collect memory proposals from every pass for the Durable Memory Preservation phase instead of asking for approval per pass.

## Phase 7 — Durable Memory Preservation

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
