---
description: Perform an architecture-aware verification gate validating implementation against spec.md, plan.md, tasks.md, and the Architecture Constitution.
scripts:
  sh: ../scripts/bash/check-prerequisites.sh --json --paths-only
  ps: ../scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly
---

# Architecture Verification

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). The active `spec.md`, `plan.md`, `tasks.md`, applicable constitutions, security constraints, and code evidence are mandatory and authoritative. Neither Flash-Mem nor `system_context.md` is evidence that a task was implemented.

Validate that the implementation fulfills all tasks in `tasks.md` while adhering to the defined architecture boundaries and the **Architecture Constitution**. This command acts as a post-implementation gate.

## User Input

```text
$ARGUMENTS
```

## Goal

Perform a high-integrity verification of the implementation. Unlike a general review, this command explicitly maps `tasks.md` to code evidence and validates architectural compliance against the project's specific boundaries and standards.

## Operating Constraints

- **STRICTLY READ-ONLY**: This is an analytical gate. Do not modify files.
- **Evidence-Based**: Every "Verified" or "Missing" status must cite specific files or code patterns.
- **Constitution Authority**: The `architecture_constitution.md` is the non-negotiable standard for this check.

## Execution Steps

### 1. Initialize Context

1. Run `{SCRIPT}` from repo root to identify the active `FEATURE_DIR`.
2. Derive absolute paths for `spec.md`, `plan.md`, and `tasks.md`.
3. Load the Architecture Constitution: `.specify/memory/architecture_constitution.md`.
4. Load the Repository Hygiene Config: `.specify/config/repository_hygiene.yml` (fallback to `repository_hygiene` block in constitution).
5. Load the Repository Hygiene Rules: `.specify/extensions/architecture-guard/hygiene-rules/*.md`.

### 2. Semantic Modeling (Internal)

Build internal representations:
- **Task-Boundary Map**: Associate each task with its intended architecture layer (Entry, Application, Domain, Data, External).
- **Implementation Evidence**: For each completed task (`[x]`), scan referenced files for logic that addresses the task description.
- **Contract Inventory**: Extract planned API/Data signatures from `plan.md`.
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

#### B. Boundary Integrity
- **Layer Violation**: Logic from one layer (e.g., Database queries) appearing in another layer (e.g., Controllers/Entry).
- **Dependency Drift**: New dependencies introduced that violate the architecture's "Stable Abstractions" principle.
- **DRY Drift**: The same rule is implemented in multiple places instead of a shared source of truth.

#### C. Constitution Compliance
- **Rule Check**: Does the implementation violate any "MUST" rules in the `architecture_constitution.md`?
- **Pattern Match**: Does the code follow the mandated architectural patterns (e.g., DTOs, Repositories, Events)?

#### D. Security Review on Implementation
- If `security-review` (or compatibility alias `spec-kit-security-review`) is available, run `/speckit.security-review.branch` against the verified implementation.
- If security findings are architecture-relevant, classify them as `Security-Architecture Conflict`.

#### E. Repository Hygiene Validation
- Run all loaded hygiene rules against the repository, respecting configured exclusions from `repository_hygiene` config.
- If a finding's severity matches the `fail_on` list in the configuration, elevate it to CRITICAL to fail the verification gate.
- Other findings should be reported as Warnings or Info based on their base severity or the `warn_on` configuration.

### 4. Severity Assignment

- **CRITICAL**: Task marked done but implementation is missing; Constitution "MUST" violation; Boundary bypass (e.g., direct DB access from UI).
- **HIGH**: Contract mismatch; Missing error-handling/edge-cases from spec; Major boundary erosion; repeated business rules with no shared extraction.
- **MEDIUM**: Pattern drift; Task-referenced file exists but logic is incomplete.
- **LOW**: Naming inconsistencies; Minor structure drift.

## Verification Report

| ID | Category | Severity | Location(s) | Summary | Recommendation |
|:---|:---|:---|:---|:---|:---|
| V1 | Task Integrity | CRITICAL | `tasks.md:T01` | Task marked complete but logic missing in `src/auth.ts` | Implement logic or uncheck task |
| V2 | Boundary | HIGH | `src/ctrl/user.ts` | Database query found in Controller layer | Move query to Repository/Data layer |

### Task Status Analysis
For each task in `tasks.md`:
- **Implemented?**: [Yes/No/Partial]
- **Evidence**: [File path or logic pattern]
- **Gap Analysis**: If "No" or "Partial", explain why the task is incomplete and suggest the remediation.

### Repository Hygiene Status
- **Critical Issues**: [List any hygiene issues that fail verification]
- **Warnings**: [List non-blocking hygiene warnings]
- **Info**: [List minor hygiene notes]

### Metrics
- **Tasks Verified**: [Completed / Total]
- **Requirement Coverage**: [e.g. 100%]
- **Boundary Integrity**: [Strong / Eroded / Breached]
- **Constitution Score**: [e.g. 100%]

### Action Plan
1. **Critical Gaps**: Address missing implementation for tasks [IDs] immediately.
2. **Architecture Alignment**: Resolve boundary violations in [Files] using suggested refactor tasks.
3. **Completion**: If all CRITICAL/HIGH are resolved, you **MUST automatically execute** the durable-memory capture flow to preserve lessons. Do not just recommend it; let the formal capture flow propose entries and request user approval.

**Next Step**: [e.g. "Run `/speckit.architecture-guard.architecture-apply` to fix V2"]
