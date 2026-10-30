---
description: Execute implementation tasks, then review the result against available security and architecture constraints.
---

# Governed Implement Command

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

## Host Agent Execution

Resolve and apply `agent_execution` with `architecture-guard resolve template agent_execution`. It owns mode activation, delegation decisions, complete handoffs, role restrictions, and ownership. Preserve phase-specific gates below. All retrieval instructions below accept current sufficient run-local context under `budgeted_context_sdd`: reuse it instead of repeating calls. An exposed memory tool is not usable when this run has recorded an absent store; reuse that unavailable outcome until tools or environment change.

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

## Repository Context

Resolve and apply the `repository_context` template with `architecture-guard resolve template repository_context`. When `.architecture-guard/config.yml` lists `repositories`, every git, branch, test, hygiene, commit, push, and code-host step in this skill runs in the repository that owns the files it concerns, as that template defines, and paths are workspace-relative; rules, constitutions, and configuration still come from the workspace. Without `repositories`, the workspace is the only repository and nothing changes.

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
5. Security and architecture reviews repeat automatically, fixing findings until a review pass is clean, within a bounded pass limit.

## Orchestration Flow

### Write Approval Gate

**Caller approval**: Accept an existing caller approval only for the identical action, phase, exact targets, and owning repository under `capability_composition`; it covers only what that preview showed. Distinct human decisions and material scope expansions still require approval.

Before the first mutation, resolve and preview the working branch and the exact code, test, and task artifacts together with all planned implementation, test, and task-checkbox operations. Obtain explicit user approval, then allow routine writes already previewed within this implementation phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

### Constitution Inputs

Resolve the selected adapter's project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), then explicitly read every declared or present constitution, architecture, security, and layout Markdown file with file-reading tools. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file, and do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`. Read them anyway, but report any governance file that is gitignored or outside the repository as a hygiene WARNING: reviewers and teammates cannot open a rule that code or specs cite. Later steps refer to this set as the **Constitution Inputs**; load it once and reuse it.

### Step 0 — Preconditions

Check these before the Write Approval Gate preview; stop and report if any fails.

1. **Branch**: Run `git branch --show-current` in the workspace and in every repository whose files the tasks change (Repository Context). If any of them is `main`, `master`, `dev`, `develop`, `development`, `staging`, or another protected branch, include `feature/<change-name>` for that repository in the Write Approval Gate preview and create and switch to it only after explicit user approval. If the user declines or creation fails, stop; MUST NOT implement on a protected branch. Preserve existing uncommitted changes; never reset or discard them.
2. **Tasks exist**: `{adapter_path:tasks}` exists and contains unchecked tasks. Otherwise stop and recommend {adapter_command:create-tasks} or the governed tasks workflow.
3. **Not blocked**: Stop if the latest available governed plan, tasks, or delivery summary for this feature reports a `Blocked` plan, tasks, or Gate Status, or if `{adapter_path:tasks}` contains unresolved blocking (P0 or policy-designated) remediation tasks that are not part of this run. A simple proceed prompt cannot override this.
4. **Not stale**: If `{adapter_path:spec}` or `{adapter_path:plan}` changed materially after `{adapter_path:tasks}` was produced, stop and recommend rerunning the governed tasks workflow. If no governed tasks or delivery summary exists to show the tasks were analyzed, say so and ask the user whether to analyze first or proceed.

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` host capability

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment. Do not treat it as an SDD extension or inspect an SDD extension manifest for it.
2. Detect Security Review as an independent host capability. Never inspect an SDD extension manifest or directory for it.
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When no current sufficient cached synthesis exists and Flash-Mem is usable under the run-local context contract, execute both `get_project_summary` and `search_memory` scoped to the active feature, affected files, architecture boundaries, security-sensitive areas, prior decisions, and approved exceptions before implementation. Prefer summary-first context and load full entries only when those results are insufficient.

If Flash-Mem is unavailable or the context is insufficient, rely on the Constitution Inputs before continuing with repository artifacts.

**[OPTIONAL SUB-AGENT DELEGATION]**
Apply the shared `agent_execution` policy for relevant memory synthesis and invoke callable host delegation directly. Complete every applicable handoff field before dispatch; do not execute the adapter-defined "subagent-synthesize" fallback prose as a command.


---

### Step 3 — Orchestrate SDD Tool Implementation

You must orchestrate {adapter_command:implement} (core implementation) workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must perform the implementation by following the `tasks.md` breakdown:
1. **Apply Ponytail Core**: Trace the affected execution flow and apply the shared decision ladder in order. A one-line solution is preferred only when it is correct, readable, and reached after checking YAGNI, existing code, the standard library, native platform features, and installed dependencies.
   - For fixes or shared behavior, search every caller and sibling path, then correct the owning implementation once when that is the true root cause.
   - Preserve the contract safety floor and leave at least one runnable check for non-trivial logic.
2. **Execute Tasks**: Follow {adapter_command:implement}; if it names a command that is not available, use the adapter's own inline fallback. When implementing inline:
   - Read `{adapter_path:tasks}` and execute each unchecked task sequentially.
   - Use the Constitution Inputs and any available Flash-Mem context before coding.
   - Perform the actual coding work (writing files, running tests) for each task, enforcing Ponytail minimalism.
   - Note in the Governance Summary that implementation was performed inline.
3. **Write Code**: Perform the actual coding work (writing files, running tests) required by the tasks.
4. **Inline Pre-Completion Self-Verification Gate**: Before marking any task complete:
   - **Deprecated & Dangerous Code Check**: Resolve `deprecated-and-dangerous-code` with `architecture-guard resolve hygiene-rule deprecated-and-dangerous-code`, then check changed and target files against it.
   - **Repository Hygiene Check**: Run {adapter_command:hygiene} (the `architecture-guard hygiene --json` runner) and take each finding's severity and `blocking` flag exactly as the runner reports them (no `.tmp`, `.new`, or scratch files left behind; no commented-out code; no dead imports). A finding with `blocking: true` must be fixed before the task is marked complete. If the CLI is unavailable, report the hygiene check as `Unavailable`.
   - **Heuristic SonarLint Scan**: Resolve the bundle with `architecture-guard resolve sonar-rules`, then check changed files against it (ensure no cognitive overload, tight coupling, loose `any`/`unknown` casts, or missing parameter validation).
   - **Remediation**: Correct detected quality or hygiene violations at the current task boundary. Edits inside the approved Write Approval Gate scope proceed; any file deletion or any fix outside that scope needs its own preview and explicit approval.
5. **Sync the tasks**: You MUST update `{adapter_path:tasks}` to mark completed tasks with `[x]`, check them off, and add any new subtasks discovered during implementation.
   - If implementation would expand beyond accepted spec/plan/task scope, stop and obtain explicit user approval before adding or executing that work. Record the approved expansion in the authoritative artifacts first.
6. The implementation MUST follow current tasks and context. Use Flash-Mem first when available, and the Constitution Inputs alongside the active artifacts.

#### Coordinated Host Roles (When Active)

Apply this coordination in the explicitly selected coordinated implementation mode defined by `agent_execution`. Claude retains its native activation prerequisites; Codex uses callable host capabilities and its own profile:
- **Implementors (the profile's implementor roles, for example BE, FE, TEST)**:
  - Map role-tagged tasks to the matching named implementor; keep `[ORCHESTRATION]` work in the lead session.
  - Before spawning, the lead assigns non-overlapping tasks and explicit file ownership. If overlap is discovered, pause one owner and coordinate a handoff; never edit the same file concurrently.
- **Code Reviewer** audits code changes across boundaries, reviews security constraints, and verifies tests before handoff.
- **Human-in-the-Loop Gate**:
  - Lead session collects implementation evidence, presents the completed task checklist, and requires explicit user confirmation before concluding or advancing to the registered `ag-verify` capability.

The SDD-tool-native implementation behavior is defined by the selected adapter and any registered host capability; do not infer a package-specific command.

### Step 4 — Security Review on Implementation

Run `architecture-guard detect-changed-files --json --security-sensitive` from the workspace (it covers every configured repository; globs from `security_sensitive_paths` in `.architecture-guard/config.yml`). Treat any listed file, or any change to authentication, authorization, sessions, credentials, or a trust boundary when no globs are configured, as security-sensitive; re-run this step after every later fix that touches one.

IF `security-review` is available as a host capability:
1. **Execute Review**: Dispatch the detected host Security Review capability's `sr-branch` operation directly, against the base branch this work will merge into (never `HEAD`), as {adapter_command:security-review-implementation} defines. Never substitute `sr-verify` (it can execute code), `sr-staged`, or `sr-audit`; when `sr-branch` is not callable, mark Security Review `Unavailable`. Do not execute adapter fallback prose as a command. With `repositories` configured, dispatch it once per owning repository, from that repository's directory, with the explicit changed-file list (a review run from the workspace sees no change inside a nested repository); if the host review cannot be scoped to a repository and a file list, mark Security Review `Degraded` instead of reporting it as passed.
2. Check for: authorization bypass, missing validation, secret leakage, injection risk, and insecure data exposure.
3. If security findings are architecture-relevant, classify them as `Security-Architecture Conflict` for the architecture review.
4. Independently derive each finding's effective severity and blocking status from `{adapter_path:security-constitution}` or the applicable security policy in `{adapter_path:constitution}`. Surface policy-designated blocking findings immediately; Step 5.1 tries to fix them within the approved scope and Step 5.5 stops if any remain; advisory findings do not become blocking merely because they are security findings.

### Step 5 — Architecture Review on Implementation

Resolve {adapter_command:architecture-review}. If it identifies a registered capability, invoke it; otherwise perform the adapter's documented inline review. Never execute descriptive fallback prose as a shell or slash command. Pass the base branch this work will merge into as its **Base ref** and state that this skill is the Security Review owner (Step 4 dispatches it), so the review's Change Checks report that result instead of dispatching Security Review again.

Review implementation against:
- Every declared or present governance, architecture, security, and layout Markdown file resolved from the selected configuration.
- Plan, tasks, and `{adapter_path:security-constraints}`.
- Accepted deviations and any available Flash-Mem context.

### Step 5.1 — Implementation Review Convergence Loop

Steps 4 and 5 are the first review pass. Do not hand the review back to the user to rerun by hand; repeat the review-and-fix cycle here until a stop condition is met. Blocking findings (Constitution P0 or policy-designated blocking security findings) enter this loop too: surface them in the pass report immediately and fix them within the approved scope; Step 5.5 stops the run if any remain.

1. **Evaluate**: A pass is clean only when the architecture review reports no violations, every Security Review that ran reports no findings, and the hygiene runner reports no findings on changed files. An `Unavailable` hygiene runner or Security Review never makes a pass clean on its own; it only qualifies the result. Findings of every severity count, advisory ones included. Count only findings introduced or touched by this run's changes; report pre-existing findings in unchanged code without fixing them, because fixing them expands scope.
2. **Fix**: Correct each finding in the implementation at its owning boundary, applying the Ponytail Core decision ladder and the Step 3 Pre-Completion Self-Verification Gate. Edits inside the approved Write Approval Gate scope need no per-pass confirmation; a file deletion, a new target path, or work beyond the accepted spec, plan, and task scope requires renewed approval. Record each fix in `{adapter_path:tasks}`.
3. **Re-review**: Rerun Security Review through {adapter_command:security-review-implementation} and the architecture review through {adapter_command:architecture-review} (the registered `ag-review-implementation` capability when available) on the changed implementation. When the host can run a fresh subagent, run each review pass in a fresh context so a pass does not grade its own fixes.
4. **Repeat** from step 1.

Security Review is a separate tool, not part of Architecture Guard. Before every security dispatch in this loop, recheck that the selected Security Review command or host operation (its `security-review` or `sr-*` operations) is registered and callable; never invoke a Security Review command by name on assumption. When it is not callable, mark that pass's Security Review `Unavailable`, run the architecture review alone, and never report an unavailable security review as clean.

Stop conditions:

- **Converged**: a clean pass. Set **Implementation Review** to `Clean` with the pass count. Qualify `Clean` when the final pass was degraded: `architecture only` when Security Review was `Unavailable`, and `hygiene Unavailable` when the hygiene runner was `Unavailable`.
- **Decision required**: a fix needs a material product or architecture choice, a Constitution change, a spec or plan change, or conflicts with another finding. Present the options, ask the user, and resume the loop after the answer. Record each finding the user accepts or keeps, and leave it out of later clean checks. Resuming does not reset the pass count.
- **No progress**: a finding already fixed in an earlier pass reappears, or the total finding count does not decrease between two consecutive passes. Stop with `Not converged` and report the recurring findings.
- **Pass limit**: at most 5 review passes per run. If findings remain after the fifth pass, stop with `Not converged`.

Step 5.5 evaluates the findings that remain after this loop, and Step 6 generates refactor tasks only for those. Remaining non-blocking findings stay advisory and are reported with what each pass changed. Collect memory proposals from every pass for Step 8 instead of asking for approval per pass.

### Step 5.5 — Blocking Decision Tree

**Critical Decision Point**: Evaluate architecture and security findings independently for blocking issues.

```
IF the Constitution marks any architecture violation as P0 (blocking), at ANY review severity:
  STOP implementation
  Surface violations in report
  Return early with architecture remediation tasks; a simple proceed prompt cannot override P0
ELSE IF Architecture Review finds CRITICAL or HIGH violations:
  Continue with warning
  Create non-blocking refactor tasks
  Flag for post-merge remediation
ELSE:
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

Run {adapter_command:verify} after implementation and reviews. When the caller stated the change has no specification delta, pass that statement to it, so it verifies against the change's `## Stories` section. Do not mark the workflow complete or ready to merge until verification passes with no unresolved blocking findings; if unavailable as a registered capability, execute the Architecture Guard verification workflow inline.

### Step 8 — Proactive Durable Memory Preservation

If the implementation review or security audit identified new architectural patterns, critical decisions, or repeatable lessons:
1. **Approval Required**: Propose validated entries for `capture_artifact_memory` or `add_memory` and call those Flash-Mem tools only after explicit user approval.
2. **Standard**: Never write memory without that approval. If Flash-Mem is unavailable, report the proposals as `Unavailable`.

### Step 9 — Implementation Governance Summary

Produce a final `Governed Implementation Summary`.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Skip Step 2 (Flash-Mem MCP Context Retrieval)
- Continue to {adapter_command:implement} directly
- Use active spec, plan, tasks, repository evidence, and any present constitutions as current authority; report that historical memory context was unavailable rather than assuming no historical constraints exist

**Without Security Review**:
- Skip Step 4 (Security Review on Implementation) only when no change is security-sensitive
- When a change is security-sensitive, record `security re-review required` as an open blocking item in the summary instead of skipping silently
- Continue to architecture review directly
- Flag missing security implementation review in summary

**Architecture Violations Found**:
- If the Constitution marks any violation as P0 (blocking), regardless of its review severity:
  - Surface violations immediately; Step 5.1 tries to fix them within the approved scope
  - STOP implementation workflow if any remain after Step 5.1
  - Return early with remediation guidance
- If CRITICAL or HIGH but not P0:
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
- **Status**: [Reviewed / Advisory / Blocked / Unavailable] — `Unavailable` means no independent Security Review ran; never report it as a pass.
- **Findings**: [List of security vulnerabilities found]
- **Constraints**: [Trust boundaries validated]
- **Blocking Concerns**: [Policy-designated blocking security findings]

## Architecture Review
- **Violations**: [Drift findings or Security-Architecture Conflicts]
- **Refactor Tasks**: [Suggested corrections]
- **Constitution Update Proposals**: [Proposed updates to `{adapter_path:arch-constitution}`]

## Implementation Review
- **Status**: [Clean (N passes; qualifiers) / Not converged (N passes) / Blocked]
- **Remaining Findings**: [None or findings left after the loop]

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
- **Non-Blocking by Default**: Architecture findings block only when the Constitution marks them P0; security findings block only when the security policy designates them blocking. Either stops the workflow (Step 5.5); severity alone never blocks.
- **Memory-First**: Prefer cached synthesis and selected index entries before broad file reads.
