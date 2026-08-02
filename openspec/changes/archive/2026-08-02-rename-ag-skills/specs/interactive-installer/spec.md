## MODIFIED Requirements

### Requirement: Skill Installation Paths for Agents
The interactive installer SHALL place downloaded or generated skills in the correct directory structures based on the target AI agent selected by the user. The skill directory name MUST be prefixed with `ag-` to prevent collisions.

#### Scenario: Installing skills for Antigravity
- **WHEN** the user selects the `antigravity` agent during initialization
- **THEN** the system installs each selected skill into `.agent/skills/ag-<skill-name>/SKILL.md`

#### Scenario: Installing skills for Codex
- **WHEN** the user selects the `codex` agent during initialization
- **THEN** the system installs each selected skill into `.codex/skills/ag-<skill-name>/SKILL.md`
