---
description: Run the governed SDD lifecycle from discovery or an active change through specification, planning, tasks, implementation, verification, and optional archival.
---

# Architecture Workflow Command

## SDD Adapter Resolution

Before executing this command, read `.architecture-guard/adapters/resolve.md` and resolve the adapter with its chain (explicit `--adapter` override, `.architecture-guard/selected-adapter`, `.architecture-guard/config.yml`, then filesystem markers), then load `.architecture-guard/adapters/{tool}.md` for path maps, command maps, and gap fills. Stop with `Unavailable` and the exact path if the adapter file is missing. Do not use the Architecture Guard resource resolver for adapter selection: adapter files are not a `resolve` resource category. Resolve every adapter path and command token before continuing; all paths and commands below use the loaded adapter.

## Standalone Resource Resolution

Architecture Guard engine resources are standalone package resources. Never search an SDD-tool directory, an extension directory, or a source checkout for them. An adapter path under `.architecture-guard` is an editable local override location, not proof that the resource was copied.

- Directly inspect the matching `.architecture-guard/<category>/` directory first for workspace overrides.
- If the named local resource exists, read it. Otherwise run `architecture-guard resolve <category> <name>` and use the returned content.
- For a resource collection, run `architecture-guard resolve <category> --list`, then resolve every returned name individually in deterministic order so local overrides replace bundled files without hiding bundled defaults.
- If the CLI is unavailable and a mandatory resource is not vendored locally, stop and report the missing runtime dependency. For optional resources, report `Unavailable` and continue only when this command explicitly permits degradation.

## Ponytail Core Contract

Before continuing, resolve and apply the `ponytail_core` template with `architecture-guard resolve template ponytail_core` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Run Context Reuse

Resolve and apply `budgeted_context_sdd` with `architecture-guard resolve template budgeted_context_sdd`. Its run-local reuse and invalidation rules apply to all context loading below.

## Host Agent Execution

Resolve and apply `agent_execution` with `architecture-guard resolve template agent_execution`. It owns mode activation, delegation decisions, complete handoffs, role restrictions, and ownership. Preserve phase-specific gates below. All retrieval instructions below accept current sufficient run-local context under `budgeted_context_sdd`: reuse it instead of repeating calls. An exposed memory tool is not usable when this run has recorded an absent store; reuse that unavailable outcome until tools or environment change.

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

Use this command as the end-to-end Architecture Guard entry point. Delegate each phase to its registered Architecture Guard capability instead of reproducing that phase's internal prompt.

## Repository Context

Resolve and apply the `repository_context` template with `architecture-guard resolve template repository_context`. When `.architecture-guard/config.yml` lists `repositories`, every git, branch, test, hygiene, commit, push, and code-host step in this skill runs in the repository that owns the files it concerns, as that template defines, and paths are workspace-relative; rules, constitutions, and configuration still come from the workspace. Without `repositories`, the workspace is the only repository and nothing changes.

## Execution Activation

Use the shared `agent_execution` contract for sequential, read-only subagents, and coordinated implementation. The profile does not activate a mode. Claude Code Agent Teams keeps its native flag prerequisite; Codex does not require Claude configuration. Pass the full handoff and verify native role restrictions before spawning.

## Lifecycle

### Step 1 - Resolve the Starting Point

1. Read Flash-Mem context when its tools are available; otherwise resolve the selected adapter's project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.
2. Resolve any user-supplied change name and artifact paths before filesystem discovery.
3. If the request is still exploratory or materially ambiguous, run the registered `ag-governed-discover` capability and use its Discovery Summary Draft as the specification seed.
4. If no active specification exists, run the registered `ag-governed-spec` capability. Do not enter planning until specification creation and clarification succeed.
5. If an active specification already exists, confirm the intended active change when more than one candidate is plausible.

### Human Gate 0 - Approve Specification

After discovery and specification (Step 1) succeed, present the specification and any clarification outcomes. Obtain explicit user approval before delivery starts. Skip this gate only when the user supplied an already-approved active specification and asked to resume from it.

### Step 2 - Governed Planning, Tasks, and Artifact Review Loop

- When stakeholder User Story approval is required, run the registered `ag-governed-delivery-team` capability, in the selected sequential or coordinated host mode.
- Otherwise run the registered `ag-governed-delivery` capability (with the active team profile in coordinated implementation mode).
- Let the delegated delivery prompt perform its own plan, task, security, architecture, analysis, and write-approval gates. It also owns the Artifact Review Convergence Loop (`ag-review-artifacts` plus Security Review on the plan and tasks, repaired through `ag-apply`, until a pass is clean). When the user has stated the destination branch, pass it to the delivery prompt as the **Base ref** for that loop. Do not restate or rerun that loop here; report its status and pass count.

### Human Gate 1 - Approve Plan and Tasks

Present the resolved plan and task artifacts, the **Artifact Review** status (Clean, Not converged, Blocked, or Unavailable, with qualifiers), and any blocking or open findings. Obtain explicit user approval before starting implementation. Approval of artifacts does not approve unrelated writes or Git operations.

### Step 3 - Governed Implementation and Implementation Review Loop

Run the registered `ag-governed-implement` capability. It owns the Implementation Review Convergence Loop (architecture review plus Security Review on the code, fixed and rerun until a pass is clean). Do not restate or rerun that loop here; report its status and pass count. In coordinated implementation mode, the lead assigns non-overlapping task and file ownership before spawning implementors. If an overlap is discovered, pause one owner and coordinate a handoff; do not rely on an invented Git locking mechanism or allow concurrent edits to the same file.

### Human Gate 2 - Review Implementation

Present modified files, completed tasks, the **Implementation Review** status, test results, and the verification result. Obtain explicit user approval before the final review.

### Step 4 - Final Review Against the Destination Branch

`ag-governed-implement` owns verification: its Mandatory Verification Gate already runs `ag-verify`, which applies the pull-request change checks and Security Review's branch operation over the whole branch diff against the target branch. Use that result; do not run verification a second time.

1. Confirm the destination branch that result used: the user's stated branch, the pull-request base, or the repository's default branch. If it cannot be determined, ask. Never accept `HEAD` as the base. With `repositories` configured, confirm it per owning repository.
2. Run `ag-verify` directly with `base=<destination branch>` only when the result is missing, stale (code changed after it ran), or used a different base. When the host can run a fresh subagent, run it in a fresh context so it does not grade work it produced. Rules come from the user's checkout, not from the branch under review.
3. A pass requires task and requirement evidence, architecture and security-policy compliance, repository hygiene results, and no unresolved blocking findings. Do not equate unavailable optional integrations with a pass.
4. If the result reports findings that need code changes, return to Step 3 with those findings as input, then repeat this step. At most 2 such returns per run. If findings remain after the second, stop, report what each return changed, and ask the user how to proceed. A finding that needs a product or architecture decision goes to the user instead of back into the loop.

### Human Gate 3 - Approve Final Review

Present the final review result, the destination branch, and any accepted or advisory findings. Obtain explicit user approval before the archival handoff.

### Step 5 - Optional Archival Handoff

Only after Gate 3 passes, present the final governance summary and suggest running `ag-governed-archive`. Archival, changelog, memory, Git, and cleanup actions retain the separate approvals required by that capability. If the user declines, leave the active work intact.

## Execution Mode

Report the actual sequential, read-only subagent, or coordinated implementation mode selected under `agent_execution`. Lifecycle steps and human gates remain ordered. Keep repairs with one owner per file; use independent fresh reviewers where authorized. Never claim parallel or subagent execution the host did not perform.

## Output

Return a concise lifecycle summary containing:

- selected adapter, mode, and active change/artifact paths;
- completed, skipped, blocked, and degraded phases;
- approvals obtained and approvals still required (Gates 0-3);
- Artifact Review, Implementation Review, and final review status with pass counts;
- destination branch and unresolved findings;
- execution mode used (sequential, read-only subagents, or coordinated implementation);
- the next safe action.

## Guardrails

- Preserve the delegated phase prompts as the source of truth for phase behavior.
- Never skip discovery/specification merely because no active artifact exists.
- Never cross a human gate based on an earlier phase's approval.
- Do not duplicate the delegated convergence loops; they keep their own pass limits and stop conditions.
- Never suggest archival before the final review is clean and Gate 3 is approved.
- Never claim Agent Teams behavior when the host capability is unavailable.
- Preserve unrelated and uncommitted work throughout the lifecycle.
