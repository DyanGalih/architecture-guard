# Tasks: Deprecated & Obsolete Code Governance

## Phase 1: Create Hygiene Rule
- [x] 1.1 Create `src/hygiene-rules/deprecated-and-dangerous-code.md` with:
  - Critical / Blocking severity specification
  - Comprehensive catalog of deprecated and dangerous patterns by language/framework (PHP, JS/TS, Node.js, Angular, React, Security)
  - Clear rationale, failure modes, and approved modern replacements for each entry
  - Extension guidance for project-specific rules
- [x] 1.2 Copy `src/hygiene-rules/deprecated-and-dangerous-code.md` to `.architecture-guard/hygiene-rules/deprecated-and-dangerous-code.md`

## Phase 2: Update Orchestrations & Documentation
- [x] 2.1 Update `src/orchestration/governed-implement.md` and `src/commands/governed-implement.md` with pre-implementation deprecation checks
- [x] 2.2 Update `src/orchestration/governed-plan.md`, `src/commands/governed-plan.md`, `src/orchestration/governed-tasks.md`, and `src/commands/governed-tasks.md` with deprecation guidance
- [x] 2.3 Update `src/docs/repository-hygiene.md` with the new rule details and configuration
- [x] 2.4 Update `src/docs/release-notes.md` with changelog entry

## Phase 3: Verification & Archival
- [x] 3.1 Run tests (`npm test`) to ensure all test suites pass
- [x] 3.2 Verify hygiene and architecture compliance with `ag-verify`
