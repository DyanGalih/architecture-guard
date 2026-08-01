## ADDED Requirements

### Requirement: Skill Installation Paths for Agents
The interactive installer SHALL place downloaded or generated skills in the correct directory structures based on the target AI agent selected by the user.

#### Scenario: Installing skills for Antigravity
- **WHEN** the user selects the `antigravity` agent during initialization
- **THEN** the system installs each selected skill into `.agent/skills/<skill-name>/SKILL.md`

#### Scenario: Installing skills for Codex
- **WHEN** the user selects the `codex` agent during initialization
- **THEN** the system installs each selected skill into `.codex/skills/<skill-name>/SKILL.md`
