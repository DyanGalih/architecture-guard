# Proposal: Shift-Left Quality & Repository Hygiene into SDD Lifecycle

## Problem
In projects adopting Architecture Guard, development frequently enters an infinite review-apply loop between implementation and post-implementation review. This occurs because code-quality rules (SonarLint complexity, typed contracts, DTO envelopes, UUID parsing, bounded pagination) and repository hygiene rules (temporary artifacts, commented code, unverified migration scripts) are discovered only during post-implementation reviews (`ag-review-implementation` / `ag-verify`), causing task lists to continuously balloon across iterative remediation sections (e.g. V1–V51).

## Proposed Solution
Shift SonarLint and repository hygiene constraints left across the Architecture Guard SDD lifecycle:
1. **Planning (`ag-governed-plan`)**: Require technical design artifacts to explicitly define bounded pagination, DTO serialization envelopes, typed discriminated contracts, transaction boundaries, and hygiene expectations.
2. **Tasks (`ag-governed-tasks`)**: Mandate that task breakdowns embed explicit SonarLint code-quality acceptance criteria, typing guarantees, and localized hygiene checks directly into task items.
3. **Implementation (`ag-governed-implement`)**: Introduce an inline pre-completion self-check step (heuristic SonarLint scan + hygiene verification) before marking tasks `[x]` to catch and resolve issues immediately at the task boundary.
4. **Templates & Constitutions**: Update ponytail core and template guidance to reflect these shift-left expectations.

## Non-Goals
- Running heavyweight external AST linters during the planning phase. Planning defines architectural patterns; code execution happens during implementation.
- Over-engineering tasks with duplicate boilerplate. Criteria must remain concise and focused.
