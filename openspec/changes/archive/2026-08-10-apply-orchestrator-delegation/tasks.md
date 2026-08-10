## 1. Review Output Pre-Classification (Target Field)

- [x] 1.1 Add `Target:` column to the findings table in `.agent/skills/ag-review-artifacts/SKILL.md` — update the Output Format section to include `Target` as a required column in the violation table (between `Location(s)` and `Summary`), with allowed values: `proposal.md`, `spec.md`, `design.md`, `tasks.md`
- [x] 1.2 Add target classification guidance to the Review Procedure in `.agent/skills/ag-review-artifacts/SKILL.md` — instruct the reviewer to determine which artifact each finding targets based on the finding's source evidence
- [x] 1.3 Update the Action Plan template in `.agent/skills/ag-review-artifacts/SKILL.md` — replace the generic "Run `/ag-apply`" recommendation with artifact-aware next steps (e.g., "Run `/ag-apply` to resolve all findings; plan/tasks findings will be applied directly, upstream findings will be delegated with confirmation")
- [x] 1.4 Add `Target:` column to the findings table in `.agent/skills/ag-verify/SKILL.md` — mirror the same output format changes made to `ag-review-artifacts`

## 2. ag-apply Orchestration Logic

- [x] 2.1 Add finding partitioning logic to `.agent/skills/ag-apply/SKILL.md` — insert a new "Finding Partitioning" section before the Apply Procedure that classifies findings into plan/tasks group (design.md, tasks.md) and upstream group (proposal.md, spec.md) based on the `Target:` field
- [x] 2.2 Update the Allowed Edits section in `.agent/skills/ag-apply/SKILL.md` — clarify that plan/tasks findings are applied directly (existing behavior) and upstream findings are delegated, not edited directly
- [x] 2.3 Add upstream delegation procedure to `.agent/skills/ag-apply/SKILL.md` — after applying plan/tasks findings, list upstream findings in a grouped summary table, ask the user for single confirmation, and delegate to the SDD tool's native update capability
- [x] 2.4 Add fallback AG-native artifact-fix section to `.agent/skills/ag-apply/SKILL.md` — when no SDD tool update capability is available, run an inline artifact-fix with the same confirmation UX
- [x] 2.5 Add authoritative-first ordering to `.agent/skills/ag-apply/SKILL.md` — specify that multi-artifact findings are resolved in spec > plan > tasks order, with downstream propagation after each fix
- [x] 2.6 Add unified output format to `.agent/skills/ag-apply/SKILL.md` — define a summary output that reports all findings, their resolution method (direct/delegated/skipped), and outcomes

## 3. Adapter Updates

- [x] 3.1 Update `adapters/openspec.md` command map — document that `architecture-apply` delegates upstream findings to the existing `openspec-update-change` capability with the finding details as input context
- [x] 3.2 Update `adapters/generic.md` — document the fallback AG-native artifact-fix behavior for generic mode where no SDD tool update capability exists

## 4. Workflow and Command Sync

- [x] 4.1 Update `.agent/workflows/agx-apply.md` to match the new skill changes
- [x] 4.2 Update `.opencode/commands/ag-apply.md` to match the new skill changes

## 5. Verification

- [x] 5.1 Validate change with `openspec validate apply-orchestrator-delegation` to ensure all artifacts are coherent
- [x] 5.2 Run `ag-review-artifacts` against this change to confirm no architecture drift in the proposed changes
