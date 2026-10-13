---
description: Verify, then archive a completed feature with explicit approval for changelog, memory, Git, and cleanup actions.
---

# Governed Archive Command

## SDD Adapter Resolution

This legacy Spec Kit extension command is self-contained: it uses Spec Kit paths directly and does not load SDD adapters or `.architecture-guard/selected-adapter`. For other SDD tools, use the standalone `architecture-guard` installer.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.architecture-guard/templates/ponytail_core.md` (or `.specify/extensions/architecture-guard/templates/ponytail_core.md` in a SpecKit extension install, or `templates/ponytail_core.md` in the source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Capability Composition

Read and apply `.architecture-guard/templates/capability_composition.md` (or `.specify/extensions/architecture-guard/templates/capability_composition.md` in a SpecKit extension install, or `templates/capability_composition.md` in the source checkout) before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name, slash-command spelling, or Markdown path as an invocation.

## Input & Context Loading

Before making decisions or delegating work, read these inputs explicitly with file-reading tools:

1. **Manifest & Configuration**: Read `openspec/config.yaml` first when the OpenSpec adapter is active (otherwise read the selected adapter project configuration), then inspect its `context` block for every referenced governance and constitution Markdown file. Never rely on a hardcoded partial list.
2. **Authoritative Constitutions (read all that exist)**: Read every declared or present governance, constitution, architecture, security, and layout Markdown file. For OpenSpec, explicitly check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`. For SpecKit, use the adapter-resolved `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md`, and any adapter-defined layout constitution. Never silently omit an existing file.
3. **Active Artifacts**: Read the feature, review, plan, task, or current-state artifacts required by this skill.

## Purpose

Verifies, then finalizes a completed feature. Changelog, memory, Git, and workspace cleanup actions require explicit user approval.

## Orchestration Flow

### Step 1 — Verification and SDD Framework Archival Execution
- Inspect `git status --short`, including uncommitted and untracked files, before any archive or consolidation action. Report which files belong to the feature and stop for explicit direction if their ownership or safety is ambiguous; never discard them.
- Run `/speckit.architecture-guard.ag-verify` (or the verification workflow inline) first and stop if verification fails or has unresolved blocking findings.
- After verification and explicit approval, retain the active feature artifacts in `specs/<feature>/` (from `.specify/feature.json`) and incrementally update `specs/system_context.md`. Report index update failures as non-blocking warnings; do not move the feature artifacts.
- Track each archival sub-operation and its result. On partial failure, stop further destructive actions, preserve source artifacts, report completed and failed operations, and provide a safe resume or rollback procedure without claiming success.

### Step 2 — Automated Changelog Update
Parse the archived feature purpose and requirements into a proposed changelog entry. Ask for explicit approval before appending it to CHANGELOG.md or RELEASE_NOTES.md; if neither file exists, report that and do not create one silently.

### Step 3 — Optional Memory Extraction
Check for the Flash-Mem MCP server. If available, propose architectural decisions and lessons learned from the feature design or implementation, and write them only after explicit user approval. Gracefully skip if unavailable.

### Step 4 — Interactive Git Orchestration
Prompt the user to execute final Git operations:
1. "Commit locally"
2. "Commit & Push"
3. "Commit, Push, and Create PR"
4. "Do nothing"

Prepare semantic commit messages and PR descriptions from the SDD artifacts, but execute Git operations only after the user selects an action and confirms the target branch and files.

### Step 5 — Workspace Cleanup
If Git operations were successful, enumerate each proposed cleanup action and affected path or branch, then require explicit approval for that exact list. Cleanup may include only the approved actions, such as removing confirmed temporary files, checking out a named branch, deleting a named local feature branch, or deleting a named remote feature branch. Never infer blanket approval, delete untracked work, check out another branch, or delete any branch without explicit approval.

## Output Structure

The command MUST return:

```markdown
# Governed Archive Summary

## Archival Status
- **Framework**: SpecKit
- **Status**: [Success / Partial / Blocked / Failed / Retained In Place]
- **Synced/Consolidated**: [Success / Partial / Skipped / Failed]
- **Destination**: [Retained in place / archive path]
- **Collision Check**: [Clear / Blocked]
- **Partial Failure Recovery**: [Not needed / completed operations, failed operations, and resume or rollback steps]

## Changelog
- **Status**: [Appended / Skipped]

## Memory Context
- **Status**: [Extracted / Skipped / Unavailable]

## Git Operations
- **Action Taken**: [Commit / Push / PR / None]

## Workspace
- **Status**: [Cleaned / Retained]
- **Pre-Archive Changes**: [Uncommitted and untracked files inspected]
- **Approved Cleanup**: [Enumerated actions / None]
```
