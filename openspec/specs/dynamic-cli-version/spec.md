# dynamic-cli-version Specification

## Purpose
The CLI dynamically reads its version from `package.json` to eliminate manual version bumps during releases.

## Requirements

### Requirement: Dynamic version resolution
The CLI SHALL read its version at runtime from the nearest `package.json` file.

#### Scenario: Successful version load
- **WHEN** the CLI is executed
- **THEN** it reads the version from the project's `package.json` file
- **THEN** it registers that version with the commander program
