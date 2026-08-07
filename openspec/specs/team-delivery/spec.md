# team-delivery Specification

## Purpose
Introduces the Team Delivery Workflow for Architecture Guard, allowing business artifacts (User Stories) to be generated and reviewed prior to engineering execution.

## Requirements

### Requirement: Team Delivery Workflow Orchestration
The system SHALL provide an optional `delivery-team` workflow that extends the standard `delivery` workflow by generating a business-oriented User Story before creating engineering artifacts.

#### Scenario: User chooses team delivery
- **WHEN** the user concludes Discovery and opts for the Team Delivery workflow
- **THEN** the system generates a User Story markdown artifact
- **THEN** the system proceeds to generate the standard Specification, Design, and Tasks artifacts

### Requirement: User Story Persistence
The system SHALL persist the generated User Story to a configurable destination, defaulting to a local Markdown file.

#### Scenario: User Story generation completes
- **WHEN** the User Story is successfully generated
- **THEN** it is saved as a Markdown file in the change directory
- **THEN** it is available for business stakeholder review

### Requirement: Discovery Handoff Modification
The Discovery phase handoff instructions SHALL present multiple workflow options, including the existing Delivery and the new Team Delivery workflows.

#### Scenario: Discovery phase completes
- **WHEN** the Discovery Summary Draft is outputted
- **THEN** the recommended next steps include both `ag-governed-delivery` and `ag-governed-delivery-team`
