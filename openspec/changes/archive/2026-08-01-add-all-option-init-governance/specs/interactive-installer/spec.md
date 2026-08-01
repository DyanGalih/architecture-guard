## ADDED Requirements

### Requirement: Governance Command Selection Prompt
The interactive installer SHALL present a prompt to the user to select which governance commands to install. This prompt MUST include an option to select all available governance commands at once, alongside the options to select individual commands.

#### Scenario: User selects the "All" option
- **WHEN** the user runs the interactive installer and reaches the governance commands selection prompt
- **AND** the user selects the "All" option
- **THEN** the system resolves the selection to include every available governance command without requiring further individual selections

#### Scenario: User selects individual options instead of "All"
- **WHEN** the user runs the interactive installer and reaches the governance commands selection prompt
- **AND** the user selects one or more specific governance commands (not "All")
- **THEN** the system resolves the selection to only include the explicitly chosen governance commands

#### Scenario: User selects "All" alongside other specific options
- **WHEN** the user runs the interactive installer and reaches the governance commands selection prompt
- **AND** the user selects both the "All" option and one or more specific governance commands
- **THEN** the system resolves the selection to include all available governance commands, treating the specific selections as redundant but safely ignored
