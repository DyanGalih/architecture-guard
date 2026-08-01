## ADDED Requirements

### Requirement: Interactive List Selection
The system SHALL display an interactive terminal list for single and multi-selection inputs (like choosing AI Agents, SDD Frameworks, and Governance Commands) using `@inquirer/prompts`.

#### Scenario: User selects multiple agents
- **WHEN** the user runs `architecture-guard init` without the `--yes` or `--agent` flags
- **THEN** the system renders a scrollable list of available AI agents, allowing the user to navigate with arrow keys and toggle selections with the spacebar

#### Scenario: Non-interactive override
- **WHEN** the user runs `architecture-guard init --yes --agent opencode`
- **THEN** the system bypasses all interactive prompts entirely and proceeds directly to installation
