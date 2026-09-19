---
description: Run the governed SDD lifecycle from discovery or an active change through specification, planning, tasks, implementation, verification, and optional archival.
---

# Architecture Workflow Command

## SDD Adapter Resolution

Before executing this command, read `adapters/resolve.md`, load the selected `adapters/{tool}.md`, and resolve all adapter path and command tokens used by each delegated phase.

## Standalone Resource Resolution

Architecture Guard engine resources are standalone package resources. Never search an SDD-tool directory, an extension directory, or a source checkout for them. An adapter path under `.architecture-guard` is an editable local override location, not proof that the resource was copied.

- Directly inspect the matching `.architecture-guard/<category>/` directory first for workspace overrides.
- If the named local resource exists, read it. Otherwise run `architecture-guard resolve <category> <name>` and use the returned content.
- For a resource collection, run `architecture-guard resolve <category> --list`, then resolve every returned name individually in deterministic order so local overrides replace bundled files without hiding bundled defaults.
- If the CLI is unavailable and a mandatory resource is not vendored locally, stop and report the missing runtime dependency. For optional resources, report `Unavailable` and continue only when this command explicitly permits degradation.

## Ponytail Core Contract

Before continuing, resolve and apply the `ponytail_core` template with `architecture-guard resolve template ponytail_core` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

Use this command as the end-to-end Architecture Guard entry point. Delegate each phase to its registered Architecture Guard capability instead of reproducing that phase's internal prompt.

## Agent Teams Activation

Agent Teams mode is active only when all of the following are true:

1. The host is Claude Code and exposes named teammate spawning and messaging.
2. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is enabled in the active environment or `.claude/settings.json`.
3. The user explicitly selects Agent Teams for this run, or the native command arguments explicitly request it.

When the environment flag is present, explain that `.architecture-guard/agents.yml` is an Architecture Guard role profile, not a native Claude Code configuration file. Use it to shape named teammate prompts when present. If any activation condition is absent, run in single-agent mode without simulating teammates or claiming parallel execution.

## Lifecycle

### Step 1 - Resolve the Starting Point

1. Read Flash-Mem context when its tools are available; otherwise Resolve the selected adapter's project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for other adapters, read every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.
2. Resolve any user-supplied change name and artifact paths before filesystem discovery.
3. If the request is still exploratory or materially ambiguous, run the registered `ag-governed-discover` capability and use its Discovery Summary Draft as the specification seed.
4. If no active specification exists, run the registered `ag-governed-spec` capability. Do not enter planning until specification creation and clarification succeed.
5. If an active specification already exists, confirm the intended active change when more than one candidate is plausible.

### Step 2 - Governed Planning and Tasks

- In single-agent mode, run the registered `ag-governed-delivery` capability.
- In Agent Teams mode, run `ag-governed-delivery-team` when stakeholder User Story approval is required; otherwise run `ag-governed-delivery` with the active team profile.
- Let the delegated delivery prompt perform its own plan, task, security, architecture, analysis, and write-approval gates.

### Human Gate 1 - Approve Plan and Tasks

Present the resolved plan and task artifacts plus any blocking findings. Obtain explicit user approval before starting implementation. Approval of artifacts does not approve unrelated writes or Git operations.

### Step 3 - Governed Implementation

Run the registered `ag-governed-implement` capability. In Agent Teams mode, the lead assigns non-overlapping task and file ownership before spawning implementors. If an overlap is discovered, pause one owner and coordinate a handoff; do not rely on an invented Git locking mechanism or allow concurrent edits to the same file.

### Human Gate 2 - Review Implementation

Present modified files, completed tasks, review findings, and test results. Obtain explicit user approval before final verification.

### Step 4 - Verification

Run the registered `ag-verify` capability. A pass requires task and requirement evidence, architecture and security-policy compliance, repository hygiene results, and no unresolved blocking findings. Do not equate unavailable optional integrations with a pass.

### Step 5 - Optional Archival Handoff

After verification passes, present the final governance summary and offer to run `ag-governed-archive`. Archival, changelog, memory, Git, and cleanup actions retain the separate approvals required by that capability. If the user declines, leave the active work intact.

## Output

Return a concise lifecycle summary containing:

- selected adapter, mode, and active change/artifact paths;
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
