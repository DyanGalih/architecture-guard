## ADDED Requirements

### Requirement: Correct Installation Path for Antigravity Skills
The installer SHALL place project-specific skills in `.agent/skills/` instead of `.agents/skills/`.

#### Scenario: Installing Antigravity Skills
- **WHEN** the installation process copies or generates skill files for Antigravity integration
- **THEN** the files must be written to `.agent/skills/` so they are correctly discovered by the Antigravity CLI.
