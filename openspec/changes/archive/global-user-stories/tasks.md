# Implementation Tasks: Global User Stories

- [x] 1. **Update `ag-init` workflow**:
  - Modify `src/commands/init.md` (and `src/orchestration/init.md` if it exists) to add an interview question asking if the user is working solo or in a team.
  - Add instructions to scaffold the `<root>/user-stories/` directory if the user selects "Team".
  - Ensure the selection is persisted to the Governance rules (`openspec/config.yaml`).

- [x] 2. **Update `ag-governed-delivery-team` generation paths**:
  - Modify `src/commands/governed-delivery-team.md` and `src/orchestration/governed-delivery-team.md`.
  - Update Phase 3 to search for and create `user-story.md` inside `<root>/user-stories/` instead of the active change directory.

- [x] 3. **Add linkage logic to `ag-governed-delivery-team`**:
  - Update Phase 5 (Plan Gate) to ensure that when generating the technical plan (`design.md` or `plan.md`), the AI injects the YAML metadata: `Story: ../../../user-stories/<selected-story>.md`.

- [x] 4. **Fix SDD Lifecycle bypass in `ag-governed-delivery-team`**:
  - Add a "Phase 4.5 — Specification Gate" to `src/orchestration/governed-delivery-team.md` (and `src/commands/governed-delivery-team.md`).
  - The new phase must check if `proposal.md` or `specs/` (as defined by the adapter) are missing.
  - If missing, it must require the execution of `ag-governed-spec` to correctly generate the SDD-specific specification artifacts before allowing the Plan Gate to open.

- [x] 5. **Update MCP sync (Optional/Future)**:
  - Add a placeholder step in `governed-delivery-team.md` indicating where the issue tracker MCP sync will occur once the story is approved.
