---
description: Execute implementation tasks, then review the result against available security and architecture constraints.
---

# Governed Implement Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md`. Resolve the active adapter in this order: explicit `--adapter` override, `.architecture-guard/selected-adapter` as the authoritative persisted selection, then filesystem markers only when no persisted selection exists. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. Resolve every adapter token before continuing.

## OpenSpec Change Scope

When the selected adapter is `openspec`, establish one `CHANGE_ID` before any OpenSpec artifact lookup or command. Resolve it from an explicit user-provided change, one unambiguous result from `openspec list --specs --json`, or a new kebab-case name approved for creation; create or reuse that change before continuing. Pass `--change "$CHANGE_ID"` to every `openspec instructions` and `openspec status` command, validate with `openspec validate "$CHANGE_ID" --strict`, and reuse the same id for every artifact and archive step. A capability name is not a change id. If no unambiguous change can be resolved, stop and ask the user rather than invoking an action with an empty `CHANGE_ID`.

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

## Budgeted Context Contract

Resolve and apply the `budgeted_context_sdd` template with `architecture-guard resolve template budgeted_context_sdd`. `{adapter_path:tasks}` is authoritative; load `{adapter_path:plan}`, `{adapter_path:spec}`, and security constraints when a task lacks context. Memory and supported fallbacks may supplement but never replace active artifacts.

You are orchestrating the `ag-governed-implement` workflow for `architecture-guard`.

This command coordinates implementation and post-implementation review to ensure the output respects architectural, historical, and security constraints.

## Goal

Provide a single command that ensures:
1. Implementation is historical-context aware when Flash-Mem is available.
2. Implementation is performed ({adapter_command:implement}).
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
1. Detect `flash-mem` as an MCP-backed memory service in the current environment. Do not treat it as an SDD extension or inspect an SDD extension manifest for it.
2. Detect Security Review as an independent host capability. Never inspect an SDD extension manifest or directory for it.
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, execute both `get_project_summary` and `search_memory` scoped to the active feature, affected files, architecture boundaries, security-sensitive areas, prior decisions, and approved exceptions before implementation. Prefer summary-first context and load full entries only when those results are insufficient.

If Flash-Mem is unavailable or the context is insufficient, resolve the selected adapter project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file before continuing with repository artifacts. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for other adapters, read every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.

**[OPTIONAL SUB-AGENT DELEGATION]**
* **Capability Gate:** Determine whether the host exposes a registered synthesis/delegation capability. If unavailable, execute inline regardless of size and report the degraded path.
* **Trigger Condition:** When the capability is available, you **MUST** delegate memory retrieval and synthesis if:
  - The Flash-Mem index contains $\ge 20$ memory documents.
  - OR the project repository contains $\ge 15$ active ADRs/docs.
  - Otherwise, you **MUST** execute inline.
* **Execution Instruction:** When the capability is available, apply {adapter_command:subagent-synthesize} with implementation context. Do not append flags to descriptive adapter behavior.
* **Strict Handoff Template:** Format the sub-agent prompt exactly like this:
  ```yaml
  Task: Retrieve and synthesize relevant architecture constraints and ADRs.
  Focus: Rules and conventions affecting codebase implementation.
  Expected Output: Synthesized markdown summary of constraints to guide coding and refactoring.
  ```


---

### Step 3 — Orchestrate SDD Tool Implementation

You must orchestrate {adapter_command:implement} (core implementation) workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must perform the implementation by following the `tasks.md` breakdown:
1. **Apply Ponytail Core**: Trace the affected execution flow and apply the shared decision ladder in order. A one-line solution is preferred only when it is correct, readable, and reached after checking YAGNI, existing code, the standard library, native platform features, and installed dependencies.
   - For fixes or shared behavior, search every caller and sibling path, then correct the owning implementation once when that is the true root cause.
   - Preserve the contract safety floor and leave at least one runnable check for non-trivial logic.
2. **Execute Tasks**: Run {adapter_command:implement}. If {adapter_command:implement} is not available as a registered command, fall back to inline implementation:
   - Read `{adapter_path:tasks}` and execute each unchecked task sequentially.
   - Resolve the selected adapter's project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for other adapters, read every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file. Use any available Flash-Mem context before coding.
   - Perform the actual coding work (writing files, running tests) for each task, enforcing Ponytail minimalism.
   - Note in the Governance Summary that {adapter_command:implement} was unavailable and implementation was performed inline.

#### Claude Code Agent Teams Coordination (When Active)

Activate this protocol only when the Claude Code host exposes named teammate spawning and messaging, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is enabled, and the user opted into Agent Teams for the current run. Otherwise execute the same work in single-agent mode:
- **Implementors (BE, FE, TEST)**:
  - Map role-tagged tasks to the matching named implementor; keep `[ORCHESTRATION]` work in the lead session.
  - Before spawning, the lead assigns non-overlapping tasks and explicit file ownership. If overlap is discovered, pause one owner and coordinate a handoff; never edit the same file concurrently.
- **Code Reviewer** audits code changes across boundaries, reviews security constraints, and verifies tests before handoff.
- **Human-in-the-Loop Gate**:
  - Lead session collects implementation evidence, presents the completed task checklist, and requires explicit user confirmation before concluding or advancing to the registered `ag-verify` capability.

3. **Write Code**: Perform the actual coding work (writing files, running tests) required by the tasks.
4. **Inline Pre-Completion Self-Verification Gate**: Before marking any task complete:
   - **Deprecated & Dangerous Code Check**: Resolve `deprecated-and-dangerous-code` with `architecture-guard resolve hygiene-rule deprecated-and-dangerous-code`, then check changed and target files against it.
   - **Repository Hygiene Check**: Run `architecture-guard resolve hygiene-rules --list`, resolve every returned rule, and inspect changed files against the complete effective rule set (no `.tmp`, `.new`, or scratch files left behind; no commented-out code; no dead imports).
   - **Heuristic SonarLint Scan**: Resolve the bundle with `architecture-guard resolve sonar-rules`, then check changed files against it (ensure no cognitive overload, tight coupling, loose `any`/`unknown` casts, or missing parameter validation).
   - **Immediate Remediation**: Correct any detected quality or hygiene violations immediately at the current task boundary.
5. **Sync the tasks**: You MUST update `{adapter_path:tasks}` to mark completed tasks with `[x]`, check them off, and add any new subtasks discovered during implementation.
   - If implementation would expand beyond accepted spec/plan/task scope, stop and obtain explicit user approval before adding or executing that work. Record the approved expansion in the authoritative artifacts first.
6. The implementation MUST follow current tasks and context. Use Flash-Mem first when available. If retrieval is unavailable or insufficient, resolve the selected adapter project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file alongside the active artifacts with file-reading tools. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for other adapters, read every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file. Do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`.

The SDD-tool-native implementation behavior is defined by the selected adapter and any registered host capability; do not infer a package-specific command.

### Step 4 — Security Review on Implementation

IF `security-review` is available as a host capability:
1. **Execute Review**: Dispatch the detected host Security Review capability's branch/implementation operation directly. Do not execute adapter fallback prose as a command.
2. Check for: authorization bypass, missing validation, secret leakage, injection risk, and insecure data exposure.
3. If security findings are architecture-relevant, classify them as `Security-Architecture Conflict` for the architecture review.
4. Independently derive each finding's effective severity and blocking status from `{adapter_path:security-constitution}` or the applicable security policy in `{adapter_path:constitution}`. Stop for policy-designated blocking findings; advisory findings do not become blocking merely because they are security findings.

### Step 5 — Architecture Review on Implementation

Resolve {adapter_command:architecture-review}. If it identifies a registered capability, invoke it; otherwise perform the adapter's documented inline review. Never execute descriptive fallback prose as a shell or slash command.

Review implementation against:
- Every declared or present governance, architecture, security, and layout Markdown file resolved from the selected configuration.
- Plan, tasks, and `{adapter_path:security-constraints}`.
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
1. Run {adapter_command:refactor-generator}.
2. Generate blocking remediation tasks for unresolved P0 or policy-designated blocking findings; generate advisory refactor, migration, or correction tasks for all other findings.
3. Skip performance refactors unless explicitly requested.

### Step 7 — Mandatory Verification Gate

Run {adapter_command:verify} after implementation and reviews. Do not mark the workflow complete or ready to merge until verification passes with no unresolved blocking findings; if unavailable as a registered capability, execute the Architecture Guard verification workflow inline.

### Step 8 — Proactive Durable Memory Preservation

If the implementation review or security audit identified new architectural patterns, critical decisions, or repeatable lessons:
1. **Approval Required**: Propose validated durable-memory entries and execute the capture flow only after explicit user approval.
2. **Standard**: Do not silently write memory outside the approved capture flow.

### Step 9 — Implementation Governance Summary

Produce a final `Governed Implementation Summary`.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Skip Step 2 (Flash-Mem MCP Context Retrieval)
- Continue to {adapter_command:implement} directly
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
- Execute implementation through {adapter_command:implement} or its inline fallback
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
- [e.g., Run {adapter_command:architecture-apply}]
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
