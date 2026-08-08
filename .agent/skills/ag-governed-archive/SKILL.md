---
name: ag-governed-archive
description: Verify, then archive a completed feature with explicit approval for changelog, memory, Git, and cleanup actions.
metadata:
  author: architecture-guard
  source: https://github.com/DyanGalih/architecture-guard
---

# Governed Archive Command

## SDD Tool Detection

Before executing command, read `adapters/detect.md` to determine the active SDD tool. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Purpose

Verifies, then finalizes a completed feature. Changelog, memory, Git, and workspace cleanup actions require explicit user approval.

## Orchestration Flow

### Step 1 — Verification and SDD Framework Archival Execution
- Determine the active framework via `adapters/detect.md`.
- **All frameworks**: Trigger `{adapter_command:verify}` first and stop if verification fails or has unresolved blocking findings.
- **If OpenSpec**: After verification and explicit approval, trigger `{adapter_command:archive}`; ask for the change name and archive destination if either is ambiguous.
- **If SpecKit**: After verification and explicit approval, ask for the archive destination and move the active feature artifacts there, then trigger `{adapter_command:consolidate-specs}`.

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
If Git operations were successful, offer workspace cleanup as a separate confirmation. Never check out another branch or delete a feature branch without explicit approval.

## Output Structure

The command MUST return:

```markdown
# Governed Archive Summary

## Archival Status
- **Framework**: [OpenSpec / SpecKit / etc.]
- **Status**: [Success / Failed]
- **Synced/Consolidated**: [Yes / No]

## Changelog
- **Status**: [Appended / Skipped]

## Memory Context
- **Status**: [Extracted / Skipped / Unavailable]

## Git Operations
- **Action Taken**: [Commit / Push / PR / None]

## Workspace
- **Status**: [Cleaned / Retained]
```