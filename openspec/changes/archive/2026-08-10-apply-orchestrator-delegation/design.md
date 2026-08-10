## Context

`ag-apply` currently edits only `design.md` and `tasks.md` (see [SKILL.md Allowed Edits](file:///home/galih/IdeaProjects/spec-kit-architecture-guard/.agent/skills/ag-apply/SKILL.md#L33-L47)). When `ag-review-artifacts` or `ag-verify` produces findings targeting upstream artifacts (proposal.md, spec.md), users must manually switch to the SDD tool's update workflow. See proposal.md for full motivation.

Key existing contracts:
- `ag-apply` reads review output and applies plan/tasks edits.
- `openspec-update-change` reconciles any planning artifact in a change.
- `ag-review-artifacts` produces a structured report with findings table and action plan.
- The OpenSpec adapter command map uses the "native if available, inline fallback" pattern.

## Goals / Non-Goals

**Goals:**
- `ag-apply` partitions findings by target artifact and handles all of them in a single invocation.
- Upstream artifact fixes are delegated to the SDD tool's native update capability, preserving boundary isolation.
- Review output pre-classifies findings with a `Target:` field for clean partitioning.
- User confirmation is required before upstream delegation.

**Non-Goals:**
- Expanding `ag-apply`'s direct-editing scope to understand proposal/spec content contracts (that would be B1 direct editing — rejected).
- Adding `--auto-approve` or CI/CD mode (YAGNI — this is a development-phase tool).
- Creating a new `ag-fix-drift` command (Option C — fallback only if B2 fails).
- Changing the SDD tool's native update capability contract.

## Decisions

### D1: B2 Delegation Model
**Choice**: `ag-apply` handles plan/tasks directly, delegates upstream artifacts to the adapter's update capability.
**Alternatives considered**:
- B1 (direct editing): Simpler implementation but couples Architecture Guard to SDD-tool artifact formats. Rejected — boundary violation.
- Option A (smart handoff): Just emit "run /opsx-update". Rejected — requires manual switching, loses context.
- Option C (new `ag-fix-drift` command): Adds a new command to learn. Rejected — unnecessary indirection.
**Rationale**: B2 preserves AG's current boundary (plan/tasks) while extending its orchestration reach through adapter delegation. The adapter already supports this pattern.

### D2: No New Adapter Command Entry
**Choice**: `ag-apply` calls the SDD tool's native update capability directly (e.g., `openspec-update-change`). Falls back to AG-native inline fix when unavailable.
**Alternatives considered**:
- New `architecture-apply-upstream` adapter key: Creates adapter churn for every SDD tool. Rejected — over-engineering.
- Scope parameter on existing `architecture-apply`: Adds complexity to a working contract. Rejected — YAGNI.
**Rationale**: The adapter command map already documents each SDD tool's capabilities. `ag-apply` reads the adapter to discover the native update capability rather than requiring a new mapping.

### D3: Same Confirmation UX for Fallback
**Choice**: The AG-native fallback follows the same confirmation UX as the SDD-tool delegation path.
**Rationale**: Spec/proposal are authoritative artifacts regardless of who edits them. Consistency > special-casing.

### D4: Authoritative-First Multi-Artifact Fix
**Choice**: Fix spec first → plan → tasks. Propagate changes downstream after each fix.
**Rationale**: The authoritative artifact defines intent; downstream artifacts reflect it. Fixing downstream first could create inconsistency with upstream.

### D5: Review Output Target Classification
**Choice**: `ag-review-artifacts` and `ag-verify` add a `Target:` column/field to each finding.
**Rationale**: Partition logic in `ag-apply` is cleaner when the review already classifies findings. Without this, `ag-apply` must infer targets from finding context, which is fragile.

## Risks / Trade-offs

- **[SDD tool update capability may not accept externally supplied findings]** → Mitigation: Pass findings as input context; if the SDD tool's update workflow ignores them, the fallback AG-native fix handles it.
- **[Multi-artifact fix ordering could fail mid-way]** → Mitigation: Report which fixes succeeded and which remain; the user can re-run `ag-apply` to resume.
- **[Review pre-classification adds output format complexity]** → Mitigation: The `Target:` field is a single column addition to an existing table. Minimal format change.
- **[Generic adapter has no native update capability]** → Mitigation: AG-native inline fix is the fallback; this is already the pattern for generic mode.

## Affected Files

| File | Change Type | Description |
|---|---|---|
| `.agent/skills/ag-apply/SKILL.md` | Modified | Add orchestration, partition logic, delegation, confirmation UX, unified output |
| `.agent/skills/ag-review-artifacts/SKILL.md` | Modified | Add `Target:` field to findings table and Action Plan |
| `.agent/skills/ag-verify/SKILL.md` | Modified | Add `Target:` field to findings (same format as review-artifacts) |
| `adapters/openspec.md` | Modified | Document delegation target mapping for upstream artifact fixes |
| `adapters/generic.md` | Modified | Document fallback AG-native artifact-fix for generic mode |
| `.agent/workflows/agx-apply.md` | Modified | Update workflow to match new SKILL.md |
| `.opencode/commands/apply.md` | Modified | Update OpenCode command to match (if exists) |
