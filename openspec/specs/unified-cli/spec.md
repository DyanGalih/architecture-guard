# unified-cli Specification

## Purpose
TBD

## Requirements

### Requirement: Unified TypeScript CLI
The unified TypeScript CLI (`src/bin/cli.ts`) SHALL expose commands that integrate with the orchestration workflows.

#### Scenario: Using the CLI
- **WHEN** a user interacts with the system via command line
- **THEN** they use the unified TS CLI to perform actions instead of fragmented scripts.

#### Scenario: Routing to review commands
- **WHEN** the user invokes a review workflow from the orchestration layer
- **THEN** the CLI correctly delegates execution to the appropriate implementation paths for artifact or implementation review, replacing the legacy unified `ag-review` flow.
