## MODIFIED Requirements

### Requirement: Unified CLI definition
The CLI program definition SHALL dynamically use the version from package.json rather than hard-coding it, to ensure accuracy across releases.

#### Scenario: Displaying the correct version
- **WHEN** user runs `architecture-guard --version`
- **THEN** the output matches the current package.json version exactly
