---
description: Run implementation with memory context, then review the produced implementation against security and architecture constraints.
---

# Governed Implement Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). The active feature's `tasks.md` is mandatory and authoritative; load its active `plan.md`, `spec.md`, and security constraints whenever a task lacks enough context. Flash-Mem and `system_context.md` may supplement but never replace active artifacts.

You are orchestrating the `governed-implement` workflow for `architecture-guard`.

This command coordinates implementation and post-implementation review to ensure the output respects architectural, historical, and security constraints.

## Goal

Provide a single command that ensures:
1. Implementation is historical-context aware when Flash-Mem is available.
2. Implementation is performed (`/speckit.implement`).
3. The output is reviewed for security vulnerabilities (Security Review).
4. The output is reviewed for architectural drift (Architecture Guard).

## Orchestration Flow

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` (or compatibility alias `spec-kit-security-review`) extension

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment. Do not treat it as a Spec Kit extension or look for it in `.specify/extensions.yml`.
2. Read `.specify/extensions.yml` and check the `installed` list for `security-review` (or compatibility alias `spec-kit-security-review`). Fall back to checking for the extension directory in `.specify/extensions/` only if the YAML is missing or the list is empty.
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before implementation. Prefer summary-first context and only expand into repository files when needed.

If Flash-Mem is unavailable or the context is insufficient, continue with the repository artifacts and constitution files available in the workspace.

**[OPTIONAL SUB-AGENT DELEGATION]**
* **Capability Gate:** First confirm that `/speckit.subagent.synthesize` is registered and callable. If it is unavailable, execute inline regardless of size and report the degraded path.
* **Trigger Condition:** When the capability is available, you **MUST** delegate memory retrieval and synthesis if:
  - The Flash-Mem index contains $\ge 20$ memory documents.
  - OR the project repository contains $\ge 15$ active ADRs/docs.
  - Otherwise, you **MUST** execute inline.
* **Execution Syntax:** Call the memory synthesis sub-agent via:
  `/speckit.subagent.synthesize --context=implementation`
* **Strict Handoff Template:** Format the sub-agent prompt exactly like this:
  ```yaml
  Task: Retrieve and synthesize relevant architecture constraints and ADRs.
  Focus: Rules and conventions affecting codebase implementation.
  Expected Output: Synthesized markdown summary of constraints to guide coding and refactoring.
  ```


---

### Step 3 — Orchestrate Spec Kit Implement

You must orchestrate the `/speckit.implement` (core implementation) workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must perform the implementation by following the `tasks.md` breakdown:
1. **Apply Ponytail Core**: Trace the affected execution flow and apply the shared decision ladder in order. A one-line solution is preferred only when it is correct, readable, and reached after checking YAGNI, existing code, the standard library, native platform features, and installed dependencies.
   - For fixes or shared behavior, search every caller and sibling path, then correct the owning implementation once when that is the true root cause.
   - Preserve the contract safety floor and leave at least one runnable check for non-trivial logic.
2. **Execute Tasks**: Run `/speckit.implement`. If `/speckit.implement` is not available as a registered command, fall back to inline implementation:
   - Read `specs/<feature>/tasks.md` and execute each unchecked task sequentially.
   - Read all applicable constitution files and any available Flash-Mem context before coding.
   - Perform the actual coding work (writing files, running tests) for each task, enforcing Ponytail minimalism.
   - Note in the Governance Summary that `/speckit.implement` was unavailable and implementation was performed inline.
3. **Write Code**: Perform the actual coding work (writing files, running tests) required by the tasks.
4. **Sync the tasks**: You MUST update `specs/<feature>/tasks.md` to mark completed tasks with `[x]`, check them off, and add any new subtasks discovered during implementation.
5. The implementation MUST follow current tasks and context. Use Flash-Mem first when available. If retrieval is unavailable or insufficient, read active artifacts and constitution files directly with file-reading tools. Do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`.

NOTE: The core Spec Kit command is `speckit.implement`. Do not use `speckit.implementation` as it is not a registered command.

### Step 4 — Security Review on Implementation

IF `security-review` (or compatibility alias `spec-kit-security-review`) is available:
1. **Execute Review**: Run `/speckit.security-review.branch` to review the produced implementation against security vulnerabilities.
2. Check for: authorization bypass, missing validation, secret leakage, injection risk, and insecure data exposure.
3. If security findings are architecture-relevant, classify them as `Security-Architecture Conflict` for the architecture review.

### Step 5 — Architecture Review on Implementation

Run:
```text
/speckit.architecture-guard.architecture-review
```

Review implementation against:
- `.specify/memory/architecture_constitution.md`.
- Plan, tasks, and `security-constraints.md`.
   - Accepted deviations and any available Flash-Mem context.

### Step 5.5 — Blocking Decision Tree

**Critical Decision Point**: Evaluate architecture findings for blocking issues.

```
IF Architecture Review finds CRITICAL or HIGH violations:
  IF Constitution marks violation as P0 (blocking):
    STOP implementation
    Surface violations in report
    Ask user: "Critical architecture violation detected. Proceed? (y/n)"
    IF user says no:
      Return early with architecture remediation tasks
  ELSE (violation is HIGH but not Constitution P0):
    Continue with warning
    Create non-blocking refactor tasks
    Flag for post-merge remediation
ELSE (no critical violations):
  Continue to Step 6
```

**Rationale**: This ensures architectural integrity while preserving delivery momentum for non-blocking issues.

### Step 6 — Generate Refactor Tasks

IF architecture violations exist:
1. Run `/speckit.architecture-guard.refactor-generator`.
2. Generate non-blocking refactor, migration, or correction tasks.
3. Skip performance refactors unless explicitly requested.

### Step 7 — Proactive Durable Memory Preservation

If the implementation review or security audit identified new architectural patterns, critical decisions, or repeatable lessons:
1. **Proactive Execution**: You **MUST automatically execute** the durable-memory capture flow as the final part of this turn. Do not just recommend it; run the command.
2. **Standard**: Do not silently write memory outside the capture flow; let the formal capture flow propose entries and handle user approval. Do not ask the user if they want to capture; identify the lessons and trigger the command immediately after the summary.

### Step 8 — Implementation Governance Summary

Produce a final `Governed Implementation Summary`.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Skip Step 2 (Flash-Mem MCP Context Retrieval)
- Continue to `/speckit.implement` directly
- Assume no historical implementation constraints beyond Constitution

**Without Security Review**:
- Skip Step 4 (Security Review on Implementation)
- Continue to architecture review directly
- Flag missing security implementation review in summary

**Critical Architecture Violations Found**:
- If Constitution marks as P0 (blocking):
  - STOP implementation workflow
  - Surface violations immediately
  - Return early with remediation guidance
- If HIGH but not P0:
  - Continue with warning
  - Create non-blocking refactor tasks
  - Flag for post-merge remediation

**Minimal Viable Workflow** (only Architecture Guard + Spec Kit):
- Execute implementation via core Spec Kit
- Run architecture review on output
- Generate non-blocking refactor tasks
- Produce summary

## Output Structure

The command MUST return:

```markdown
# Governed Implementation Summary

## Memory Context
- **Status**: [Refreshed / Skipped / Missing]
- **Relevant Decisions**: [Durable lessons applied during implementation]

## Security Review
- **Findings**: [List of security vulnerabilities found]
- **Constraints**: [Trust boundaries validated]
- **Blocking Concerns**: [Any P0 security risks]

## Architecture Review
- **Violations**: [Drift findings or Security-Architecture Conflicts]
- **Refactor Tasks**: [Suggested corrections]
- **Constitution Update Proposals**: [Proposed updates to `.specify/memory/architecture_constitution.md`]

## Implementation Status
- [Ready to merge / Needs security fix / Needs architecture refactor / Needs constitution update]

## Recommended Next Step
- [e.g., Merge changes]
- [e.g., Revise implementation to address Security Conflict]
- [e.g., Run /speckit.architecture-guard.architecture-apply]
- **Durable Memory Preservation**: (Proactively triggered) Review the proposed memory entries below.
- **Verification Gate**: Run `/speckit.architecture-guard.architecture-verify` to ensure all tasks are delivered and requirements are met.
```

## Security + Architecture Conflict Handling

If Security Review finds an issue affecting architecture, classify it as a `Security-Architecture Conflict`.
Example:
- Violation: Pricing decision in client UI.
- Security Constraint: Pricing authority must remain server-side.
- Suggested Fix: Move pricing calculation to backend service.

## Architecture Evolution Handling

If implementation repeatedly violates a standard because the standard is outdated, generate a `Constitution Update Proposal` targeting `.specify/memory/architecture_constitution.md`.

## Guardrails

- **Modular**: Do not mix security findings into a generic architecture list.
- **Framework-Agnostic**: Maintain boundary concepts (Entry, Domain, Data).
- **Non-Blocking**: Adhere to the non-blocking philosophy for architecture findings.
- **Memory-First**: Prefer cached synthesis and selected index entries before broad file reads.
