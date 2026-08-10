## MODIFIED Requirements

### Requirement: Pre-Implementation Artifact Validation
The system SHALL support a standalone command (`ag-review-artifacts`) that evaluates the active feature's specification and planning artifacts against the loaded architecture constitution. Each finding in the review output MUST include a `Target:` field that classifies which artifact the finding affects.

#### Scenario: Validating a correct plan
- **WHEN** the user runs `ag-review-artifacts` on a completed feature plan
- **THEN** the system returns a successful evaluation without executing any code analysis

#### Scenario: Detecting drift in a plan
- **WHEN** the user runs `ag-review-artifacts` on a plan that contradicts the constitution
- **THEN** the system logs a CRITICAL/HIGH violation with a `Target:` field identifying the affected artifact, and suggests revising the plan before implementation begins

#### Scenario: Finding output includes target classification
- **WHEN** the system produces a finding for any artifact violation
- **THEN** the finding MUST include a `Target:` field set to one of: `proposal.md`, `spec.md`, `design.md`, or `tasks.md`

## ADDED Requirements

### Requirement: Target Classification for Review Findings
The system SHALL classify each review finding by the artifact it affects, using a `Target:` field. The classification MUST resolve to exactly one of the recognized artifact types: `proposal.md`, `spec.md`, `design.md`, or `tasks.md`.

#### Scenario: Single-artifact finding
- **WHEN** a finding affects exactly one artifact
- **THEN** the `Target:` field MUST be set to that artifact's filename (e.g., `Target: spec.md`)

#### Scenario: Multi-artifact finding
- **WHEN** a finding affects multiple artifacts
- **THEN** the system MUST resolve to the authoritative-first artifact (spec > design > tasks > proposal) as the primary `Target:`, and list downstream artifacts for propagation
