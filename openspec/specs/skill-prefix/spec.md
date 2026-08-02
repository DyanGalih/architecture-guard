# Skill Prefix

## Purpose
TBD: Governs the naming conventions and prefixing of Architecture Guard skills to prevent naming collisions.

## Requirements

### Requirement: Skill Name Prefixing
The system SHALL ensure that all generated Architecture Guard skills are prefixed with `ag-` to prevent naming collisions with other tools and extensions.

#### Scenario: Generating a generic skill
- **WHEN** the system generates a skill (e.g., `init` or `verify`)
- **THEN** the resulting skill identifier and directory name MUST be prefixed with `ag-` (e.g., `ag-init` or `ag-verify`)
- **AND** the skill's instructions must refer to itself and other Architecture Guard skills using the `ag-` prefix.
