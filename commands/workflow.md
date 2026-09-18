---
description: Run the governed SpecKit lifecycle from discovery or an active feature through specification, planning, tasks, implementation, verification, and optional archival.
---

# Architecture Workflow Command

## Ponytail Core Contract

Before continuing, read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

Use this command as the end-to-end Architecture Guard entry point for SpecKit. Delegate each phase to its registered Architecture Guard capability instead of reproducing that phase's internal prompt.

## Agent Teams Activation

Agent Teams mode is active only when all of the following are true:

1. The host is Claude Code and exposes named teammate spawning and messaging.
2. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is enabled in the active environment or `.claude/settings.json`.
3. The user explicitly selects Agent Teams for this run, or the native command arguments explicitly request it.

When the environment flag is present, explain that `.architecture-guard/agents.yml` is an Architecture Guard role profile, not a native Claude Code configuration file. Use it to shape named teammate prompts when present. If any activation condition is absent, run in single-agent mode without simulating teammates or claiming parallel execution.

## Lifecycle

### Step 1 - Resolve the Starting Point

1. Read Flash-Mem context when its tools are available; otherwise use `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, and `.specify/memory/security_constitution.md`.
2. Resolve any user-supplied change name and artifact paths before filesystem discovery.
3. If the request is still exploratory or materially ambiguous, run `/ag-governed-discover` and use its Discovery Summary Draft as the specification seed.
4. If no active specification exists, run `/ag-governed-spec`. Do not enter planning until specification creation and clarification succeed.
5. If an active specification already exists, confirm the intended active change when more than one candidate is plausible.

### Step 2 - Governed Planning and Tasks

- In single-agent mode, run `/ag-governed-delivery`.
- In Agent Teams mode, run `/ag-governed-delivery-team` when stakeholder User Story approval is required; otherwise run `/ag-governed-delivery` with the active team profile.
- Let the delegated delivery prompt perform its own plan, task, security, architecture, analysis, and write-approval gates.

### Human Gate 1 - Approve Plan and Tasks

Present the resolved plan and task artifacts plus any blocking findings. Obtain explicit user approval before starting implementation. Approval of artifacts does not approve unrelated writes or Git operations.

### Step 3 - Governed Implementation

Run `/ag-governed-implement`. In Agent Teams mode, the lead assigns non-overlapping task and file ownership before spawning implementors. If an overlap is discovered, pause one owner and coordinate a handoff; do not rely on an invented Git locking mechanism or allow concurrent edits to the same file.

### Human Gate 2 - Review Implementation

Present modified files, completed tasks, review findings, and test results. Obtain explicit user approval before final verification.

### Step 4 - Verification

Run `/ag-verify`. A pass requires task and requirement evidence, architecture and security-policy compliance, repository hygiene results, and no unresolved blocking findings. Do not equate unavailable optional integrations with a pass.

### Step 5 - Optional Archival Handoff

After verification passes, present the final governance summary and offer to run `/ag-governed-archive`. Archival, changelog, memory, Git, and cleanup actions retain the separate approvals required by that capability. If the user declines, leave the active work intact.

## Output

Return a concise lifecycle summary containing:

- selected mode and active feature/artifact paths;
- completed, skipped, blocked, and degraded phases;
- approvals obtained and approvals still required;
- verification status and unresolved findings;
- the next safe action.

## Guardrails

- Preserve the delegated phase prompts as the source of truth for phase behavior.
- Never skip discovery/specification merely because no active artifact exists.
- Never cross a human gate based on an earlier phase's approval.
- Never claim Agent Teams behavior when the host capability is unavailable.
- Preserve unrelated and uncommitted work throughout the lifecycle.

## Backward Compatibility

The SpecKit extension version of this workflow is under `commands/workflow.md`.
