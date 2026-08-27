# shift-left-quality-and-hygiene Specification

## Purpose
TBD - created by archiving change shift-left-quality-and-hygiene. Update Purpose after archive.

## Requirements

### Requirement: Proactive Design Quality Gates (`ag-governed-plan`)
The planning phase MUST evaluate and document explicit architectural patterns for bounded pagination, strict DTO envelopes, parameter validation, transaction safety, and hygiene targets.

#### Scenario: Planning with quality and hygiene design
- **GIVEN** a feature specification requiring database queries or API endpoints
- **WHEN** `ag-governed-plan` generates the technical design (`design.md`)
- **THEN** the design MUST explicitly define bounded pagination limits, request/response DTO serialization envelopes, input validation pipes/types, and transaction error recovery boundaries.

### Requirement: Quality-Enriched Task Decomposition (`ag-governed-tasks`)
Task breakdown MUST require explicit acceptance criteria per task covering type safety, boundary validation, localized verification, and hygiene.

#### Scenario: Generating implementation tasks
- **GIVEN** an accepted technical design
- **WHEN** `ag-governed-tasks` generates or reconciles `tasks.md`
- **THEN** each task MUST contain acceptance criteria for strict typing (no loose `any`/`unknown`), explicit DTO mapping, localized test/lint execution, and workspace hygiene.

### Requirement: Inline Implementation Self-Verification (`ag-governed-implement`)
Before marking any implementation task complete (`[x]`), the executor MUST perform an inline hygiene and heuristic SonarLint check.

#### Scenario: Executing and completing an implementation task
- **GIVEN** an in-progress task in `tasks.md`
- **WHEN** the implementation changes are written
- **THEN** the executor MUST check modified files against hygiene rules and heuristic SonarLint rules and resolve any violations before marking the task `[x]`.
