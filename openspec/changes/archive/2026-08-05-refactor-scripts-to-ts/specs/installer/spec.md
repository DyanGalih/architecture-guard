## MODIFIED Requirements

### Requirement: Correct Installation Path for Antigravity Skills
The unified TS CLI installer SHALL place project-specific skills in `.agent/skills/` instead of `.agents/skills/`.

#### Scenario: Installing Antigravity Skills
- **WHEN** the unified CLI installation process copies or generates skill files for Antigravity integration
- **THEN** the files must be written to `.agent/skills/` so they are correctly discovered by the Antigravity CLI.

## ADDED Requirements

### Requirement: Execution via Unified CLI
The installation capabilities SHALL be exposed as commands within the unified TypeScript CLI rather than executed via a standalone `install.js` script.

#### Scenario: Running the installer
- **WHEN** a user intends to install the architecture guard
- **THEN** they execute the installation command through the unified CLI application
