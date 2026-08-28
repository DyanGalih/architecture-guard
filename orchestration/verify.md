---
description: Verify implementation against specification, design, plan, tasks, architecture rules, and repository hygiene requirements.
---

# Architecture Verification

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `{adapter_path:budgeted-context-template}`. Active adapter artifacts, applicable constitutions, security constraints, and code evidence are mandatory and authoritative. Neither memory nor a fallback index is implementation evidence.

Validate that the implementation fulfills all tasks in `tasks.md` while adhering to the defined architecture boundaries and the **Architecture Constitution**. This command acts as a post-implementation gate.

## User Input

Use the host command's native argument text as optional explicit artifact paths or scope.

## Goal

Perform a high-integrity verification of the implementation. Unlike a general review, this command explicitly maps `tasks.md` to code evidence and validates architectural compliance against the project's specific boundaries and standards.

## Operating Constraints

- **REPOSITORY READ-ONLY**: This analytical gate does not modify repository files. It may write validated durable knowledge to Flash-Mem only after explicit user approval.
- **Evidence-Based**: Every "Verified" or "Missing" status must cite specific files or code patterns.
- **Constitution Authority**: The adapter-resolved architecture rules are the non-negotiable standard. When an adapter declares the split architecture constitution optional, use the architecture rules embedded in `{adapter_path:constitution}` and record that provenance; if neither exists, mark architecture coverage `Degraded` and do not claim compliance.

## Execution Steps

### 1. Initialize Context

1. Resolve explicit artifact paths from native user input first; otherwise discover existing artifacts by matching `{adapter_path:tasks}`, `{adapter_path:plan}`, and `{adapter_path:spec}`. If multiple active sets are plausible, ask the user instead of guessing. If an optional artifact is absent, use an adapter-documented fallback only for the checks it can support, record its provenance, and mark unsupported checks `Degraded` rather than inventing evidence.
2. Resolve the selected artifact set to absolute paths without invoking SDD-tool-specific prerequisite scripts.
3. Load `{adapter_path:arch-constitution}` when present; otherwise use adapter-documented architecture rules embedded in `{adapter_path:constitution}` and record the fallback.
4. Load the Repository Hygiene Config: `{adapter_path:governance-config}` (fallback to `repository_hygiene` block in constitution).
5. Load the Repository Hygiene Rules in deterministic order from `{adapter_path:hygiene-rules}`, `.specify/extensions/architecture-guard/hygiene-rules/*.md`, or source checkout `hygiene-rules/*.md`.
   - **Direct Discovery Guard**: When checking adapter-resolved hidden paths such as `.architecture-guard/**`, use direct directory inspection first, then read listed files. A Glob/search no-match result is inconclusive and MUST NOT be reported as missing. Report a path as unavailable only after direct inspection confirms it does not exist. The verification report MUST explicitly list loaded rule files and counts. Missing optional hygiene rules are non-blocking.

### 2. Semantic Modeling (Internal)

Build internal representations:
- **Task-Boundary Map**: Associate each task with its intended architecture layer (Entry, Application, Domain, Data, External).
- **Implementation Evidence**: For each completed task (`[x]`), scan referenced files for logic that addresses the task description.
- **Contract Inventory**: Extract planned API/Data signatures from the technical design artifact.
- **Requirement Evidence Map**: Map every specification requirement and acceptance criterion to its plan/tasks representation and concrete implementation/test evidence.
- **Artifact Consistency Check**: Compare specification, plan, tasks, and security constraints for contradictions that make implementation intent or acceptance ambiguous.
- **Duplication Check**: Look for repeated business logic, validation, or transformation across files and confirm it has been centralized or explicitly justified.

**Common DRY Signals**
- Repeated business rules, approvals, validation, DTO mapping, or orchestration across multiple layers.
- One rule being implemented in more than one place instead of one shared source of truth.
- Callers recreating a contract, transformation, or decision that already exists in a shared boundary.

### 3. Verification Checks

#### A. Task-Code Alignment
- **Ghost Tasks**: Tasks marked complete but with no evidence in the referenced files.
- **Orphaned Code**: Implementation logic present in files that wasn't planned in `tasks.md`.
- **Missing Files**: Files referenced in tasks that do not exist on disk.
- **Requirement Coverage**: Every requirement and acceptance criterion must be `Verified`, `Partial`, `Missing`, `Contradicted`, or `Not Applicable` with cited artifact and code/test evidence.
- **Artifact Contradictions**: Report conflicting requirements, acceptance criteria, design decisions, or completion claims across spec, plan, and tasks; do not resolve contradictions by silently choosing one artifact.

#### B. Boundary Integrity
- **Layer Violation**: Logic from one layer (e.g., Database queries) appearing in another layer (e.g., Controllers/Entry).
- **Dependency Drift**: New dependencies introduced that violate the architecture's "Stable Abstractions" principle.
- **DRY Drift**: The same rule is implemented in multiple places instead of a shared source of truth.

#### C. Constitution Compliance
- **Rule Check**: Does the implementation violate any "MUST" rules in the `architecture_constitution.md`?
- **Pattern Match**: Does the code follow the mandated architectural patterns (e.g., DTOs, Repositories, Events)?

#### D. Security Review on Implementation
- Detect Security Review independently from host registrations, never from the selected SDD tool or extension files.
- If available, dispatch the detected host Security Review capability's implementation operation directly and include a separate Security Review section in the output. Do not execute adapter fallback prose as a command.
- If unavailable, perform only architecture-visible security checks required by loaded constitutions, mark the independent security review `Unavailable`, and report degraded coverage without claiming a pass.
- If security findings are architecture-relevant, classify them as `Security-Architecture Conflict`.

#### E. Repository Hygiene Validation
- Run all loaded hygiene rules against the repository, respecting configured exclusions from `repository_hygiene` config.
- Determine effective severity and blocking status from the applicable policy: architecture P0 rules, security policy, and hygiene `fail_on`/`warn_on` configuration remain independent. A finding blocks only when its governing policy says it blocks; category alone never changes severity.

### 4. Severity Assignment

- Preserve each governing policy's native severity, then record `Blocking: Yes/No` separately. Architecture P0 and configured hygiene/security blocking levels fail the gate; advisory findings do not.
- **CRITICAL**: Task marked done but implementation is missing; policy-designated critical Constitution violation; Boundary bypass (e.g., direct DB access from UI).
- **HIGH**: Contract mismatch; Missing error-handling/edge-cases from spec; Major boundary erosion; repeated business rules with no shared extraction.
- **MEDIUM**: Pattern drift; Task-referenced file exists but logic is incomplete.
- **LOW**: Naming inconsistencies; Minor structure drift.

## Verification Report

| ID | Category | Severity | Blocking | Location(s) | Target | Summary | Recommendation |
|:---|:---|:---|:---|:---|:---|:---|:---|
| V1 | Task Integrity | CRITICAL | Yes | `tasks.md:T01` | `tasks.md` | Task marked complete but logic missing in `auth.ts` | Implement logic or uncheck task |
| V2 | Boundary | HIGH | No | `ctrl/user.ts` | `{adapter_path:plan}` | Database query found in Controller layer | Move query to Repository/Data layer |

### Requirement Evidence

| Requirement / Acceptance Criterion | Status | Blocking | Spec Evidence | Plan / Task Evidence | Code / Test Evidence |
|:---|:---|:---|:---|:---|:---|
| [Requirement ID or summary] | [Verified / Partial / Missing / Contradicted / Not Applicable] | [Yes/No under active policy] | [Path:line] | [Path:line] | [Path:line or explicit absence] |

### Artifact Contradictions
- **Contradiction**: [Conflicting artifact statements or None]
- **Blocking**: [Yes/No under active policy]
- **Resolution Required**: [Authoritative artifact and decision needed]

### Task Status Analysis
For each task in `tasks.md`:
- **Implemented?**: [Yes/No/Partial]
- **Evidence**: [File path or logic pattern]
- **Gap Analysis**: If "No" or "Partial", explain why the task is incomplete and suggest the remediation.

### Repository Hygiene Status
- **Critical Issues**: [List any hygiene issues that fail verification]
- **Warnings**: [List non-blocking hygiene warnings]
- **Info**: [List minor hygiene notes]

### Security Review Status
- **Capability**: [Available / Unavailable]
- **Coverage**: [Independent / Degraded]
- **Blocking Findings**: [Policy-derived findings or None]

### Metrics
- **Tasks Verified**: [Completed / Total]
- **Requirement Coverage**: [e.g. 100%]
- **Boundary Integrity**: [Strong / Eroded / Breached]
- **Constitution Score**: [e.g. 100%]

### Action Plan
1. **Critical Gaps**: Address missing implementation for tasks [IDs] immediately.
2. **Architecture Alignment**: Resolve boundary violations in [Files] using suggested refactor tasks.
3. **Completion**: If all CRITICAL/HIGH findings are resolved, propose any validated Flash-Mem lessons and write them only after explicit user approval.

### Claude Code Agent Teams Verification Protocol (When Active)
Activate this protocol only when the Claude Code host exposes named teammate spawning and messaging, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is enabled, and the user opted into Agent Teams for the current run. Otherwise execute the same work in single-agent mode:
- **Code Reviewer** leads the verification gate.
- If verification passes without blocking violations, the lead offers the separate governed archive workflow after reporting verification evidence; archival still requires its own approvals.
- If verification exposes boundary drift or unfulfilled tasks, **HITL Gate 2** prompts the user to route back to **Analyst Creator** for task updates and re-assignment.

**Next Step**: [e.g. "Run `{adapter_command:architecture-apply}` to fix V2"]

## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `commands/verify.md` for direct SpecKit use.
