# Capability: Installer

## Purpose
TBD

## Requirements

### Requirement: Correct Installation Path for Antigravity Skills
The unified TS CLI installer SHALL place project-specific skills in `.agent/skills/` instead of `.agents/skills/`.

#### Scenario: Installing Antigravity Skills
- **WHEN** the unified TS CLI installation process copies or generates skill files for Antigravity integration
- **THEN** the files must be written to `.agent/skills/` so they are correctly discovered by the Antigravity CLI.

### Requirement: Unified TS CLI Execution
The installation process SHALL be executed via the unified TS CLI, replacing the legacy approach.

#### Scenario: Running the Installer
- **WHEN** a user initiates the installation
- **THEN** it must execute through the unified TS CLI and not use the legacy `install.js` script.
