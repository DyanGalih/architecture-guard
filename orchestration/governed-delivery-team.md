---
description: Run team delivery with stakeholder approval of the User Story before governed planning and task generation.
---

# Governed Team Delivery Command

## SDD Adapter Resolution

Before executing this command, read `.architecture-guard/adapters/resolve.md` and resolve the adapter with its chain (explicit `--adapter` override, `.architecture-guard/selected-adapter`, `.architecture-guard/config.yml`, then filesystem markers), then load `.architecture-guard/adapters/{tool}.md` for path maps, command maps, and gap fills. Stop with `Unavailable` and the exact path if the adapter file is missing. Do not use the Architecture Guard resource resolver for adapter selection: adapter files are not a `resolve` resource category. Resolve every adapter path and command token before continuing; all paths and commands below use the loaded adapter.

## Change Scope

Before any SDD artifact lookup or command, establish the active change scope with {adapter_command:change-scope}. If no unambiguous scope can be resolved, stop and ask the user rather than continuing without one.

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

## Repository Context

Resolve and apply the `repository_context` template with `architecture-guard resolve template repository_context`. When `.architecture-guard/config.yml` lists `repositories`, every git, branch, test, hygiene, commit, push, and code-host step in this skill runs in the repository that owns the files it concerns, as that template defines, and paths are workspace-relative; rules, constitutions, and configuration still come from the workspace. Without `repositories`, the workspace is the only repository and nothing changes.

## Budgeted Context Contract

Resolve and apply the `budgeted_context_sdd` template with `architecture-guard resolve template budgeted_context_sdd`. At each resumable phase, active adapter artifacts and applicable constitutions are authoritative. Reuse one sufficient Flash-Mem synthesis instead of loading a fallback index.

You are orchestrating `ag-governed-delivery-team`, the recommended team workflow entry point for Architecture Guard.

This command coordinates business collaboration via User Story generation before running the existing governed planning and task phases.

## Goal

Produce an approved User Story and an implementation-ready `{adapter_path:tasks}` from an accepted technical plan while ensuring:

1. A business-oriented User Story is generated before engineering execution.
2. Flash-Mem context is retrieved before planning or task generation when the MCP server is available.
3. The plan passes its architecture and applicable security gates before tasks are generated.
4. Tasks are regenerated or reconciled whenever their source plan changes materially.
5. Advisory findings remain non-blocking, while P0 findings always stop progression; security findings block only when governing policy assigns blocking severity.
6. The final specification, plan, and tasks pass an automatic artifact review and repair loop until a review pass reports no findings, within a bounded pass limit.
7. A rerun resumes safely instead of recreating valid artifacts.

## Write Approval Gate

Before the first mutation, resolve and preview the exact branch, change container, User Story, plan, and task artifacts together with all planned creation, status, linkage, generation, repair, reconciliation, and artifact-review repair operations. Obtain explicit user approval, then allow routine writes already previewed within this team-delivery phase scope without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

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
2. If no active feature directories exist (ignoring archived or completed work), derive a kebab-case name from the user's goal, show the derived name and change container in the Write Approval Gate preview, and after approval execute {adapter_command:create-change} before creating specification artifacts.
3. Do not guess when multiple active feature directories are plausible. Ask the user to identify the feature.
4. Detect `flash-mem` as an MCP service. Do not inspect an SDD extension manifest for it.
5. Detect Security Review as an independent host capability. It is not an SDD tool feature or extension; detect it only from host registrations.
6. Resolve the selected adapter's project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.
7. Load `.architecture-guard/config.yml` when present, then resolve the complete hygiene-rule set through `architecture-guard` and apply configured exclusions and effective severity at plan and task gates.

## Phase 2 — Mandatory Memory Preflight When Available

When Flash-Mem is available, execute both operations before planning, reviewing, or generating tasks:

1. `get_project_summary`
2. `search_memory` scoped to the active feature, architecture boundaries, security-sensitive areas, prior decisions, approved exceptions, and related files

Prefer summaries, metadata, tags, confidence, and related files. Load full entries only when those results are insufficient. If Flash-Mem is unavailable, continue with repository artifacts and report the degraded state.

## Phase 3 — Generate User Story

Before engineering planning begins, generate a business-oriented User Story representing the approved business intent.

`<root>` is the project root (the directory containing `.architecture-guard/`).

1. Look in the `<root>/user-stories/` directory. If none exist, create a new story. If exactly one exists, ask the user to confirm it is the story being fulfilled or to create a new one. If multiple exist, ask which User Story they are fulfilling, or whether to create a new one.
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
4. After the Write Approval Gate, persist the generated User Story as `<feature-name>.md` in the `<root>/user-stories/` directory with status `draft`.
5. Present it for stakeholder review and stop before engineering planning until the user explicitly accepts it. Record the result as `approved` in the file.
6. Once the User Story is approved, check for `.architecture-guard/sync.yml`. External synchronization is a separate side effect and requires explicit approval of the resolved provider, repository/project, and target before the first push:
   - When the `architecture-guard` CLI is installed, run `architecture-guard validate-sync-config .architecture-guard/sync.yml` to strictly validate the configuration; a non-zero exit means invalid and no remote write happens. Never fetch the CLI on demand (for example through a package runner); if it is not installed, skip sync and record `Unavailable`.
   - If valid, enabled, and approved, use the recorded external ID/URL for this story when present and update that item instead of creating a duplicate. Otherwise create one item and persist its provider, target, ID/URL, story path, and content fingerprint in `.architecture-guard/sync_status.json`.
   - Skip a push when the same target and content fingerprint already succeeded.
   - On validation, approval, or provider failure, do not create/update an external item. Record `disabled`, `approval-required`, or `failed` with the target and error; warn without blocking local delivery. Never report success without a confirmed external ID/URL.
7. If a previously approved User Story has been modified after engineering artifacts were generated, mark it `review-required`, warn the user, and require re-approval before proceeding.

## Phase 4 — Specification Gate

Before inspecting plan state, the feature must be formally specified according to the selected adapter.
1. Check whether `{adapter_path:spec}` (and any proposal artifact the adapter requires) exists for the active feature.
2. If missing, you MUST execute `ag-governed-spec` for the active feature and stop before the Plan Gate if governed specification does not complete successfully.

## Phase 4.5 — Inspect Resume State

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

## Phase 5 — Plan Gate

If the plan is `missing` or `stale`, run `ag-governed-plan` with the active feature context.

If the plan is `blocked`, report the blocking findings, set **Plan** to `Blocked`, and stop; do not regenerate it or continue to task generation until the finding is resolved.

If the plan is `review-required`, reuse it and run the applicable security plan review plus the adapter-registered violation-detection capability. Do not regenerate a plan merely because review is needed.

- **Linkage metadata for every plan state**: Resolve the actual plan path and selected story path, then validate `Story:` against their normalized relative path (or an absolute path when no relative representation is possible). Add or correct stale linkage only after showing the change and receiving approval. Never assume a fixed directory depth.

- Continue automatically when there are no blocking findings.
- Record advisory architecture drift without stopping.
- Stop before task generation for unresolved P0 findings or security findings that governing policy marks blocking. P0 cannot be overridden by a simple proceed prompt.
- Stop when resolution requires a material product or architecture choice.
- When a safe correction is already authorized, repair the plan, rerun affected reviews, and continue, within the repair limit below.
- Run plan-scope hygiene checks and block only findings whose effective configured severity is failing.

The plan does not need to be perfect. It must be sufficiently stable and free of unresolved blocking findings.

## Phase 6 — Task Generation and Analysis

Only enter this phase after the plan is `accepted`.

If tasks are `missing`, `stale`, or `review-required`, run `ag-governed-tasks` with the accepted plan and cached context.

The governed task phase must:

1. Generate or reconcile `{adapter_path:tasks}` through {adapter_command:create-tasks} or its documented inline fallback.
2. Run the applicable security task review.
3. Convert confirmed architecture findings into explicit work through {adapter_command:refactor-generator}.
4. Run {adapter_command:analyze} against the complete plan and task set.
5. Keep implementation, security, migration, and refactor work explicit.
6. Run task-scope hygiene checks with the same exclusions and effective severity policy.

If analysis exposes a plan defect, mark the plan and tasks stale, return to the Plan Gate, and propagate the accepted correction back into tasks.

**Repair limit**: Allow at most 2 plan-repair cycles per run, counting both in-gate plan repairs and returns from analysis. If a plan defect remains after the second cycle, stop: set **Plan** to `Blocked`, report the unresolved defect and what each cycle changed, and ask the user how to proceed. Never generate tasks from a plan that is still defective.

## Phase 7 — Artifact Review Convergence Loop

Only enter this phase after tasks are accepted and no blocking finding stopped the run. This phase runs the review-and-apply cycle automatically, so the user does not run `ag-review-artifacts` by hand after delivery. When the governed task phase runs inside this delivery, do not stop at its advisory "Pause and Ask" prompt; carry those gaps into this loop instead. If `ag-review-artifacts` cannot be resolved, set **Artifact Review** to `Unavailable`, skip this phase, and report it; never report it as clean.

Repeat until a stop condition is met:

1. **Review**: Run the registered `ag-review-artifacts` capability in `architecture` mode over the complete active artifact set: `{adapter_path:spec}` (plus the proposal when the adapter defines one), `{adapter_path:plan}`, and `{adapter_path:tasks}`. Tell it that this skill is the Security Review owner. When this run knows the branch the change will merge into (for example a destination branch `ag-workflow` passed), pass it as the **Base ref** so Premise Grounding reads the artifacts' cited code at that branch. In the same pass, run Security Review on the plan through {adapter_command:security-review-plan} and on the tasks through {adapter_command:security-review-tasks}. When the host can run a fresh subagent, run each review pass in a fresh context so a pass does not grade its own repairs.
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

## Phase 8 — Durable Memory Preservation

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
- **User Story**: [Draft / Approved / Review Required] — [Generated / Reused]
- **External Sync**: [Synced / Skipped / Approval Required / Failed / Unavailable]
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
- Unknown or cross-phase problem: rerun `ag-governed-delivery-team`.

## Guardrails

- Remain SDD-tool-agnostic unless a preset or constitution supplies application-framework vocabulary.
- Prefer minimal, incremental corrections and standard platform capabilities.
- Do not silently pass a blocking finding.
- Do not convert advisory preferences into release gates.
- Never generate tasks from a blocked plan.
