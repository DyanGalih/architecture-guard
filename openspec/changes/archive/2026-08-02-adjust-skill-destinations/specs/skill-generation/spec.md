## ADDED Requirements

### Requirement: Skill Generation Paths for Scopes
The system SHALL generate new skills in specific directories depending on the selected scope, which is determined by the presence of a user-defined path.

#### Scenario: Path defined by user
- **WHEN** the user defines a path for a new skill
- **THEN** the system generates the skill in the Workspace scope at `.agents/skills/{skill-name}/SKILL.md`

#### Scenario: No path defined by user
- **WHEN** the user does not define a path for a new skill
- **THEN** the system displays a confirmation prompt indicating the skill will be installed globally
- **AND** the system requests permissions if needed
- **AND** upon confirmation and permission grant, generates the skill in the Global scope at `~/.gemini/antigravity-cli/skills/{skill-name}/SKILL.md`

#### Scenario: Shared scope selected
- **WHEN** the user explicitly selects the shared scope for a new skill
- **THEN** the system generates the skill in `~/.gemini/skills/{skill-name}/SKILL.md`

### Requirement: Batch Overwrite Confirmation
The system SHALL prompt the user only once for overwrite permission if any of the requested skills already exist in the target destination.

#### Scenario: Multiple skills already exist
- **WHEN** the user attempts to generate multiple skills
- **AND** one or more of the requested skills already exist at the target path
- **THEN** the system prompts the user once to replace the existing skills
- **AND** applies the user's overwrite decision to all existing skills in the current operation
