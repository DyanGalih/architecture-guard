# Gap Filling

## ADDED Requirements

### Requirement: Detect missing framework features
The system SHALL detect governance features that the active SDD framework lacks and offer to fill each gap with inline actions.

#### Scenario: OpenSpec lacks branch creation
- **WHEN** `governed spec` runs under OpenSpec
- **WHEN** current branch is `main`, `master`, `dev`, `develop`, `development`, or `staging`
- **THEN** the orchestrator offers to create a feature branch via `git checkout -b <branch-name>`

#### Scenario: OpenSpec lacks specification clarification
- **WHEN** `governed spec` runs under OpenSpec and the spec has been created
- **THEN** the orchestrator offers an interactive inline clarification loop to resolve ambiguities

#### Scenario: SpecKit lacks ACL architecture verification
- **WHEN** `governed implement` runs under SpecKit and implementation is complete
- **THEN** the orchestrator offers to run the architecture verify command (gap fill for missing framework feature)

### Requirement: Framework differences roundtrip seamlessly
The necessary adapter SHALL list which standard governance steps its framework supports natively and which require bridging.

#### Scenario: Support summary in adapter
- **WHEN** the adapter is loaded
- **THEN** the AI can read the adapter's gap section and know exactly which steps need filling without scanning the whole document

### Requirement: Gap fill produces user prompts
Each gap fill SHALL generate a user-facing prompt offering the fill step (never auto-execute without approval).

#### Scenario: User accepts gap fill
- **WHEN** the orchestrator offers to create a branch
- **THEN** user approval executes `git checkout -b` and indicates success
- **Then** orchestration continues from that step

#### Scenario: User declines gap fill
- **WHEN** the orchestrator offers to fill a gap and user declines
- **THEN** the orchestrator notes the skipped step and continues with the remaining workflow

### Requirement: Gap bridging per adapter is self-documenting
Each adapter's gap section SHALL describe what is missing, why it matters, and exactly what fill action resolves it.

#### Scenario: OpenSpec branch gap description
- **WHEN** reading the OpenSpec adapter gap section
- **THEN** the branch gap entry states: "OpenSpec `new change` does not create a git branch. Fill: run `git checkout -b <name>` before creating the change. Reason: prevents work on default branch."