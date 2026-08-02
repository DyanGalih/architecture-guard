## MODIFIED Requirements

### Requirement: Skill Installation Paths for Agents
The interactive installer SHALL place downloaded or generated skills in the correct directory structures based on the target scope selected by the user. The skill directory name MUST be prefixed with `ag-` to prevent collisions.

#### Scenario: Installing skills for Workspace scope
- **WHEN** the user selects the workspace scope during initialization
- **THEN** the system installs each selected skill into `.agents/skills/ag-<skill-name>/SKILL.md`

#### Scenario: Installing skills for Global scope
- **WHEN** the user selects the global scope during initialization
- **THEN** the system installs each selected skill into `~/.gemini/antigravity-cli/skills/ag-<skill-name>/SKILL.md`

#### Scenario: Installing skills for Shared scope
- **WHEN** the user selects the shared scope during initialization
- **THEN** the system installs each selected skill into `~/.gemini/skills/ag-<skill-name>/SKILL.md`
