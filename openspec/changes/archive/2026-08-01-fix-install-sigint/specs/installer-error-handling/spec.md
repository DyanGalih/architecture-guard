## ADDED Requirements

### Requirement: Graceful exit on SIGINT
The system SHALL gracefully terminate without printing a stack trace when a user presses `Ctrl+C` during an interactive prompt.

#### Scenario: User cancels installation
- **WHEN** the user is prompted for input and presses `Ctrl+C`
- **THEN** the system prints a cancellation message and exits with status code 0 or 1 without an unhandled promise rejection or stack trace.
