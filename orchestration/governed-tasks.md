---
description: Generate or reconcile implementation tasks, then analyze security, architecture, migration, and refactor coverage.
---

# Governed Tasks Command

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

Resolve and apply the `budgeted_context_sdd` template with `architecture-guard resolve template budgeted_context_sdd`. Active adapter artifacts and applicable constitutions are mandatory and authoritative; memory and supported fallbacks may supplement but never replace them.

You are orchestrating the `ag-governed-tasks` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the task list respects architectural, historical, and security constraints before implementation begins.

## Goal

Provide a single command that ensures:
1. Implementation tasks are historical-context aware when Flash-Mem is available.
2. A task list is generated or validated ({adapter_command:create-tasks}).
3. Security requirements are represented in tasks (Security Review).
4. Architecture refactors or migrations are represented in tasks (Architecture Guard).
5. The tasks are formally analyzed for gaps and severities ({adapter_command:analyze}).
6. An automatic loop is offered to clarify and revise tasks if gaps are found.

## Orchestration Flow

### Write Approval Gate

Before the first mutation, resolve and preview the exact target task and constraint artifacts together with all planned task-generation, reconciliation, refactor, analysis-fix, and constraint-write operations. Obtain explicit user approval, then allow routine writes already previewed within this task phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval. **Caller approval**: when a calling skill passes an approval whose preview showed this phase's exact task and constraint artifacts and operations (for example `ag-governed-backlog`'s Gate Q), that approval satisfies this gate and is not asked again. It covers only what that preview showed; anything else still needs its own preview and approval.

### Constitution Inputs

Resolve the selected adapter's project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), then explicitly read every declared or present constitution, architecture, security, and layout Markdown file with file-reading tools. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file, and do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`. Read them anyway, but report any governance file that is gitignored or outside the repository as a hygiene WARNING: reviewers and teammates cannot open a rule that code or specs cite. For optional split layouts, embedded rules in `{adapter_path:constitution}` satisfy the corresponding input. Later steps refer to this set as the **Constitution Inputs**; load it once and reuse it.

### Required Active Inputs

Require active `{adapter_path:spec}` and `{adapter_path:plan}` artifacts plus the complete Constitution Inputs. In Generic mode, ask for every unresolved input path and the destination tasks path, resolve the latter as `{adapter_path:tasks}`, and do not write until it is supplied. **Change with no specification delta**: when the caller states the active change has no specification delta (for example a fix-lane or light-lane change from `ag-governed-backlog`), its `## Stories` section, with each item's acceptance criteria, stands in for `{adapter_path:spec}` wherever this phase reads the specification, and every task traces to one of those criteria; when any listed item has no acceptance criteria, stop and report the item, because no criterion exists to trace its work to, and never derive criteria here; `{adapter_path:plan}` and the Constitution Inputs are still required. If the spec (unless the `## Stories` section stands in for it), plan, governance rules, or architecture rules are missing, stop and direct the user to the corresponding governed phase or init; if security rules are missing, report the gap and obtain explicit confirmation before continuing with baseline security task validation.

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` host capability

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment. Do not treat it as an SDD extension or inspect an SDD extension manifest for it.
2. Detect Security Review as an independent host capability. Never inspect an SDD extension manifest or directory for it.
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before task generation. Prefer summary-first context and only expand into repository files when needed.

If Flash-Mem is unavailable or the context is insufficient, rely on the Constitution Inputs loaded above before continuing with repository artifacts.

**[OPTIONAL SUB-AGENT DELEGATION]**
* **Capability Gate:** Detect a host synthesis/delegation capability independently of the adapter command map. If unavailable, execute inline regardless of size and report the degraded path.
* **Trigger Condition:** When the capability is available, you **MUST** delegate memory retrieval and synthesis if:
  - The Flash-Mem index contains $\ge 20$ memory documents.
  - OR the project repository contains $\ge 15$ active ADRs/docs.
  - Otherwise, you **MUST** execute inline.
* **Execution:** Invoke the host capability directly with the handoff below and task-generation context. Do not append flags to {adapter_command:subagent-synthesize} or execute adapter fallback prose.
* **Strict Handoff Template:** Format the sub-agent prompt exactly like this:
  ```yaml
  Task: Retrieve and synthesize relevant architecture constraints and ADRs.
  Focus: Rules and conventions affecting implementation tasks.
  Expected Output: Synthesized markdown summary of constraints to integrate directly into tasks.md.
  ```


---

### Step 3 — Orchestrate SDD Tool Tasks

You must orchestrate {adapter_command:create-tasks} workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must actually generate the tasks:
1. **Apply Ponytail Pragmatism & Quality-Enriched Decomposition**: Instruct the agent to act as a "lazy senior developer." Break down the work into the absolute minimal tasks needed. Refuse to add boilerplate, unnecessary abstractions, or "future-proofing" tasks.
   - Embed explicit SonarLint/quality acceptance criteria in tasks:
     - Type safety: strict discriminated unions, no unvalidated `any`/`unknown` casts.
     - Controller/API boundaries: explicit parameter parsing/validation (e.g. UUID) and documented DTO response serialization.
     - Localized verification: runnable unit/integration tests and lint/typecheck command execution.
     - Hygiene confirmation: clean workspace with no leftover `.tmp`, `.new`, or commented-out code.
   - If the same logic appears in multiple modules, create a single extraction task instead of parallel copy-paste tasks.
   - **Claude Code Agent Teams Role Tagging** (only when Agent Teams mode is active): When Agent Teams mode is active for the current run or configured in `.architecture-guard/agents.yml`, the **Analyst Creator** MUST tag every task with the `task_tag` of an implementor role in that profile (by default `[BE]` Backend, `[FE]` Frontend, `[TEST]` Unit/Integration Test, plus any custom tag such as `[MOBILE]`) or with `[ORCHESTRATION]`. Use only tags of roles the profile contains: a backend-only roster has no `[FE]` tasks, and work with no matching implementor is tagged `[ORCHESTRATION]`. `[ORCHESTRATION]` tasks are lead-session tasks and MUST NOT be assigned concurrently to an implementor.
2. **Execute Tasks**: Run {adapter_command:create-tasks} to generate and save `{adapter_path:tasks}`.

   Follow the adapter-defined action; if it names a command that is not available, use the adapter's own inline fallback. When generating inline:
   - Read `{adapter_path:plan}`, `{adapter_path:spec}`, and the Constitution Inputs.
   - Use Flash-Mem context and `{adapter_path:security-constraints}` if available.
   - Generate `{adapter_path:tasks}` directly, breaking down the plan into implementation-ready tasks with checkbox format. Enforce Ponytail minimalism, plus role tags when Agent Teams mode is active.
   - Note in the Governance Summary that task generation was performed inline.

3. The generated tasks MUST use the Constitution Inputs, the feature security constraints, and feature context. Use Flash-Mem first when available.
4. Prefer compact, feature-scoped task generation over broad restatements of the full memory set.

### Step 4 — Security Review on Tasks

IF `security-review` is available as a host capability:
1. **Execute Review**: Invoke the host Security Review capability directly with `{adapter_path:tasks}`, the active spec and plan, and applicable constitutions. Do not execute adapter fallback prose as a command.
2. Check for missing tasks related to:
    - Validation, authorization, and trust boundaries.
    - Secure integration and audit/logging.
3. Propose updates to `{adapter_path:security-constraints}` for new findings, show the exact target and changes, and write them only after explicit user approval.

### Step 5 — Architecture Refactor Generation

Resolve {adapter_command:refactor-generator}. If it identifies a registered capability, invoke it; otherwise perform the adapter's documented inline fallback. Never execute descriptive fallback prose as a shell or slash command.

It MUST convert architecture findings into:
- Explicit implementation, migration, or refactor tasks.
- Boundary-level or contract-level corrections.
- **Prefer module-level tasks** over broad system rewrites.

### Step 6 — Orchestrate SDD Tool Analysis

You must orchestrate {adapter_command:analyze} workflow directly to serve as the formal analyst.

1. **Execute Analyze**: Run {adapter_command:analyze} on the complete task list and architecture refactors.
2. **Architecture Validation**: Detect any gaps, missing requirements, or high-severity execution risks present in the implementation plan or task list. Explicitly verify DRY coverage for repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration, plus cleanup/placement tasks required by the complete hygiene-rule set resolved through `architecture-guard`.
3. **Task Identity Reconciliation**: After adding security or refactor work, ensure every task has one unique, stable sequential ID; update references without reusing or silently renumbering completed IDs.

### Step 7 — Proactive Durable Memory Preservation

If the task generation or security review identified new architectural lessons or reusable patterns:
1. **Proactive Proposal**: When Flash-Mem is available, draft proposed entries for `capture_artifact_memory` (for the written tasks) or `add_memory` (for a new durable lesson) in proposal-only mode as the final part of this turn.
2. **Approval Required**: Show the proposed entries and obtain explicit user approval before invoking any memory write tool.
3. **Standard**: Never write memory without that approval. If Flash-Mem is unavailable, report the proposals as `Unavailable` and skip the write.

### Step 8 — Blocking Gate and Automatic Analyst Loop

Evaluate the gate before producing the summary so the summary's **Gate Status** reflects it.

1. **Blocking Gate (always evaluated first)**: If any finding from Steps 4–6 is a Constitution P0 architecture violation or an independently policy-designated blocking security finding, stop progression to implementation, set the summary's **Gate Status** to `Blocked`, surface the remediation tasks, and do not allow a simple proceed prompt to override it. Only resolving the finding, or an explicit Constitution change approved by the user, lifts the block.

If the analyst ({adapter_command:analyze}) finds any remaining non-blocking gaps, missing steps, or high severity issues in Step 6:
2. **Pause and Ask for Advisory Findings**: After the Step 9 summary, conclude your response by asking the user:
   > *"The analyst found [number] gaps/severities in the tasks. Would you like me to automatically clarify and revise the tasks to address these findings?"*
   When a governed delivery orchestrator with an Artifact Review Convergence Loop invoked this phase, skip this question and return the gaps to the caller, which repairs them in that loop.
3. **Execute if Approved**: If the user answers "yes" (or equivalent) in their next message, you must:
   - Rewrite `{adapter_path:tasks}` to resolve the detected gaps, within the approved Write Approval Gate scope.
   - Re-run {adapter_command:analyze} after each rewrite, at most 2 repair attempts; if gaps remain after the second attempt, stop and report them.
   - Re-evaluate the Blocking Gate on the new results and update **Gate Status** before presenting the result.
   - Present the clean result.

### Step 9 — Task Governance Summary

Produce a final `Governed Tasks Summary` for the user, using the Gate Status from Step 8.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Skip Step 2 (Flash-Mem MCP Context Retrieval)
- Continue to {adapter_command:create-tasks} directly
- Assume no historical task constraints beyond Constitution

**Without Security Review**:
- Skip Step 4 (Security Review on Tasks)
- Continue to refactor-generator directly
- Flag missing security task validation in summary

**If No Architecture Violations**:
- Report "Architecture refactor tasks: None"
- Task list is complete

**Minimal Viable Workflow** (Architecture Guard plus the selected SDD tool):
- Detect optional integrations
- Generate tasks through {adapter_command:create-tasks} or its inline fallback
- Validate against Constitution + architecture boundaries
- Produce summary

## Output Structure

The command MUST return:

```markdown
# Governed Tasks Summary

## Gate Status
- **Status**: [Ready / Advisory Findings / Blocked]
- **Blocking Findings**: [Constitution P0 or policy-designated blocking findings, or None]

## Memory Context
- **Status**: [Synthesized / Skipped / Missing]
- **Relevant Decisions**: [List of historical constraints affecting these tasks]

## Security Task Review
- **Status**: [Reviewed / Advisory / Blocked / Unavailable] — `Unavailable` means no independent Security Review ran; never report it as a pass.
- **Missing Security Tasks**: [List of missing auth/val/audit tasks]
- **Constraints**: [Key security boundaries to respect]

## Architecture Task Review
- **Refactor Tasks**: [Tasks generated by refactor-generator]
- **Migration Tasks**: [Specific steps for architectural migration]
- **Architecture Risks**: [Drift or conflicts detected in the task list]

## Recommended Next Step
- [e.g., Continue to the adapter-registered governed-implement capability]
- [e.g., Revise tasks to address missing security items]
- [e.g., Update architecture constitution if standard is outdated]
- **Durable Memory Preservation**: (Proactively triggered) Review the proposed memory entries below.
```

## Output Rules

- **Separation**: Clearly separate implementation tasks, security tasks, and architecture refactor tasks.
- **Precision**: Do NOT merge findings into vague task items.
- **Non-Blocking**: Findings are advisory by default; explicitly blocking/P0 findings remain blocking.
- **Independent Security Policy**: Preserve Security Review severity and blocking decisions independently from architecture severity and P0 handling; architecture defaults must not downgrade or unblock Security Review findings.
