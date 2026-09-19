---
description: Verify implementation against specification, design, plan, tasks, architecture rules, and repository hygiene requirements.
---

# Architecture Verification

## SDD Adapter Resolution

Before executing command, resolve the project root as the directory containing `adapters/resolve.md` (normally the repository root). Read that file, then read the adapter selected by `.architecture-guard/config.yml` or `.architecture-guard/selected-adapter` from `adapters/openspec.md`, `adapters/spec-kit.md`, or `adapters/generic.md`. Do not run `architecture-guard resolve adapter ...`; `resolve` handles engine resources, while adapter files handle SDD paths and commands. Materialize every adapter token before executing the command body.

## Adapter-Bound Artifact Contract

The adapter files are installed at the project root. `.architecture-guard/selected-adapter` selects the adapter; it is not a substitute for `adapters/resolve.md` or the selected adapter file.

For OpenSpec, the concrete bindings are:
- tasks: `openspec/changes/<change>/tasks.md`
- plan/design: `openspec/changes/<change>/design.md`
- spec: `openspec/changes/<change>/specs/<capability>/spec.md`
- proposal: `openspec/changes/<change>/proposal.md`
- governance and constitution manifest: `openspec/config.yaml` (read the `context` field first)
- standard OpenSpec constitutions: `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md` when present
- governance config: `.architecture-guard/config.yml`
- hygiene runner: `architecture-guard hygiene --json --target .`

Use the selected adapter as the authority for SpecKit and generic paths. Do not invent an OpenSpec `memory/architecture_constitution.md` path, and do not treat a capability name as a change identifier.

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

## Budgeted Context Contract

Resolve and apply the `budgeted_context_sdd` template with `architecture-guard resolve template budgeted_context_sdd`. Active adapter artifacts, applicable constitutions, security constraints, and code evidence are mandatory and authoritative. Neither memory nor a fallback index is implementation evidence.

Validate that the implementation fulfills all tasks in `tasks.md` while adhering to the defined architecture boundaries and the **Architecture Constitution**. This command acts as a post-implementation gate.

## User Input

Use the host command's native argument text as optional explicit artifact paths or scope.

Accepted explicit forms are `change=<id>`, `tasks=<path>`, `plan=<path>`, `spec=<path-or-glob>`, `constitution=<path>`, and `scope=diff`. Resolve relative paths from the project root. Explicit paths take precedence over discovery, but they do not permit a different SDD adapter than the persisted selection unless the user explicitly names one.


## CLI Boundaries

This skill owns verification scope selection and the report. Do not run `architecture-guard review-implementation --target .`; that CLI operation exposes no `--target` option and only delegates prompt execution. Use the selected host Security Review operation and the hygiene runner defined below.

## Verification Scope Selection

Use exactly one scope and report it before findings:

1. **Explicit Artifact Set** — Use user-supplied paths/change identifiers after confirming every required file exists.
2. **Active Change** — When no explicit scope is supplied, use the selected adapter's active-change discovery. For OpenSpec, first establish `CHANGE_ID` from the explicit scope or one unambiguous result from `openspec list --specs --json`, then run `openspec status --change "$CHANGE_ID" --json`. If there are multiple active changes, ask the user to choose and never select by recency.
3. **Git Diff Only (Degraded)** — If OpenSpec reports no active changes, do not inspect the archive and do not silently select the latest archived change. Run `architecture-guard detect-changed-files --json`. If files changed, verify boundary, constitution, security-architecture, and hygiene evidence against that diff, mark task and requirement coverage `Degraded` or `Not Applicable`, and do not report a full verification pass.
4. **Blocked** — If there is no explicit artifact set, no active change, and no changed files, stop with `Blocked: no verification scope`. Do not invent tasks, requirements, or implementation evidence.

The same no-active-change rule applies to generic and SpecKit workflows when their adapter cannot identify an active artifact set. A historical or archived change is used only when the user explicitly names it.

## Goal

Perform a high-integrity verification of the implementation. Unlike a general review, this command explicitly maps `tasks.md` to code evidence and validates architectural compliance against the project's specific boundaries and standards.

## Operating Constraints

- **REPOSITORY READ-ONLY**: This analytical gate does not modify repository files. It may write validated durable knowledge to Flash-Mem only after explicit user approval.
- **Evidence-Based**: Every "Verified" or "Missing" status must cite specific files or code patterns.
- **Constitution Authority**: Treat every constitution and governance Markdown file declared by the selected adapter's configuration or present in its adapter-resolved project paths as authoritative. A partial list must never be treated as complete.

## Execution Steps

### 1. Initialize Context

1. Resolve explicit artifact paths from native user input first; otherwise discover existing artifacts by matching `{adapter_path:tasks}`, `{adapter_path:plan}`, and `{adapter_path:spec}`. If multiple active sets are plausible, ask the user instead of guessing. If an optional artifact is absent, use an adapter-documented fallback only for the checks it can support, record its provenance, and mark unsupported checks `Degraded` rather than inventing evidence.
2. Resolve the selected artifact set to absolute paths without invoking SDD-tool-specific prerequisite scripts.
3. Resolve the selected adapter's project configuration first (`openspec/config.yaml` for OpenSpec) and inspect its `context` block for every referenced governance and constitution Markdown file.
4. Read every declared or present constitution, architecture, security, and layout Markdown file explicitly. Check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md` when present, plus every corresponding file resolved by the adapter path map. Never silently omit an existing file.
5. Load the adapter-resolved Repository Hygiene Config: `{adapter_path:governance-config}` (falling back to its documented constitution block).
6. Run `architecture-guard resolve hygiene-rules --list`, then resolve and load every returned hygiene rule in deterministic order. Workspace overrides replace same-named bundled rules.
   - **Direct Discovery Guard**: When checking adapter-resolved hidden paths such as `.architecture-guard/**`, use direct directory inspection first, then read listed files. A Glob/search no-match result is inconclusive and MUST NOT be reported as missing. Report a path as unavailable only after direct inspection confirms it does not exist. The verification report MUST explicitly list loaded rule files and counts. Missing optional hygiene rules are non-blocking.

### 2. Semantic Modeling (Internal)

Build internal representations:
- **Task-Boundary Map**: Associate each task with its intended architecture layer (Entry, Application, Domain, Data, External).
- **Implementation Evidence**: For each completed task (`[x]`), scan referenced files for logic that addresses the task description.
- **Contract Inventory**: Extract planned API/Data signatures from the technical design artifact.
- **Requirement Evidence Map**: Map every specification requirement and acceptance criterion to its plan/tasks representation and concrete implementation/test evidence.
- **Artifact Consistency Check**: Compare specification, plan, tasks, and security constraints for contradictions that make implementation intent or acceptance ambiguous.
- **Duplication Check**: Look for repeated business logic, validation, or transformation across files and confirm it has been centralized or explicitly justified.

**Common DRY Signals**
- Repeated business rules, approvals, validation, DTO mapping, or orchestration across multiple layers.
- One rule being implemented in more than one place instead of one shared source of truth.
- Callers recreating a contract, transformation, or decision that already exists in a shared boundary.

### 3. Verification Checks

#### A. Task-Code Alignment
- **Ghost Tasks**: Tasks marked complete but with no evidence in the referenced files.
- **Orphaned Code**: Implementation logic present in files that wasn't planned in `tasks.md`.
- **Missing Files**: Files referenced in tasks that do not exist on disk.
- **Requirement Coverage**: Every requirement and acceptance criterion must be `Verified`, `Partial`, `Missing`, `Contradicted`, or `Not Applicable` with cited artifact and code/test evidence.
- **Artifact Contradictions**: Report conflicting requirements, acceptance criteria, design decisions, or completion claims across spec, plan, and tasks; do not resolve contradictions by silently choosing one artifact.

#### B. Boundary Integrity
- **Layer Violation**: Logic from one layer (e.g., Database queries) appearing in another layer (e.g., Controllers/Entry).
- **Dependency Drift**: New dependencies introduced that violate the architecture's "Stable Abstractions" principle.
- **DRY Drift**: The same rule is implemented in multiple places instead of a shared source of truth.

#### C. Constitution Compliance
- **Rule Check**: Does the implementation violate any "MUST" rules in the authoritative constitution set?
- **Pattern Match**: Does the code follow the mandated architectural patterns (e.g., DTOs, Repositories, Events)?

#### D. Security Review on Implementation
- Apply {adapter_command:security-review-implementation} as the adapter policy for this phase.
- A callable host registration MUST identify a Security Review capability, advertise an implementation-scoped operation, and expose a dispatch API or an exact registered skill body. The canonical operation is `sr-verify`. Accept `sr-branch` only when its registration explicitly declares implementation/branch scope. `sr-changes` is reserved for multi-change review and MUST NOT be selected here.
- Pass the selected change or explicit artifact paths, changed files, adapter, constitutions, security constraints, and prior findings to the operation. Do not invoke a slash-command name or Markdown path as if it were executable.
- The independent operation MUST be read-only with respect to the repository. If it writes a report inside the repository or cannot declare its write behavior, mark Security Review `Unavailable` rather than silently allowing the write.
- If no callable operation is registered, perform only architecture-visible security checks required by loaded constitutions, mark the independent security review `Unavailable`, and report degraded coverage without claiming a pass.
- If security findings are architecture-relevant, classify them as `Security-Architecture Conflict` and preserve the Security Review operation's own severity and blocking decision.

#### E. Repository Hygiene Validation
- Execute {adapter_command:hygiene} from the project root and parse its JSON report. The runner loads the effective bundled-plus-local rule collection, applies configured exclusions, and returns each rule's source, execution mode, findings, severity, and blocking status.
- Treat `execution: builtin` findings as executed checks. Treat `execution: manual` rules as `Degraded` coverage; do not claim those rules passed. If the runner is unavailable, report Hygiene `Unavailable` and do not claim a clean repository.
- Determine effective severity and blocking status from the runner policy: architecture P0 rules, security policy, and hygiene `fail_on`/`warn_on` configuration remain independent. A finding blocks only when its governing policy says it blocks; category alone never changes severity.

### 4. Severity Assignment

- Preserve each governing policy's native severity, then record `Blocking: Yes/No` separately. Architecture P0 and configured hygiene/security blocking levels fail the gate; advisory findings do not.
- **CRITICAL**: Task marked done but implementation is missing; policy-designated critical Constitution violation; Boundary bypass (e.g., direct DB access from UI).
- **HIGH**: Contract mismatch; Missing error-handling/edge-cases from spec; Major boundary erosion; repeated business rules with no shared extraction.
- **MEDIUM**: Pattern drift; Task-referenced file exists but logic is incomplete.
- **LOW**: Naming inconsistencies; Minor structure drift.

## Verification Report

| ID | Category | Severity | Blocking | Location(s) | Target | Summary | Recommendation |
|:---|:---|:---|:---|:---|:---|:---|:---|
| V1 | Task Integrity | CRITICAL | Yes | `tasks.md:T01` | `tasks.md` | Task marked complete but logic missing in `auth.ts` | Implement logic or uncheck task |
| V2 | Boundary | HIGH | No | `ctrl/user.ts` | `{adapter_path:plan}` | Database query found in Controller layer | Move query to Repository/Data layer |

## Verification Scope
- **Mode**: [Explicit Artifact Set / Active Change / Git Diff Only (Degraded) / Blocked]
- **Change**: [change identifier or None]
- **Artifacts**: [resolved absolute paths or None]
- **Scope Evidence**: [status/diff command output or explicit user paths]

## Context Expansion
- **Fallback Loaded**: [Yes / No]
- **Historical Sources Opened**: [None or `path — named gap` entries]

### Requirement Evidence

| Requirement / Acceptance Criterion | Status | Blocking | Spec Evidence | Plan / Task Evidence | Code / Test Evidence |
|:---|:---|:---|:---|:---|:---|
| [Requirement ID or summary] | [Verified / Partial / Missing / Contradicted / Not Applicable] | [Yes/No under active policy] | [Path:line] | [Path:line] | [Path:line or explicit absence] |

### Artifact Contradictions
- **Contradiction**: [Conflicting artifact statements or None]
- **Blocking**: [Yes/No under active policy]
- **Resolution Required**: [Authoritative artifact and decision needed]

### Task Status Analysis
For each task in `tasks.md`:
- **Implemented?**: [Yes/No/Partial]
- **Evidence**: [File path or logic pattern]
- **Gap Analysis**: If "No" or "Partial", explain why the task is incomplete and suggest the remediation.

### Repository Hygiene Status
- **Loaded Rule Files**: [Path, source, and execution mode for every rule]
- **Executed Rule Count**: [Built-in rules executed / total loaded rules]
- **Manual or Unavailable Rules**: [Rule identifiers and degraded reason, or None]
- **Critical Issues**: [List any hygiene issues that fail verification]
- **Warnings**: [List non-blocking hygiene warnings]
- **Info**: [List minor hygiene notes]

### Security Review Status
- **Capability**: [Available / Unavailable]
- **Operation**: [sr-verify / sr-branch compatibility alias / None]
- **Coverage**: [Independent / Degraded]
- **Blocking Findings**: [Policy-derived findings or None]

### Metrics
- **Tasks Verified**: [Completed / Total]
- **Requirement Coverage**: [e.g. 100%]
- **Boundary Integrity**: [Strong / Eroded / Breached]
- **Constitution Score**: [e.g. 100%]

### Action Plan
1. **Critical Gaps**: Address missing implementation for tasks [IDs] immediately.
2. **Architecture Alignment**: Resolve boundary violations in [Files] using suggested refactor tasks.
3. **Completion**: If all CRITICAL/HIGH findings are resolved, propose any validated Flash-Mem lessons and write them only after explicit user approval.

### Claude Code Agent Teams Verification Protocol (When Active)
Activate this protocol only when the Claude Code host exposes named teammate spawning and messaging, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is enabled, and the user opted into Agent Teams for the current run. Otherwise execute the same work in single-agent mode:
- **Code Reviewer** leads the verification gate.
- If verification passes without blocking violations, the lead offers the separate governed archive workflow after reporting verification evidence; archival still requires its own approvals.
- If verification exposes boundary drift or unfulfilled tasks, **HITL Gate 2** prompts the user to route back to **Analyst Creator** for task updates and re-assignment.

**Next Step**: [e.g. "Run {adapter_command:architecture-apply} to fix V2"]
