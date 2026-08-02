## ADDED Requirements

### Requirement: Compact Skill Identifier Naming
The generator MUST use the `ag-` prefix without the `architecture-` infix when creating skill files, identifiers, and configuration templates.

#### Scenario: Installing a new skill
- **WHEN** the installation script generates a new skill template (e.g., for review)
- **THEN** it generates a skill named `ag-review` instead of `ag-architecture-review`
- **AND** the internal identifier inside `SKILL.md` is `name: ag-review`
