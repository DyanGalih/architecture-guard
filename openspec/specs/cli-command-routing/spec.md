## ADDED Requirements

### Requirement: CLI Version Flag
The system SHALL output the current version of the installer and exit immediately without prompting when the version flag is provided.

#### Scenario: User queries the version
- **WHEN** the user runs `architecture-guard --version` or `architecture-guard -v`
- **THEN** the system prints `architecture-guard v<version>` and exits with status 0

### Requirement: CLI Help Flag
The system SHALL output usage instructions and exit immediately when the help flag is provided.

#### Scenario: User requests help
- **WHEN** the user runs `architecture-guard --help` or `architecture-guard -h`
- **THEN** the system prints the usage instructions and exits with status 0

### Requirement: Explicit Init Subcommand
The system SHALL trigger the interactive installation process when explicitly invoked with the `init` subcommand, or when no subcommand is provided (to preserve backward compatibility with existing orchestrators).

#### Scenario: User runs the init subcommand
- **WHEN** the user runs `architecture-guard init [target]`
- **THEN** the system proceeds with the interactive installer for the specified target (or current directory if none provided)

#### Scenario: User runs an unknown command
- **WHEN** the user runs `architecture-guard unknown_command`
- **THEN** the system logs an error, prints usage instructions, and exits with a non-zero status

#### Scenario: User runs with no subcommand (Backward Compatibility)
- **WHEN** the user runs `architecture-guard` or `architecture-guard --yes ...` with no positional subcommand
- **THEN** the system implicitly treats it as the `init` command and proceeds with the installer flow
