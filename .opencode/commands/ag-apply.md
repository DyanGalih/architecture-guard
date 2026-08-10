---
description: Apply approved architecture refactors by updating plan and task artifacts directly.
---

# Architecture Apply Command

Execute this workflow through `{adapter_command:architecture-apply}`; the token is the adapter-selected capability and must not be replaced with a package-specific executable name.

## SDD Tool Detection

Before executing command, read `adapters/detect.md` to determine the active SDD tool. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

You are applying approved architecture refactors for `architecture-guard`.
When `flash-mem` is available, use it first to gather memory context, then prefer `memory-synthesis.md` and the approved architecture review output before editing plan or task artifacts. Otherwise, use the repository artifacts directly.
If `flash-mem` is available, use the MCP-backed context preparation flow exposed by `flash-mem`; otherwise treat the legacy prepare-context alias as a compatibility path. Compatibility tool names such as `speckit_memory_*` are provided by `flash-mem` when the host still expects them. After applying changes, sync durable lessons or architecture decisions back into Flash-Mem when available.

This is the write-capable companion to the review workflow. Use it when the team wants the architecture feedback reflected directly in planning artifacts instead of only receiving suggestions.

Use it after `ag-review-artifacts`, `ag-review-implementation` or `ag-violation-detection` has produced approved refactor tasks, or when a Constitution Update Proposal should be reflected in `plan.md` or `tasks.md`.

Use it for approved Constitution Update Proposals when the change should be reflected in plan or task artifacts as explicit follow-up work.

You may update plan and task artifacts, but you must keep the changes small, targeted, and non-blocking unless the Constitution explicitly requires a blocking change.

## Allowed Edits

You may revise directly:
- `plan.md` / `design.md`
- `tasks.md`
- Related task breakdown or checklist artifacts from the selected adapter workflow

For findings targeting upstream artifacts (`proposal.md`, `spec.md`), `ag-apply` acts as an orchestrator and delegates those fixes to the SDD tool's native update capability (or runs an inline AG-native fallback) upon user confirmation. `ag-apply` does NOT edit upstream artifacts directly.

You should not:
- Rewrite the whole plan unnecessarily.
- Remove product intent or feature scope.
- Introduce SDD-tool-specific rules into the core workflow.
- Apply security, performance, or linting changes that belong to other concerns.

## Inputs To Consider

Review any available:
- Existing architecture review output (including `Target:` fields for finding classification).
- Approved refactor tasks.
- Constitution rules.
- Feature specification.
- Current plan artifact.
- Current tasks artifact.
- Existing architecture decisions from memory context.
- Optional preset guidance, if available.
- Approved Constitution Update Proposals, if present.

## Finding Partitioning

Before executing edits, `ag-apply` partitions all review findings into two distinct groups based on their `Target:` field:

1. **Plan/Tasks Group**: Findings targeting `plan.md` / `design.md` or `tasks.md`.
2. **Upstream Group**: Findings targeting `proposal.md` or `spec.md`.

For multi-artifact findings, resolution is performed in authoritative order (`spec.md` > `plan.md` > `tasks.md` > `proposal.md`), fixing the authoritative artifact first and propagating downstream.

## Apply Procedure

### Step 1: Direct Apply for Plan/Tasks Group
1. Process all findings in the **Plan/Tasks Group** directly.
2. Preserve feature intent and implementation scope.
3. Add or refine task entries in `tasks.md` for refactors that are safe to schedule.
4. Reorder tasks when architectural dependencies matter.
5. Update plan/design language so boundaries, contracts, and ownership are explicit.
6. Keep implementation moving unless the Constitution explicitly says the issue is blocking.
7. If a refactor is too large for current scope, create a scoped task rather than expanding the whole plan.
8. If an approved Constitution Update Proposal exists, reflect it as explicit follow-up work without auto-changing the Constitution itself.
9. When a refactor removes duplication, update the plan or tasks so the shared implementation remains the single source of truth and all callers are adjusted to use it.

### Step 2: Confirmation for Upstream Group
If the **Upstream Group** contains findings:
1. Present a grouped summary table of upstream findings organized by target artifact (`proposal.md`, `spec.md`).
2. Prompt the user for confirmation: `"Proceed with upstream artifact fixes? [Y/n]"`
3. If the user declines/rejects, mark all upstream findings as `skipped` in the final report and exit early.

### Step 3: Upstream Delegation / Fallback Execution
Upon user confirmation for the **Upstream Group**:
1. **Native Delegation**: If the active SDD tool exposes a native update capability (e.g. `openspec-update-change` in OpenSpec), delegate the upstream findings to that capability with finding details as input context.
2. **AG-Native Fallback**: If the active SDD tool lacks a native update capability (e.g. generic mode), execute an inline AG-native artifact-fix following the exact same confirmation and authoritative-first ordering.
3. **Propagation**: Ensure fixes are applied in authoritative order (`spec.md` first, then downstream to `plan.md` and `tasks.md` for coherence).

## Write-Back Rules

- Prefer incremental edits over replacement.
- Keep existing decisions unless the new architecture finding clearly invalidates them.
- Make task titles actionable and specific.
- Preserve any accepted deviation if it was already documented.
- If the review output is uncertain, do not force a write-back; leave a note instead.

## Output Format

Return a unified summary report covering both direct edits and delegated upstream fixes:

```markdown
# Architecture Apply Summary

## Direct Edits (Plan / Tasks)
- **Status**: [Applied / Skipped / None Needed]
- **Modified Artifacts**: [e.g. design.md, tasks.md]
- **Applied Findings**: [List of applied plan/tasks findings]

## Delegated Upstream Edits (Proposal / Spec)
- **Status**: [Applied / Delegated / Skipped by User / No Upstream Findings]
- **Delegation Target**: [Native capability name or AG-Native Fallback]
- **Upstream Findings**:
  | ID | Target | Finding | Status |
  |:---|:---|:---|:---|
  | V1 | `spec.md` | ... | Applied / Skipped |

## Next Step
- [e.g. Continue to implementation or run verification]
```

## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `commands/apply.md` for direct SpecKit use.
