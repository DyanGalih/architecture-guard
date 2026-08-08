## Purpose
Provides the ability for the `architecture-guard detect-changed-files` command to output results in JSON format for programmatic consumption.

## ADDED Requirements

### Requirement: JSON Output Support
The `detect-changed-files` command SHALL support a `--json` flag to output results in JSON format.

#### Scenario: Running with the --json flag
- **WHEN** the user executes `architecture-guard detect-changed-files --json`
- **THEN** the command outputs the list of changed files in a valid JSON array format, and does not produce unstructured text output.
