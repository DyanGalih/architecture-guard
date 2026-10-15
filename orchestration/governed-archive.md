---
description: Verify, then archive a completed feature with explicit approval for changelog, memory, Git, and cleanup actions.
---

# Governed Archive Command

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

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

## Repository Context

Resolve and apply the `repository_context` template with `architecture-guard resolve template repository_context`. When `.architecture-guard/config.yml` lists `repositories`, every git, branch, test, hygiene, commit, push, and code-host step in this skill runs in the repository that owns the files it concerns, as that template defines, and paths are workspace-relative; rules, constitutions, and configuration still come from the workspace. Without `repositories`, the workspace is the only repository and nothing changes.

## Input & Context Loading

Before making decisions or delegating work, read these inputs explicitly with file-reading tools:

1. **Manifest & Configuration**: Read the selected adapter's project configuration (`{adapter_path:project-config}`) first, then inspect it for references to further governance and constitution Markdown files (for example a `context` block). Never rely on a hardcoded partial list.
2. **Authoritative Constitutions (read all that exist)**: Read every declared or present governance, constitution, architecture, security, and layout Markdown file. Explicitly check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.
3. **Active Artifacts**: Read the feature, review, plan, task, or current-state artifacts required by this skill.

## Purpose

Verifies, then finalizes a completed feature. Changelog, memory, Git, and workspace cleanup actions require explicit user approval.

## Orchestration Flow

### Step 1 — Verification and SDD Framework Archival Execution
- Determine the active framework via `.architecture-guard/adapters/resolve.md`.
- **All frameworks**: Trigger {adapter_command:verify} first and stop if verification fails or has unresolved blocking findings.
- After verification and explicit approval, execute {adapter_command:archive} exactly as the adapter defines it (a native archive command, a retain-in-place index update, or a manual-archive report). Ask for the change name and archive destination if either is ambiguous. Do not move artifacts unless the adapter's archive behavior says to.
- **If Generic**: Explain that native archival is unsupported. Ask for and preview an archive destination; move only the explicitly selected artifacts after approval, and never overwrite an existing destination.
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

**Protected-branch guard** (applies to every option):
- Run `git branch --show-current` first, in each repository that has files to commit (Repository Context), and commit each repository separately. Refuse to commit or push on `main`, `master`, `dev`, `develop`, `development`, `staging`, or another protected branch, in any of those repositories; report the branch and stop the Git step (offer "Do nothing" or ask the user to switch to a feature branch).
- Commit only the files listed in the confirmed preview; never stage unrelated changes.
- Push only after a separate explicit approval that names the repository, remote, and branch, even when "Commit & Push" was selected. Never force-push (`--force`, `--force-with-lease`, or a `+` refspec).
- Create a PR only after its own approval of the title, description, and base branch.

### Step 5 — Workspace Cleanup
If Git operations were successful, offer workspace cleanup as a separate confirmation. Show exactly what will be removed, refuse cleanup while affected files have uncommitted changes, and verify archive/index results before deletion. Never check out another branch or delete a feature branch without explicit approval.

## Output Structure

The command MUST return:

```markdown
# Governed Archive Summary

## Archival Status
- **Adapter**: [selected adapter name]
- **Status**: [Success / Partial / Blocked / Failed / Retained In Place]
- **Synced/Consolidated**: [Success / Partial / Skipped / Failed]
- **Destination**: [Retained in place / archive path / None]
- **Collision/Overwrite**: [None / Approval Required / Approved strategy]
- **Partial Failure Recovery**: [Not needed / completed operations, failed operations, and safe resume steps]

## Changelog
- **Status**: [Appended / Skipped / Failed]

## Memory Context
- **Status**: [Extracted / Skipped / Unavailable / Failed]

## Git Operations
- **Action Taken**: [Commit / Push / PR / None / Failed]

## Workspace
- **Status**: [Cleaned / Retained / Blocked by uncommitted changes / Failed]
```
