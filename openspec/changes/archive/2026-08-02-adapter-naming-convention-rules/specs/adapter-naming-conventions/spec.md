## ADDED Requirements

### Requirement: Dynamic Naming Convention Configuration
The `init` command SHALL detect or prompt for naming conventions and record them in the project constitution.

#### Scenario: User uses a framework preset with naming rules
- **WHEN** the user runs `init` and selects a framework preset (e.g., CodeIgniter) that defines naming rules (e.g., `Class_Model`)
- **THEN** the command auto-populates the naming rules without prompting and writes them to the constitution

#### Scenario: User uses a generic or incomplete preset
- **WHEN** the user runs `init` and no framework preset is used, or the preset lacks naming rules
- **THEN** the command prompts the user for their class and property naming conventions

#### Scenario: Constitution generation
- **WHEN** the `init` command finishes
- **THEN** the selected naming conventions are written into the architecture enforcement section of the active SDD tool's constitution (`config.yaml` or `architecture_constitution.md`)
