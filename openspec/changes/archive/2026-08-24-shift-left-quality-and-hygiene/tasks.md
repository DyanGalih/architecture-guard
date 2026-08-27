## 1. Core Contract & Templates Update

- [x] 1.1 Update `.architecture-guard/templates/ponytail_core.md` and related templates to include explicit shift-left quality, strict typing, bounded collection reads, and zero-tolerance repository hygiene principles in Construction Rules.

## 2. Planning Skill Update (`ag-governed-plan`)

- [x] 2.1 Update `.agent/skills/ag-governed-plan/SKILL.md` to require technical designs to proactively define bounded pagination, explicit DTO envelopes, parameter validation, transactional safety, and hygiene targets.

## 3. Tasks Skill Update (`ag-governed-tasks`)

- [x] 3.1 Update `.agent/skills/ag-governed-tasks/SKILL.md` to mandate task acceptance criteria covering type safety (no loose `any`/`unknown`), controller validation, localized verification (test/lint/typecheck), and task-level hygiene.

## 4. Implementation Skill Update (`ag-governed-implement`)

- [x] 4.1 Update `.agent/skills/ag-governed-implement/SKILL.md` Step 3 to include an inline pre-completion self-verification gate (heuristic SonarLint + repository hygiene check) before marking tasks `[x]`.

## 5. Review Alignment & Verification

- [x] 5.1 Verify alignment across `ag-governed-plan`, `ag-governed-tasks`, `ag-governed-implement`, `ag-review-implementation`, and `ag-verify`.
- [x] 5.2 Validate the OpenSpec change directory with `openspec validate shift-left-quality-and-hygiene` or inline spec/design/task consistency verification.
