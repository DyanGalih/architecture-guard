---
description: Run the governed SpecKit lifecycle from discovery or an active feature through specification, planning, tasks, implementation, verification, and optional archival.
---

# Architecture Workflow Command

## Ponytail Core Contract

Before continuing, read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Capability Composition

Read and apply `.specify/extensions/architecture-guard/templates/capability_composition.md` (or `templates/capability_composition.md` in the extension source checkout) before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name, slash-command spelling, or Markdown path as an invocation. On Spec Kit extension installs, resolve a capability `<capability>` to the registered `speckit.architecture-guard.ag-<capability>` command file in the agent's command directory, or to `.specify/extensions/architecture-guard/commands/<capability>.md`.

Use this command as the end-to-end Architecture Guard entry point for SpecKit. Delegate each phase to its registered Architecture Guard capability instead of reproducing that phase's internal prompt.

## Agent Teams Activation

Agent Teams mode is active only when all of the following are true:

1. The host is Claude Code and exposes named teammate spawning and messaging.
2. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is enabled in the active environment or `.claude/settings.json`.
3. The user explicitly selects Agent Teams for this run, or the native command arguments explicitly request it.

When the environment flag is present, explain that `.architecture-guard/agents.yml` is an Architecture Guard role profile, not a native Claude Code configuration file. Spawn each teammate from its generated Claude Code agent type (`agteam-<role>`, for example `agteam-code-reviewer`) when `.claude/agents/agteam-<role>.md` exists, so the role's tool limits apply; otherwise use the profile to shape named teammate prompts. Give every teammate the skill, artifact paths, change identifier, and constitutions in its spawn prompt, because teammates do not inherit the lead's conversation. If any activation condition is absent, run in single-agent mode without simulating teammates or claiming parallel execution.

## Lifecycle

### Step 1 - Resolve the Starting Point

1. Read Flash-Mem context when its tools are available; otherwise Read the selected adapter's project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for SpecKit, check `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md`, and any adapter-defined layout constitution. Never silently omit an existing file.
2. Resolve any user-supplied change name and artifact paths before filesystem discovery.
3. If the request is still exploratory or materially ambiguous, run `/speckit.architecture-guard.ag-governed-discover` and use its Discovery Summary Draft as the specification seed.
4. If no active specification exists, run `/speckit.architecture-guard.ag-governed-spec`. Do not enter planning until specification creation and clarification succeed.
5. If an active specification already exists, confirm the intended active change when more than one candidate is plausible.

### Human Gate 0 - Approve Specification

After discovery and specification (Step 1) succeed, present the specification and any clarification outcomes. Obtain explicit user approval before delivery starts. Skip this gate only when the user supplied an already-approved active specification and asked to resume from it.

### Step 2 - Governed Planning, Tasks, and Artifact Review Loop

- In single-agent mode, run `/speckit.architecture-guard.ag-governed-delivery`.
- In Agent Teams mode, run `/speckit.architecture-guard.ag-governed-delivery-team` when stakeholder User Story approval is required; otherwise run `/speckit.architecture-guard.ag-governed-delivery` with the active team profile.
- Let the delegated delivery prompt perform its own plan, task, security, architecture, analysis, and write-approval gates. It also owns the Artifact Review Convergence Loop (`ag-review-artifacts` plus Security Review on the plan and tasks, repaired through `ag-apply`, until a pass is clean). Do not restate or rerun that loop here; report its status and pass count.

### Human Gate 1 - Approve Plan and Tasks

Present the resolved plan and task artifacts, the **Artifact Review** status (Clean, Not converged, Blocked, or Unavailable, with qualifiers), and any blocking or open findings. Obtain explicit user approval before starting implementation. Approval of artifacts does not approve unrelated writes or Git operations.

### Step 3 - Governed Implementation and Implementation Review Loop

Run `/speckit.architecture-guard.ag-governed-implement`. It owns the Implementation Review Convergence Loop (architecture review plus Security Review on the code, fixed and rerun until a pass is clean). Do not restate or rerun that loop here; report its status and pass count. In Agent Teams mode, the lead assigns non-overlapping task and file ownership before spawning implementors. If an overlap is discovered, pause one owner and coordinate a handoff; do not rely on an invented Git locking mechanism or allow concurrent edits to the same file.

### Human Gate 2 - Review Implementation

Present modified files, completed tasks, the **Implementation Review** status, test results, and the verification result. Obtain explicit user approval before the final review.

### Step 4 - Final Review

`/speckit.architecture-guard.ag-governed-implement` owns verification: its Mandatory Verification Gate already runs `/speckit.architecture-guard.ag-verify`. Use that result; do not run verification a second time.

In this SpecKit extension channel, `/speckit.architecture-guard.ag-verify` verifies the active feature's artifacts and implementation and dispatches the registered Security Review branch command. It takes no `base=<ref>` argument and does not apply the pull-request change checks (governance, intent, story scope, tests, secrets, security-sensitive files) to the whole branch diff. Do not report this final review as whole-branch or pull-request-equivalent coverage.

1. Run `/speckit.architecture-guard.ag-verify` directly only when the result is missing or stale (code changed after it ran). When the host can run a fresh subagent, run it in a fresh context so it does not grade work it produced.
2. A pass requires task and requirement evidence, architecture and security-policy compliance, repository hygiene results, and no unresolved blocking findings. Do not equate unavailable optional integrations with a pass.
3. Report **Change Checks** as `Unavailable: not provided by the SpecKit extension channel`, and tell the user that the standalone Architecture Guard skills (`ag-verify base=<destination branch>` or `ag-review-pr`) run them on the whole branch.
4. If the result reports findings that need code changes, return to Step 3 with those findings as input, then repeat this step. At most 2 such returns per run. If findings remain after the second, stop, report what each return changed, and ask the user how to proceed. A finding that needs a product or architecture decision goes to the user instead of back into the loop.

### Human Gate 3 - Approve Final Review

Present the final review result, the Change Checks status, and any accepted or advisory findings. Obtain explicit user approval before the archival handoff.

### Step 5 - Optional Archival Handoff

Only after Gate 3 passes, present the final governance summary and suggest running `/speckit.architecture-guard.ag-governed-archive`. Archival, changelog, memory, Git, and cleanup actions retain the separate approvals required by that capability. If the user declines, leave the active work intact.

## Execution Mode

This workflow is host-neutral. Lifecycle steps depend on each other and on human gates, so run them in order in the current session by default.

- **Sequential (default, any host)**: run each delegated command in the current session.
- **Subagents (only when the host exposes real dispatch of a fresh context)**: use them only for read-only work that does not depend on another running task: the review passes in the convergence loops and the Step 4 final review, and the architecture and Security Review halves of a single pass. Give each subagent the explicit artifact paths, change identifier, and constitutions; subagents do not inherit this conversation. Repairs, artifact writes, implementation, commits, and archival stay with one owner at a time. Merge subagent findings into the parent's single findings list before evaluating a pass.
- **Agent Teams**: remains the Claude Code experimental mode described above.
- Never claim parallel or subagent execution the host did not perform, never run two writers on the same file, and never let a subagent satisfy a human gate. When the host has no dispatch, run sequentially and report the mode.

## Output

Return a concise lifecycle summary containing:

- selected mode and active feature/artifact paths;
- completed, skipped, blocked, and degraded phases;
- approvals obtained and approvals still required (Gates 0-3);
- Artifact Review, Implementation Review, and final review status with pass counts;
- Change Checks status and unresolved findings;
- execution mode used (sequential, subagents, or Agent Teams);
- the next safe action.

## Guardrails

- Preserve the delegated phase prompts as the source of truth for phase behavior.
- Never skip discovery/specification merely because no active artifact exists.
- Never cross a human gate based on an earlier phase's approval.
- Do not duplicate the delegated convergence loops; they keep their own pass limits and stop conditions.
- Never suggest archival before the final review is clean and Gate 3 is approved.
- Never claim Agent Teams behavior when the host capability is unavailable.
- Preserve unrelated and uncommitted work throughout the lifecycle.

## Backward Compatibility

The SpecKit extension version of this workflow is under `commands/workflow.md`.
