## Purpose
Validates planning and design artifacts strictly against architectural constraints and the project constitution, without reading any implementation code.

## ADDED Requirements

### Requirement: Pre-Implementation Artifact Validation
The system SHALL support a standalone command (`ag-review-artifacts`) that evaluates the active feature's specification and planning artifacts against the loaded architecture constitution.

#### Scenario: Validating a correct plan
- **WHEN** the user runs `ag-review-artifacts` on a completed feature plan
- **THEN** the system returns a successful evaluation without executing any code analysis

#### Scenario: Detecting drift in a plan
- **WHEN** the user runs `ag-review-artifacts` on a plan that contradicts the constitution
- **THEN** the system logs a CRITICAL/HIGH violation and suggests revising the plan before implementation begins
