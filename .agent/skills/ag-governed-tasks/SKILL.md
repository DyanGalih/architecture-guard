---
name: ag-governed-tasks
description: Generate or reconcile implementation tasks, then analyze security, architecture, migration, and refactor coverage.
metadata:
  author: architecture-guard
  source: https://github.com/DyanGalih/architecture-guard
---

# Governed Tasks Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `{adapter_path:budgeted-context-template}`. Active adapter artifacts and applicable constitutions are mandatory and authoritative; memory and supported fallbacks may supplement but never replace them.

You are orchestrating the `ag-governed-tasks` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the task list respects architectural, historical, and security constraints before implementation begins.

## Goal

Provide a single command that ensures:
1. Implementation tasks are historical-context aware when Flash-Mem is available.
2. A task list is generated or validated (`{adapter_command:create-tasks}`).
3. Security requirements are represented in tasks (Security Review).
4. Architecture refactors or migrations are represented in tasks (Architecture Guard).
5. The tasks are formally analyzed for gaps and severities (`{adapter_command:analyze}`).
6. An automatic loop is offered to clarify and revise tasks if gaps are found.

## Orchestration Flow

### Write Approval Gate

Before the first mutation, resolve and preview the exact target task and constraint artifacts together with all planned task-generation, reconciliation, refactor, analysis-fix, and constraint-write operations. Obtain explicit user approval, then allow routine writes already previewed within this task phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

### Required Active Inputs

Require active `{adapter_path:spec}` and `{adapter_path:plan}` artifacts plus applicable `{adapter_path:constitution}`, `{adapter_path:arch-constitution}`, and `{adapter_path:security-constitution}` inputs. For optional split layouts, embedded rules in `{adapter_path:constitution}` satisfy the split input. In Generic mode, ask for every unresolved input path and the destination tasks path, resolve the latter as `{adapter_path:tasks}`, and do not write until it is supplied. If the spec, plan, governance rules, or architecture rules are missing, stop and direct the user to the corresponding governed phase or init; if security rules are missing, report the gap and obtain explicit confirmation before continuing with baseline security task validation.

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` host capability

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment. Do not treat it as a Spec Kit extension or look for it in `{adapter_path:extensions}`.
2. Detect Security Review as an independent host capability, never from an SDD extensions artifact. Do not read `{adapter_path:extensions}` or `{adapter_path:extensions-dir}` for it.
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before task generation. Prefer summary-first context and only expand into repository files when needed.

If Flash-Mem is unavailable or the context is insufficient, continue with the repository artifacts and constitution files available in the workspace.

**[OPTIONAL SUB-AGENT DELEGATION]**
* **Capability Gate:** Detect a host synthesis/delegation capability independently of the adapter command map. If unavailable, execute inline regardless of size and report the degraded path.
* **Trigger Condition:** When the capability is available, you **MUST** delegate memory retrieval and synthesis if:
  - The Flash-Mem index contains $\ge 20$ memory documents.
  - OR the project repository contains $\ge 15$ active ADRs/docs.
  - Otherwise, you **MUST** execute inline.
* **Execution:** Invoke the host capability directly with the handoff below and task-generation context. Do not append flags to `{adapter_command:subagent-synthesize}` or execute adapter fallback prose.
* **Strict Handoff Template:** Format the sub-agent prompt exactly like this:
  ```yaml
  Task: Retrieve and synthesize relevant architecture constraints and ADRs.
  Focus: Rules and conventions affecting implementation tasks.
  Expected Output: Synthesized markdown summary of constraints to integrate directly into tasks.md.
  ```


---

### Step 3 — Orchestrate SDD Tool Tasks

You must orchestrate the `{adapter_command:create-tasks}` workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must actually generate the tasks:
1. **Apply Ponytail Pragmatism & Quality-Enriched Decomposition**: Instruct the agent to act as a "lazy senior developer." Break down the work into the absolute minimal tasks needed. Refuse to add boilerplate, unnecessary abstractions, or "future-proofing" tasks.
   - Embed explicit SonarLint/quality acceptance criteria in tasks:
     - Type safety: strict discriminated unions, no unvalidated `any`/`unknown` casts.
     - Controller/API boundaries: explicit parameter parsing/validation (e.g. UUID) and documented DTO response serialization.
     - Localized verification: runnable unit/integration tests and lint/typecheck command execution.
     - Hygiene confirmation: clean workspace with no leftover `.tmp`, `.new`, or commented-out code.
   - If the same logic appears in multiple modules, create a single extraction task instead of parallel copy-paste tasks.
2. **Execute Tasks**: Run `{adapter_command:create-tasks}` to generate and save `{adapter_path:tasks}`.

   **If `{adapter_command:create-tasks}` is not available as a registered command** (i.e., the AI agent does not recognize it as a slash command), fall back to inline task generation:
    - Read `{adapter_path:plan}` and `{adapter_path:spec}`.
   - Read all applicable constitution files (`{adapter_path:constitution}`, `{adapter_path:arch-constitution}`, `{adapter_path:security-constitution}`).
   - Use Flash-Mem context and `{adapter_path:security-constraints}` if available.
   - Generate `{adapter_path:tasks}` directly, breaking down the plan into implementation-ready tasks with checkbox format. Enforce Ponytail minimalism.
   - Note in the Governance Summary that `{adapter_command:create-tasks}` was unavailable and task generation was performed inline.

3. The generated tasks MUST use the Project Constitution documents and feature context. Use Flash-Mem first when available. If retrieval is unavailable or insufficient, read constitution files and feature security constraints directly with file-reading tools. Do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`.
4. Prefer compact, feature-scoped task generation over broad restatements of the full memory set.

### Step 4 — Security Review on Tasks

IF `security-review` is available as a host capability:
1. **Execute Review**: Invoke the host Security Review capability directly with `{adapter_path:tasks}`, the active spec and plan, and applicable constitutions. Do not execute adapter fallback prose as a command.
2. Check for missing tasks related to:
    - Validation, authorization, and trust boundaries.
    - Secure integration and audit/logging.
3. Propose updates to `{adapter_path:security-constraints}` for new findings, show the exact target and changes, and write them only after explicit user approval.

### Step 5 — Architecture Refactor Generation

Run:
```text
`{adapter_command:refactor-generator}`
```

It MUST convert architecture findings into:
- Explicit implementation, migration, or refactor tasks.
- Boundary-level or contract-level corrections.
- **Prefer module-level tasks** over broad system rewrites.

### Step 6 — Orchestrate SDD Tool Analysis

You must orchestrate the `{adapter_command:analyze}` workflow directly to serve as the formal analyst.

1. **Execute Analyze**: Run `{adapter_command:analyze}` on the complete task list and architecture refactors.
2. **Architecture Validation**: Detect any gaps, missing requirements, or high-severity execution risks present in the implementation plan or task list. Explicitly verify DRY coverage for repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration, plus cleanup/placement tasks required by `{adapter_path:hygiene-rules}`.
3. **Task Identity Reconciliation**: After adding security or refactor work, ensure every task has one unique, stable sequential ID; update references without reusing or silently renumbering completed IDs.

### Step 7 — Proactive Durable Memory Preservation

If the task generation or security review identified new architectural lessons or reusable patterns:
1. **Proactive Proposal**: You **MUST automatically launch** the durable-memory capture flow in proposal-only mode as the final part of this turn.
2. **Approval Required**: Show the proposed entries and obtain explicit user approval before invoking any memory write tool.
3. **Standard**: Do not silently write memory inside or outside the capture flow.

### Step 8 — Task Governance Summary

Produce a final `Governed Tasks Summary` for the user.

### Step 9 — Automatic Analyst Loop

If the analyst (`{adapter_command:analyze}`) finds any gaps, missing steps, or high severity issues in Step 6:
1. **Pause and Ask**: Conclude your response by asking the user:
   > *"The analyst found [number] gaps/severities in the tasks. Would you like me to automatically clarify and revise the tasks to address these findings?"*
2. **Execute if Approved**: If the user answers "yes" (or equivalent) in their next message, you must:
   - Automatically rewrite `{adapter_path:tasks}` to resolve the detected gaps.
   - Present the clean result.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Skip Step 2 (Flash-Mem MCP Context Retrieval)
- Continue to `{adapter_command:create-tasks}` directly
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
- Generate tasks through `{adapter_command:create-tasks}` or its inline fallback
- Validate against Constitution + architecture boundaries
- Produce summary

## Output Structure

The command MUST return:

```markdown
# Governed Tasks Summary

## Memory Context
- **Status**: [Synthesized / Skipped / Missing]
- **Relevant Decisions**: [List of historical constraints affecting these tasks]

## Security Task Review
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


## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `commands/governed-tasks.md` for direct SpecKit use.