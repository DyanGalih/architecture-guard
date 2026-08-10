## Why

Users running `ag-apply` after an architecture review hit a dead end when findings target upstream artifacts (proposal.md, spec.md) that `ag-apply` cannot edit. The current contract limits `ag-apply` to plan/tasks artifacts only. Users must manually discover and switch to the SDD tool's artifact-update workflow (`/opsx-update`), losing context and breaking the remediation flow. This is a real-world workflow gap confirmed in production use.

## What Changes

- **`ag-apply` becomes an orchestrator**: After applying plan/tasks findings directly (existing behavior), it partitions remaining findings by target artifact, presents them to the user in a grouped summary table, and delegates upstream artifact fixes to the SDD tool's native update capability (e.g., `openspec-update-change`) upon user confirmation.
- **Fallback AG-native artifact-fix**: When the SDD tool lacks a native update capability, `ag-apply` runs an inline artifact-fix with the same confirmation UX.
- **Review output pre-classification**: `ag-review-artifacts` and `ag-verify` tag each finding with a `Target:` field identifying which artifact needs the fix, enabling clean partitioning at apply-time.
- **Multi-artifact findings**: Fixed authoritative-first (spec > plan > tasks), then propagated downstream. Both artifacts are updated for coherence.

## Capabilities

### New Capabilities
- `apply-orchestrator`: Orchestration logic for `ag-apply` to partition findings by artifact type, delegate upstream fixes to the SDD tool's native update capability, and handle fallback AG-native artifact-fix with user confirmation.

### Modified Capabilities
- `review-artifacts`: Add a `Target:` field to each finding in the review output, classifying which artifact the finding affects (proposal, spec, design, tasks).

## Impact

- **Affected skills**: `ag-apply/SKILL.md`, `ag-review-artifacts/SKILL.md`, `ag-verify/SKILL.md`
- **Affected adapters**: `adapters/openspec.md` (delegation target mapping), `adapters/generic.md` (fallback path)
- **No code changes in `src/`**: This is a prompt/workflow-level change, not a TypeScript code change.
- **Backward compatible**: Existing `ag-apply` behavior for plan/tasks findings is preserved; new orchestration only activates when upstream findings exist.

**Objective**: Eliminate the dead-end workflow gap so users can resolve all architecture findings through a single `ag-apply` invocation.
**Success Criteria**: `ag-apply` partitions and resolves findings across all artifact types without requiring manual workflow switching.
