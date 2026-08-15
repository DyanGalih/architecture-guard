---
description: Verify, then archive a completed feature with explicit approval for changelog, memory, Git, and cleanup actions.
---

# Governed Archive Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md`. Resolve the active adapter in this order: explicit `--adapter` override, `.architecture-guard/selected-adapter` as the authoritative persisted selection, then filesystem markers only when no persisted selection exists. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. Resolve every adapter token before continuing.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.architecture-guard/templates/ponytail_core.md` (or `.specify/extensions/architecture-guard/templates/ponytail_core.md` in an extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Purpose

Verifies, then finalizes a completed feature. Changelog, memory, Git, and workspace cleanup actions require explicit user approval.

## Orchestration Flow

### Step 1 — Verification and SDD Framework Archival Execution
- Determine the active framework via `adapters/resolve.md`.
- Inspect `git status --short`, including uncommitted and untracked files, before any archive or consolidation action. Report which files belong to the feature and stop for explicit direction if their ownership or safety is ambiguous; never discard them.
- **All frameworks**: Use the loaded adapter's `verify` mapping first and stop if verification fails or has unresolved blocking findings.
- **If OpenSpec**: After verification and explicit approval, use the adapter's `archive` mapping; ask for the change name if it is ambiguous. Resolve and preview the destination first, fail on any destination collision, and never overwrite an existing archive.
- **If SpecKit**: After verification and explicit approval, retain the active feature artifacts in their native `specs/<feature>/` directory and incrementally update `specs/system_context.md`. Report index update failures as non-blocking warnings; do not move the feature artifacts.
- **If Generic**: Use the adapter's inline verification fallback. Explain that there is no native archive command, ask for an archive destination, preview it, and move artifacts only after explicit approval. Fail on destination collision and never overwrite existing content.
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
- **Framework**: [OpenSpec / SpecKit / etc.]
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
