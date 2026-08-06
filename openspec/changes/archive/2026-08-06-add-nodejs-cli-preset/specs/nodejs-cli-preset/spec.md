## Purpose
Provides an architecture guard preset specifically tailored for Node.js CLI applications, enforcing correct boundaries and preventing common anti-patterns like spaghetti commands.

## ADDED Requirements

### Requirement: Node.js CLI Entry Boundary Detection
The system MUST map generic Entry Boundaries to Node.js CLI primitives like `bin/cli.js`, `src/index.ts`, or command parsers.

#### Scenario: Detecting CLI Entry
- **WHEN** the preset is active on a Node.js CLI project
- **THEN** it correctly identifies the entry boundary

### Requirement: Prevent Fat Command Handlers
The system MUST detect and flag when a command file directly orchestrates complex business logic, file system access, or network requests instead of delegating to a core service.

#### Scenario: Flagging spaghetti commands
- **WHEN** a command handler contains database queries or complex domain logic
- **THEN** it is flagged as a Fat Command Handler anti-pattern

### Requirement: Prevent Scattered Process Exit
The system MUST detect and flag when `process.exit()` is called deep inside core logic or services rather than at the highest command level.

#### Scenario: Flagging premature exit
- **WHEN** `process.exit()` is used in a service or domain module
- **THEN** it is flagged as a scattered exit violation

### Requirement: Prevent Hardcoded UI in Core
The system MUST detect and flag when Terminal UI tools like `console.log`, `chalk`, or `ora` are used inside core domain logic instead of in the presentation/command layer.

#### Scenario: Flagging TUI in core logic
- **WHEN** a core domain function directly uses `console.log` or `chalk`
- **THEN** it is flagged as a Hardcoded UI violation
