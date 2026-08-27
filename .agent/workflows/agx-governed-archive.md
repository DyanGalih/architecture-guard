---
description: Verify, then archive a completed feature with explicit approval for changelog, memory, Git, and cleanup actions.
---

# Governed Archive Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md`. Resolve the active adapter in this order: explicit `--adapter` override, `.architecture-guard/selected-adapter` as the authoritative persisted selection, then filesystem markers only when no persisted selection exists. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. Resolve every adapter token before continuing.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Purpose

Verifies, then finalizes a completed feature. Changelog, memory, Git, and workspace cleanup actions require explicit user approval.

## Orchestration Flow

### Step 1 — Verification and SDD Framework Archival Execution
- Determine the active framework via `adapters/resolve.md`.
- **All frameworks**: Trigger `{adapter_command:verify}` first and stop if verification fails or has unresolved blocking findings.
- **If OpenSpec**: After verification and explicit approval, trigger `{adapter_command:archive}`; ask for the change name and archive destination if either is ambiguous.
- **If SpecKit**: After verification and explicit approval, execute the adapter's retain-in-place archive behavior: keep the active feature artifacts in `{adapter_path:spec}`'s feature directory and incrementally update `{adapter_path:fallback-spec-index}`. Report index update failures as non-blocking warnings; do not move the feature artifacts.
- Before any write, inspect uncommitted changes and report files the archive would touch. Never discard, stage, commit, or overwrite unrelated changes.
- Preflight every destination for collisions. Do not overwrite or merge an existing archive/index entry without explicit approval and a stated overwrite strategy.
- Treat archive, index/spec sync, changelog, memory, Git, and cleanup as separate operations. Stop dependent operations after a failure, preserve completed results, and report `Partial` rather than attempting an unsafe rollback.

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
If Git operations were successful, offer workspace cleanup as a separate confirmation. Show exactly what will be removed, refuse cleanup while affected files have uncommitted changes, and verify archive/index results before deletion. Never check out another branch or delete a feature branch without explicit approval.

## Output Structure

The command MUST return:

```markdown
# Governed Archive Summary

## Archival Status
- **Framework**: [OpenSpec / SpecKit / etc.]
- **Status**: [Success / Partial / Blocked / Failed / Retained In Place]
- **Synced/Consolidated**: [Success / Partial / Skipped / Failed]
- **Collision/Overwrite**: [None / Approval Required / Approved strategy]

## Changelog
- **Status**: [Appended / Skipped / Failed]

## Memory Context
- **Status**: [Extracted / Skipped / Unavailable / Failed]

## Git Operations
- **Action Taken**: [Commit / Push / PR / None / Failed]

## Workspace
- **Status**: [Cleaned / Retained / Blocked by uncommitted changes / Failed]
```
