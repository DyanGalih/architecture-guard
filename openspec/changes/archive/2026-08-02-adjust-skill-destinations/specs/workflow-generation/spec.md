# workflow-generation

This capability defines the rules for generating workflows alongside skills for the Antigravity agent.

## Normative Requirements

### Requirement: Dual Installation for Antigravity
The system SHALL support generating both a Skill and a Workflow simultaneously when the `antigravity` agent target is selected.

#### Scenario: User installs commands for Antigravity
- **WHEN** the user selects to install commands for `antigravity`
- **THEN** the system generates a Skill at the resolved scope path (Workspace, Global, or Shared) with the prefix `ag-`
- **AND** the system ALSO generates a raw Markdown Workflow file at `.agent/workflows/` using the prefix `agx-`

### Requirement: Workflow File Naming
The system SHALL use the `.md` extension and the `agx-` prefix for generated workflows.

#### Scenario: Translating command name to workflow
- **GIVEN** a source command named `architecture-review`
- **WHEN** generating the workflow file
- **THEN** the system names the file `agx-architecture-review.md`
- **AND** places it in `.agent/workflows/`
