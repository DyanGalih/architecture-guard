---
description: Execute implementation tasks, then review the result against available security and architecture constraints.
---

# Governed Implement Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md`. Resolve the active adapter in this order: explicit `--adapter` override, `.architecture-guard/selected-adapter` as the authoritative persisted selection, then filesystem markers only when no persisted selection exists. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. Resolve every adapter token before continuing.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `{adapter_path:budgeted-context-template}`. `{adapter_path:tasks}` is authoritative; load `{adapter_path:plan}`, `{adapter_path:spec}`, and security constraints when a task lacks context. Memory and supported fallbacks may supplement but never replace active artifacts.

You are orchestrating the `ag-governed-implement` workflow for `architecture-guard`.

This command coordinates implementation and post-implementation review to ensure the output respects architectural, historical, and security constraints.

## Goal

Provide a single command that ensures:
1. Implementation is historical-context aware when Flash-Mem is available.
2. Implementation is performed (`{adapter_command:implement}`).
3. The output is reviewed for security vulnerabilities (Security Review).
4. The output is reviewed for architectural drift (Architecture Guard).

## Orchestration Flow

### Write Approval Gate

Before the first mutation, resolve and preview the exact code, test, and task artifacts together with all planned implementation, test, and task-checkbox operations. Obtain explicit user approval, then allow routine writes already previewed within this implementation phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` host capability

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment. Do not treat it as a Spec Kit extension or look for it in `{adapter_path:extensions}`.
2. Detect Security Review as an independent host capability, never from an SDD extensions artifact. Do not read `{adapter_path:extensions}` or `{adapter_path:extensions-dir}` for it.
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, execute both `get_project_summary` and `search_memory` scoped to the active feature, affected files, architecture boundaries, security-sensitive areas, prior decisions, and approved exceptions before implementation. Prefer summary-first context and load full entries only when those results are insufficient.

If Flash-Mem is unavailable or the context is insufficient, continue with the repository artifacts and constitution files available in the workspace.

**[OPTIONAL SUB-AGENT DELEGATION]**
* **Capability Gate:** First confirm that `{adapter_command:subagent-synthesize}` is registered and callable. If it is unavailable, execute inline regardless of size and report the degraded path.
* **Trigger Condition:** When the capability is available, you **MUST** delegate memory retrieval and synthesis if:
  - The Flash-Mem index contains $\ge 20$ memory documents.
  - OR the project repository contains $\ge 15$ active ADRs/docs.
  - Otherwise, you **MUST** execute inline.
* **Execution Syntax:** Call the memory synthesis sub-agent via:
  `{adapter_command:subagent-synthesize} --context=implementation`
* **Strict Handoff Template:** Format the sub-agent prompt exactly like this:
  ```yaml
  Task: Retrieve and synthesize relevant architecture constraints and ADRs.
  Focus: Rules and conventions affecting codebase implementation.
  Expected Output: Synthesized markdown summary of constraints to guide coding and refactoring.
  ```


---

### Step 3 — Orchestrate SDD Tool Implementation

You must orchestrate the `{adapter_command:implement}` (core implementation) workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must perform the implementation by following the `tasks.md` breakdown:
1. **Apply Ponytail Core**: Trace the affected execution flow and apply the shared decision ladder in order. A one-line solution is preferred only when it is correct, readable, and reached after checking YAGNI, existing code, the standard library, native platform features, and installed dependencies.
   - For fixes or shared behavior, search every caller and sibling path, then correct the owning implementation once when that is the true root cause.
   - Preserve the contract safety floor and leave at least one runnable check for non-trivial logic.
2. **Execute Tasks**: Run `{adapter_command:implement}`. If `{adapter_command:implement}` is not available as a registered command, fall back to inline implementation:
   - Read `{adapter_path:tasks}` and execute each unchecked task sequentially.
   - Read all applicable constitution files and any available Flash-Mem context before coding.
   - Perform the actual coding work (writing files, running tests) for each task, enforcing Ponytail minimalism.
   - Note in the Governance Summary that `{adapter_command:implement}` was unavailable and implementation was performed inline.

#### Claude Code Agent Teams Coordination (When Active)

When running in Claude Code with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`:
- **Teammate C (Partitioned Implementers)**:
  - Decompose `tasks.md` into independent modules/file boundaries.
  - Partition sub-teammates as needed:
    - **Teammate C.1**: Core domain / backend services.
    - **Teammate C.2**: Entrypoints / CLI / Frontend.
    - **Teammate C.3**: Unit tests and runnable checks.
  - Teammates work concurrently using git task locking, strictly avoiding parallel edits to the same files.
- **Teammate D (Implementation Reviewer)**:
  - Audits code changes across boundaries, reviews security constraints, and verifies tests before handoff.
- **Human-in-the-Loop Gate**:
  - Lead session collects implementation evidence, presents the completed task checklist, and requires explicit user confirmation before concluding or advancing to `/ag-verify`.

3. **Write Code**: Perform the actual coding work (writing files, running tests) required by the tasks.
4. **Inline Pre-Completion Self-Verification Gate**: Before marking any task complete:
   - **Deprecated & Dangerous Code Check**: Check changed and target files against `{adapter_path:hygiene-rules}/deprecated-and-dangerous-code.md` (or local hygiene rules) to ensure no obsolete, deprecated, or fatal language/framework patterns are introduced.
   - **Repository Hygiene Check**: Inspect changed files against `{adapter_path:hygiene-rules}` (no `.tmp`, `.new`, or scratch files left behind; no commented-out code; no dead imports).
   - **Heuristic SonarLint Scan**: Check changed files against `{adapter_path:sonar-rules}/sonarlint-rules.json` (ensure no cognitive overload, tight coupling, loose `any`/`unknown` casts, or missing parameter validation).
   - **Immediate Remediation**: Correct any detected quality or hygiene violations immediately at the current task boundary.
5. **Sync the tasks**: You MUST update `{adapter_path:tasks}` to mark completed tasks with `[x]`, check them off, and add any new subtasks discovered during implementation.
   - If implementation would expand beyond accepted spec/plan/task scope, stop and obtain explicit user approval before adding or executing that work. Record the approved expansion in the authoritative artifacts first.
6. The implementation MUST follow current tasks and context. Use Flash-Mem first when available. If retrieval is unavailable or insufficient, read active artifacts and constitution files directly with file-reading tools. Do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`.

The SDD-tool-native implementation behavior is defined only by `{adapter_command:implement}`.

### Step 4 — Security Review on Implementation

IF `security-review` is available as a host capability:
1. **Execute Review**: Dispatch the detected host Security Review capability's branch/implementation operation directly. Do not execute adapter fallback prose as a command.
2. Check for: authorization bypass, missing validation, secret leakage, injection risk, and insecure data exposure.
3. If security findings are architecture-relevant, classify them as `Security-Architecture Conflict` for the architecture review.
4. Independently derive each finding's effective severity and blocking status from `{adapter_path:security-constitution}` or the applicable security policy in `{adapter_path:constitution}`. Stop for policy-designated blocking findings; advisory findings do not become blocking merely because they are security findings.

### Step 5 — Architecture Review on Implementation

Run:
```text
`{adapter_command:architecture-review}`
```

Review implementation against:
- `{adapter_path:arch-constitution}`.
- Plan, tasks, and `security-constraints.md`.
   - Accepted deviations and any available Flash-Mem context.

### Step 5.5 — Blocking Decision Tree

**Critical Decision Point**: Evaluate architecture and security findings independently for blocking issues.

```
IF Architecture Review finds CRITICAL or HIGH violations:
  IF Constitution marks violation as P0 (blocking):
    STOP implementation
    Surface violations in report
    Return early with architecture remediation tasks; a simple proceed prompt cannot override P0
  ELSE (violation is HIGH but not Constitution P0):
    Continue with warning
    Create non-blocking refactor tasks
    Flag for post-merge remediation
ELSE (no critical violations):
  Continue to Step 6

IF Security Review finds a policy-designated blocking violation:
  STOP implementation completion
  Surface the security remediation tasks independently of architecture findings
```

**Rationale**: This ensures architectural integrity while preserving delivery momentum for non-blocking issues.

### Step 6 — Generate Refactor Tasks

IF architecture violations exist:
1. Run `{adapter_command:refactor-generator}`.
2. Generate blocking remediation tasks for unresolved P0 or policy-designated blocking findings; generate advisory refactor, migration, or correction tasks for all other findings.
3. Skip performance refactors unless explicitly requested.

### Step 7 — Mandatory Verification Gate

Run `{adapter_command:verify}` after implementation and reviews. Do not mark the workflow complete or ready to merge until verification passes with no unresolved blocking findings; if unavailable as a registered capability, execute the Architecture Guard verification workflow inline.

### Step 8 — Proactive Durable Memory Preservation

If the implementation review or security audit identified new architectural patterns, critical decisions, or repeatable lessons:
1. **Approval Required**: Propose validated durable-memory entries and execute the capture flow only after explicit user approval.
2. **Standard**: Do not silently write memory outside the approved capture flow.

### Step 9 — Implementation Governance Summary

Produce a final `Governed Implementation Summary`.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Skip Step 2 (Flash-Mem MCP Context Retrieval)
- Continue to `{adapter_command:implement}` directly
- Use active spec, plan, tasks, repository evidence, and any present constitutions as current authority; report that historical memory context was unavailable rather than assuming no historical constraints exist

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

**Minimal Viable Workflow** (Architecture Guard plus the selected SDD tool):
- Execute implementation through `{adapter_command:implement}` or its inline fallback
- Run architecture review on output
- Generate non-blocking refactor tasks
- Pass mandatory verification
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
- **Blocking Concerns**: [Policy-designated blocking security findings]

## Architecture Review
- **Violations**: [Drift findings or Security-Architecture Conflicts]
- **Refactor Tasks**: [Suggested corrections]
- **Constitution Update Proposals**: [Proposed updates to `{adapter_path:arch-constitution}`]

## Implementation Status
- [Ready to merge / Needs security fix / Needs architecture refactor / Needs constitution update]

## Recommended Next Step
- [e.g., Merge changes]
- [e.g., Revise implementation to address Security Conflict]
- [e.g., Run `{adapter_command:architecture-apply}`]
- **Durable Memory Preservation**: (Proactively triggered) Review the proposed memory entries below.
- **Verification Gate**: [Passed / Blocked / Unavailable fallback executed]
```

## Security + Architecture Conflict Handling

If Security Review finds an issue affecting architecture, classify it as a `Security-Architecture Conflict`.
Example:
- Violation: Pricing decision in client UI.
- Security Constraint: Pricing authority must remain server-side.
- Suggested Fix: Move pricing calculation to backend service.

## Architecture Evolution Handling

If implementation repeatedly violates a standard because the standard is outdated, generate a `Constitution Update Proposal` targeting `{adapter_path:arch-constitution}`.

## Guardrails

- **Modular**: Do not mix security findings into a generic architecture list.
- **Framework-Agnostic**: Maintain boundary concepts (Entry, Domain, Data).
- **Non-Blocking**: Adhere to the non-blocking philosophy for architecture findings.
- **Memory-First**: Prefer cached synthesis and selected index entries before broad file reads.


## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `commands/governed-implement.md` for direct SpecKit use.
