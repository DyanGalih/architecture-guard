---
description: Perform a technology-agnostic architecture review validating pre-implementation planning artifacts against active specification, design, and task documents, as well as the constitutions.
---

# Architecture Review Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). Available active specification documents (e.g., `spec.md`, `design.md`, `plan.md`, `tasks.md`), security constraints, applicable constitutions, and relevant code evidence are authoritative. Use fallback provenance to open historical specs only for named review gaps.

You are running `architecture-guard`, a technology-agnostic architecture review extension designed for high-integrity governance.

## Operating Constraints

- **STRICTLY READ-ONLY**: This command is analytical. Do **not** modify any files. Output a structured report and non-blocking refactor tasks.
- **Progressive Disclosure**: Load context incrementally. Start with manifests and design artifacts.
- **No Implementation Code**: You MUST NOT read, evaluate, or scan implementation code. This command is strictly for validating the planning artifacts against the constitutions before coding begins.
- **Evidence-Based**: Every violation must cite specific "Planning Evidence" (file paths, line numbers, or patterns) or its absence in the artifacts.

---

## Framework-Agnostic vs Framework-Aware Review

**Framework-Agnostic Foundation** (always applied):
- Universal boundary concepts (Entry, App, Domain, Data, External)
- Core governance principles apply to any architecture
- Violations are framework-independent

**Framework-Aware Annotations** (if preset installed):
- If project used preset during init (e.g., Laravel, Django, NestJS):
  - Review vocabulary becomes framework-specific
  - Patterns are mapped to framework conventions
  - Guidance references framework-native concepts
  - BUT underlying violations remain identical

**Coexistence Model**:
- Review always starts technology-agnostic
- If preset detected in `.specify/presets/` or the Constitution: Enhance with framework vocabulary
- Violations list remains the same; explanation becomes framework-native
- Example: "Entry boundary contamination" (agnostic) → "Controller mixing HTTP and business logic" (Laravel-aware)

---

## Determine Review Scope

1. **Normalize Arguments**: Parse "$ARGUMENTS" to identify the `mode` (`architecture` or `performance`) and `focus` aspects (`general`, `db`, `api`, or `async`).
2. **Identify Artifact Scope**:
   - Focus strictly on validating the specification and planning artifacts (e.g., `spec.md`, `design.md`, `plan.md`, `tasks.md`) against the architectural rules and constitutions.
   - Do **NOT** run changed-files detection scripts or evaluate source code.

## Input & Context Loading

Review any available artifacts from these common locations. **IMPORTANT**: You MUST read these files explicitly using your file-reading tools (absolute or relative paths). Do not rely solely on workspace search or semantic indexers, as these files are often in `.gitignore` and may be excluded from default context:

1. **Governance & Security Constitution**:
    - `.specify/memory/constitution.md`
    - `.specify/memory/security_constitution.md`

2. **Architecture Constitution**:
    - `.specify/memory/architecture_constitution.md`

3. **Flash-Mem Context Retrieval**:

   Try Flash-Mem first. If the context is incomplete, read the repository constitution files with file-reading tools rather than workspace search alone.

   If Flash-Mem is unavailable or the context is insufficient, continue with the repository artifacts and constitution files available in the workspace.

4. **Planning Context**:
    - Active specification and planning artifacts (e.g., `spec.md`, `design.md`, `plan.md`, `tasks.md`, `data-model.md`)

5. **Repository Hygiene**:
    - Config: `.specify/config/repository_hygiene.yml` (or `repository_hygiene` block in constitution).
    - Rules: `.specify/extensions/architecture-guard/hygiene-rules/*.md`

## Semantic Modeling

Before analysis, build internal representations (do not output these):
1. **Boundary Model**: Map the expected boundaries (Entry, Application, Domain, Data, External) vs. actual directory structure.
2. **Contract Inventory**: Identify shared data shapes, API signatures, and event structures.
3. **Task-Implementation Map**: Map `tasks.md` IDs to specific code files and check completion status.
4. **Dependency Graph**: Map module-to-module dependencies to detect coupling or layering violations.

## Review Principles

Use these core principles to detect drift:
- **Validation Boundaries**: External input must be validated before reaching core logic.
- **Contract Fidelity**: Shapes should be expressed through contracts at shared boundaries.
- **Entry Point Delegation**: Controllers/Handlers must delegate business logic to services/domain.
- **Stable Abstractions**: Modules should depend on interfaces/abstractions, not internals.
- **Isolation**: Data access, external APIs, and infrastructure must be isolated.
- **Consistency**: Comparable endpoints or modules must use compatible patterns.
- **DRY / Single Source of Truth**: Repeated business rules, validation, transformations, or orchestration should be centralized once and reused instead of copied across modules.
- **Ponytail Pragmatism (YAGNI)**: Apply the shared decision ladder in order. Implementations must be minimal without weakening correctness, safety, accessibility, or verification.
- **Non-Blocking**: Identify drift without converting style preferences into hard failures.

## Detection Scope

Detect violations such as:
- **Intent Divergence**: Implementation deviates fundamentally from the specification or design intent.
- **Hallucinated Abstractions**: Plan mentions an abstraction (e.g., Repository) that is missing in code.
- **Boundary Erosion**: Business logic leaking into entry points or UI.
- **Tight Coupling**: Circular dependencies or cross-module leakage.
- **Duplication Drift**: The same rule, validation, mapping, or workflow is implemented in multiple places instead of a shared boundary.
- **Contract Mismatch**: Mismatch between API, UI, or service shapes.
- **Ponytail Violation (Bloat)**: Code is over-engineered, duplicates an existing capability, adds avoidable files or dependencies, includes unnecessary boilerplate or future-proofing, or bypasses a correct standard-library or native-platform feature.
- **Ponytail Violation (Unsafe Simplification)**: A small diff removes required validation, authorization, data-loss prevention, accessibility, external-system safeguards, or verification.
- **Root-Cause Miss**: A symptom is patched in one caller while sibling callers remain exposed to the same shared defect.
- **Constitution Breach**: Any conflict with a "MUST" principle in the Constitution.

**Duplication Drift Example**
- Finding: Both `checkout/controller.ts` and `checkout/service.ts` calculate the same tax rule.
- Evidence: Each file applies the same conditional logic for the same inputs.
- Recommended Fix: Keep the rule in the shared service/domain boundary and make the controller delegate to it.

**Common DRY Signals**
- Repeated business rules, approvals, validation, DTO mapping, or orchestration across multiple layers.
- One rule being implemented in more than one place instead of one shared source of truth.
- Callers recreating a contract, transformation, or decision that already exists in a shared boundary.

## Review Procedure

1. **Identify Scope**: Load artifacts.
2. **Model Context**: Build Semantic Models for the identified scope.
3. **Analyze Alignment**: Compare the initial specification intent vs. the proposed architectural design. Ensure the proposed design or plan accurately satisfies the spec without violating constraints.
4. **Scan Principles**: Apply Review Principles across the planned boundaries.
5. **Security & Governance Cross-Check**:
  - If `security-constraints.md` or `security_constitution.md` is breached, log it as a critical violation.
  - Cross-reference architecture decisions with security trust boundaries.
6. **Ponytail Audit**: Apply both sides of the shared contract to the plan. Check for planned bloat and unsafe under-building.
7. **Performance Scan (if mode=performance)**: Skip violations; focus on optimizations.
8. **Repository Hygiene Scan**: Evaluate the planning structure against hygiene rules loaded from `.specify/extensions/architecture-guard/hygiene-rules/*.md`.
9. **Generate Refactors**: Produce structured tasks for each confirmed violation in the plan.

---

Every violation MUST cite evidence or explicitly note its absence. Evidence can be:

- **Specific**: Concrete reference like `plan.md proposes placing pricing logic in the entry boundary instead of the domain layer`
- **Pattern**: Behavioral observation like `All 5 proposed endpoints lack standard response contract definitions`
- **Absence**: Missing planning detail like `Task references Repository pattern but no data access module is planned`

**Absence Evidence** is acceptable for CRITICAL violations only. Example:
- "Constitution requires data access abstraction but `plan.md` does not specify one"

For all other violations, cite specific planning locations, lines, or patterns. Vague claims like "business logic is leaking" without specific evidence are insufficient.

---

## Severity Guide

- **CRITICAL**: Violates Constitution MUST, breaches Security Constraint, or has zero implementation evidence for a required boundary.
- **HIGH**: Significant boundary erosion, contract inconsistency, or fundamental intent divergence.
- **MEDIUM**: Pattern drift or local inconsistency that creates technical debt.
- **LOW**: Minor naming, shape, or structure drift.

## Output Format

Return only this structure:

# Architecture Review Report

| ID | Category | Severity | Location(s) | Summary | Evidence/Rationale |
|:---|:---|:---|:---|:---|:---|
| V1 | Constitution | CRITICAL | `.specify/memory/architecture_constitution.md` | Violation of [Principle Name] | [Evidence from spec/plan/tasks] |

### Task Synchronization
- **Status**: [Synced / Drifted]
- **Missing Implementations**: [Files referenced in tasks but missing/empty]
- **Pending Tasks**: [Incomplete tasks blocking architecture]

### Metrics
- **Constitution Compliance**: [e.g. 90%]
- **Boundary Integrity**: [e.g. Strong / Eroded]
- **Architectural Risk**: [LOW / MEDIUM / HIGH / CRITICAL]

### Refactor Tasks
[Refactor Task]
- **Title**: 
- **Priority**: [Based on Severity]
- **Reason**: 
- **Consequence**:
- **Suggested Fix**: 
- **Verification**:
- **Trade-off**:

---

(Only if `mode=performance`)
### Performance Insights
- **Suggestion**: 
- **Trade-off**: 

### Repository Hygiene Report
(Always included if hygiene rules are evaluated)
Findings categorized by severity based on the active hygiene rules.

| Category | Severity | Location(s) | Summary | Recommendation |
|:---|:---|:---|:---|:---|
| [Rule Identifier] | [CRITICAL/HIGH/WARNING/INFO] | [File path] | [Finding explanation] | [Suggested action] |

---

(Only if `mode=architecture` and Constitution drift is cross-cutting)
### Constitution Update Proposal
- **Current Rule**: 
- **Proposed Change**: 
- **Rationale**: 

---

### Action Plan
1. **Critical Fixes**: Address Constitution and Security violations first.
2. **Architecture Alignment**: Resolve boundary erosion and contract mismatches.
3. **DRY Alignment**: Centralize repeated business logic, validation, and mapping before duplicating it in another layer or module.
4. **Durable Memory Preservation (Mandatory Check)**: If new architectural patterns, decisions, or repeatable lessons were identified, you **MUST automatically execute** the durable-memory capture flow immediately after providing the report. Do not just recommend it; let the formal capture flow propose entries and request user approval.
5. **Next Step**: [e.g. Run `/speckit.security-review.plan` for security-first findings, or `/ag-apply` for architecture fixes]
6. **Remediation**: [Concrete remediation direction for the top issues, or "None needed"]

## Framework Preset Guidance

If framework preset guidance exists, it is **mandatory** to use it to map generic principles to framework primitives and detect stack-specific anti-patterns.

Preset path:
- `.specify/presets/architecture-guard-preset.md`
