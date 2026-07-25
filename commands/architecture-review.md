---
description: Perform a framework-agnostic architecture review validating implementation against spec.md, plan.md, tasks.md, and the governance and architecture constitutions.
scripts:
  sh: ../scripts/bash/detect-changed-files.sh
  ps: ../scripts/powershell/detect-changed-files.ps1
---

# Architecture Review Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). Available active `spec.md`, `plan.md`, `tasks.md`, security constraints, applicable constitutions, and relevant code evidence are authoritative. Use fallback provenance to open historical specs only for named review gaps.

You are running `architecture-guard`, a framework-agnostic architecture review extension designed for high-integrity governance.

## Operating Constraints

- **STRICTLY READ-ONLY**: This command is analytical. Do **not** modify any files. Output a structured report and non-blocking refactor tasks.
- **Progressive Disclosure**: Load context incrementally. Start with manifests and design artifacts before deep-diving into implementation code.
- **Evidence-Based**: Every violation must cite specific "Implementation Evidence" (file paths, line numbers, or code patterns) or its absence.

---

## Sub-Agent Delegation (Hybrid Model)

Throughout this command, complex analysis steps offer **optional sub-agent delegation**:

**Syntax: `[OPTIONAL SUB-AGENT DELEGATION]`**

When you see this marker in a step, evaluate these conditions:
1. **Capability Gate:** Confirm that the intended sub-agent command is registered and callable. If it is unavailable, execute inline regardless of size and report the degraded path.
2. **Trigger Condition:** When the capability is available, you **MUST** delegate to a sub-agent if:
   - The number of changed files is $\ge 15$.
   - OR the total diff size is $\ge 500$ lines of code.
   - OR the Flash-Mem context contains $> 20$ memory documents.
   - Otherwise, you **MUST** execute inline.
3. **Override Command:** Explicit `--inline` or `--delegate` CLI flags override the auto-detection triggers above, but `--delegate` cannot bypass the capability gate.
4. **Execution Syntax:** To delegate, call the sub-agent via the following pattern:
   `/[extension_name].[sub_agent_command] --files=[comma_separated_file_list] --rules=[path_to_rules]`
5. **Strict Handoff Template:** When spawning the sub-agent, you must format your invocation prompt exactly like this:
   ```yaml
   Task: Analyze code quality and boundary violations.
   Target Files: [Comma-separated list of target files]
   Rules File: .specify/memory/architecture_constitution.md
   Context: [Brief summary of planning/implementation state]
   Expected Output: JSON list of structured violations.
   ```

This pattern ensures that lower-tier models follow strict execution paths instead of failing on complex evaluations.


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
- Review always starts framework-agnostic
- If preset detected in `.specify/presets/` or the Constitution: Enhance with framework vocabulary
- Violations list remains the same; explanation becomes framework-native
- Example: "Entry boundary contamination" (agnostic) → "Controller mixing HTTP and business logic" (Laravel-aware)

---

## Determine Review Scope

1. **Normalize Arguments**: Parse "$ARGUMENTS" to identify the `mode` (`architecture` or `performance`) and `focus` aspects (`general`, `db`, `api`, or `async`).
2. **Identify Changed Files**:
   - If the user provided a file list or explicit instructions, follow them.
   - Otherwise, you **MUST** execute the `{SCRIPT}` with `--json` to detect changed files since the merge-base or in the working directory.
   - Use the `changed_files` list as the primary review set.

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

4. **Implementation Context**:
    - `spec.md`, `plan.md`, `tasks.md`, `data-model.md`
    - The detected `changed_files` and their respective directories.

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
- **Intent Divergence**: Implementation deviates fundamentally from `spec.md` or `plan.md` intent.
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

1. **Identify Scope**: Run `{SCRIPT}` or use user-provided files.
2. **Model Context**: Load artifacts and build the Semantic Models for the identified scope.
3. **Verify Evidence**: Check if task-referenced files exist and contain expected implementation logic.
4. **Analyze Alignment**: Compare `spec.md` intent vs. `plan.md` architecture vs. implementation behavior.
5. **Scan Principles**: Apply Review Principles across the implemented boundaries.
6. **Security & Governance Cross-Check**:
  - If `security-constraints.md` or `security_constitution.md` is breached, log it as a critical violation.
  - If a finding is primarily security-related and Security Review is available, route it to `/speckit.security-review.branch` instead of duplicating it here.
  - Cross-reference architecture decisions with security trust boundaries.
7. **Ponytail Audit**: Apply both sides of the shared contract. Check for bloat and unsafe under-building; trace changed shared behavior to its callers; verify the earliest viable ladder rung was used; and confirm non-trivial logic has a runnable check.
8. **Performance Scan (if mode=performance)**: Skip violations; focus on optimizations.
8b. **Code Quality Scan (SonarLint)**: If `mode=architecture`, optionally scan for coupling/complexity violations.
8c. **Repository Hygiene Scan**: Evaluate the repository against all hygiene rules loaded from `.specify/extensions/architecture-guard/hygiene-rules/*.md`. Apply exclusions and severity overrides defined in the project's `repository_hygiene` configuration.
9. **Generate Refactors**: Produce structured tasks for each confirmed violation.

---

## Code Quality Scan (SonarLint) — Optional Step 7b

This step runs code quality checks using bundled SonarLint rules. It is **optional** and complements architecture violations.
The rules bundle is repository-native and IDE-agnostic, so it works the same in VS Code, Cursor, JetBrains, or CLI-only workflows.
When the extension is installed, load the bundle from `.specify/extensions/architecture-guard/sonar-rules/sonarlint-rules.json`.

### Activation

- Run only if `mode=architecture` (not for performance mode)
- Skip if user explicitly disables with `--no-sonarlint`
- Skip if the repository does not contain a SonarLint rules bundle or the bundle is empty
- If skipped, continue the rest of the architecture review and note that the optional SonarLint scan was unavailable

### Scope-Based Delegation (Hybrid Model)

**Capability Gate:** First confirm that `/analyze-sonar-violations` is registered and callable. If it is unavailable, execute inline regardless of size.

**Trigger Condition:** When the capability is available, you **MUST** delegate to the sub-agent if:
- Changed files is $\ge 15$.
- OR total lines in diff is $\ge 500$.
- Otherwise, you **MUST** execute inline.

**Execution Syntax:**
* Custom command: `/analyze-sonar-violations --files=[comma_separated_file_list] --rules=.specify/extensions/architecture-guard/sonar-rules/sonarlint-rules.json`.

**Strict Handoff Template:**
When delegating, write the sub-agent invocation prompt exactly like this:
```yaml
Task: Scan files against SonarLint rules.
Target Files: [Comma-separated list of target files]
Rules File: .specify/extensions/architecture-guard/sonar-rules/sonarlint-rules.json
Expected Output: JSON list of CRITICAL/HIGH code quality violations mapped to architecture boundaries.
```


### Procedure

**If inline**:
1. **Load Rules**: Read the installed extension bundle at `.specify/extensions/architecture-guard/sonar-rules/sonarlint-rules.json` first; if running from the extension source checkout, use `sonar-rules/sonarlint-rules.json`
2. **Scan Changed Files**: Simulate or invoke SonarLint logic on `changed_files` list
3. **Filter Results**: Keep only CRITICAL/HIGH severity findings related to complexity, coupling, structure
4. **Map to Boundaries**: Correlate findings with architecture boundaries (Entry/App/Domain/Data/External)
5. **Deduplicate**: If a violation is already in architecture violations list, suppress from SonarLint output
6. **Categorize**: Group findings by rule category (Brain Overload, Dependency Coupling, Structure Drift, Performance Anti-patterns)

**If delegated to sub-agent**:
- Sub-agent receives rules JSON + changed files list
- Returns structured violations (organized by category and severity)
- Main agent integrates into architecture report

### Interpretation Guide

| SonarLint Category | Architecture Signal |
|---|---|
| Brain Overload (high complexity) | Hidden boundaries; function does too much |
| Dependency Coupling (tight dependencies) | Cross-module leakage; missing abstraction |
| Structure Drift (inconsistent patterns) | Boundary erosion; inconsistent contracts |
| Performance Anti-patterns | Possible architectural misuse (e.g., N+1 queries from wrong layer) |

### Output Integration

Add a new section in the report (see Output Format below):

```markdown
### Code Quality Findings (SonarLint)

Findings that correlate with architecture concerns:

| Rule | Severity | File | Issue |
|---|---|---|---|
| [Rule Key] | [HIGH/CRITICAL] | [File:Line] | [Issue summary + recommended boundary fix] |
```

**Note**: Pure style violations (formatting, naming conventions) are filtered out.

---

Every violation MUST cite evidence or explicitly note its absence. Evidence can be:

- **Specific**: Concrete code reference like `src/checkout/route.js:45-67 contains pricing logic that should be in service layer`
- **Pattern**: Behavioral observation like `All 5 user endpoints return different response shapes instead of standard contract`
- **Absence**: Missing implementation like `Task references Repository pattern but no repo/ folder exists`

**Absence Evidence** is acceptable for CRITICAL violations only. Example:
- "Constitution requires data access abstraction but `repositories/` folder does not exist"

For all other violations, cite specific code locations, line numbers, or patterns. Vague claims like "business logic is leaking" without specific evidence are insufficient.

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
| V1 | Constitution | CRITICAL | `.specify/memory/architecture_constitution.md` | Violation of [Principle Name] | [Evidence from code/plan] |

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

(Only if `mode=architecture` and SonarLint findings detected)
### Code Quality Findings (SonarLint)

Findings that correlate with architecture concerns:

| Rule | Severity | File | Issue | Architecture Signal |
|:---|:---|:---|:---|:---|
| `brain-overload::...` | HIGH | src/service/checkout.ts:45 | Function has 8 parameters | Hidden boundary: pricing logic should be in dedicated module |

**Note**: Pure style violations (formatting, naming) are filtered out. Only findings related to complexity, coupling, and structure are included.

---

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
3. **Code Quality**: Address SonarLint findings that map to architectural concerns (if any).
4. **DRY Alignment**: Centralize repeated business logic, validation, and mapping before duplicating it in another layer or module.
5. **Durable Memory Preservation (Mandatory Check)**: If new architectural patterns, decisions, or repeatable lessons were identified, you **MUST automatically execute** the durable-memory capture flow immediately after providing the report. Do not just recommend it; let the formal capture flow propose entries and request user approval.
6. **Next Step**: [e.g. Run `/speckit.security-review.branch` for security-first findings, or `/speckit.architecture-guard.architecture-apply` for architecture fixes]
7. **Remediation**: [Concrete remediation direction for the top issues, or "None needed"]

## Framework Preset Guidance

If framework preset guidance exists, it is **mandatory** to use it to map generic principles to framework primitives and detect stack-specific anti-patterns.

Preset path:
- `.specify/presets/architecture-guard-preset.md`
