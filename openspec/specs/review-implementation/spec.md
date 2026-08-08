# review-implementation Specification

## Purpose
Lints and audits implementation code against the planned artifacts and the project constitution to identify boundary leaks and anti-patterns.

## Requirements

### Requirement: Post-Implementation Code Auditing
The system SHALL support a standalone command (`ag-review-implementation`) that evaluates the codebase implementation against both the planned architecture and the loaded architecture constitution.

#### Scenario: Identifying a boundary leak
- **WHEN** the user runs `ag-review-implementation` and the codebase contains business logic inside an API route
- **THEN** the system detects the boundary leak and outputs a structured Refactor Task to fix it

#### Scenario: Identifying DRY violations
- **WHEN** the user runs `ag-review-implementation` and similar domain logic is found duplicated in multiple files
- **THEN** the system flags the duplication drift and proposes a centralized abstraction
