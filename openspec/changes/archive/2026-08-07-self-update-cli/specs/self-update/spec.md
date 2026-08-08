## Purpose
Provides a mechanism for the `architecture-guard` CLI to check the npm registry and update itself to the latest version automatically.

## ADDED Requirements

### Requirement: CLI Self-Update Command
The CLI SHALL provide a command to trigger a self-update process.

#### Scenario: User runs the update command
- **WHEN** the user executes `architecture-guard update` or `architecture-guard self-update`
- **THEN** the system checks for a newer version on npm
- **THEN** the system installs the new version if available, or reports that the CLI is already up to date

### Requirement: Version Checking
The CLI SHALL check the npm registry for the latest version tag of the `architecture-guard` package.

#### Scenario: A newer version exists
- **WHEN** the npm registry reports a version strictly greater than the current version
- **THEN** the CLI downloads and installs the newer version

#### Scenario: Already at the latest version
- **WHEN** the npm registry reports the same version as the current version
- **THEN** the CLI outputs a message stating that the current version is up to date
