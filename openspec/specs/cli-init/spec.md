# cli-init Specification

## Purpose
TBD - created by archiving change streamline-cli-init. Update Purpose after archive.

## Requirements

### Requirement: Single SDD Tool Marker Auto-Detection
The `architecture-guard init` command MUST automatically detect and select the SDD framework when exactly one supported SDD marker exists in the workspace, bypassing the interactive framework selection prompt.

#### Scenario: Workspace has only openspec configuration
- **GIVEN** a workspace containing `openspec/config.yaml` and no `.specify/` directory
- **WHEN** running `architecture-guard init` interactively without `--framework`
- **THEN** the CLI automatically selects `openspec` without prompting for framework selection.

#### Scenario: Workspace has only Spec Kit configuration
- **GIVEN** a workspace containing `.specify/` and no `openspec/config.yaml`
- **WHEN** running `architecture-guard init` interactively without `--framework`
- **THEN** the CLI automatically selects `spec-kit` without prompting for framework selection.

#### Scenario: Ambiguous or absent markers
- **GIVEN** a workspace containing both `openspec/config.yaml` and `.specify/`, or neither
- **WHEN** running `architecture-guard init` interactively without `--framework`
- **THEN** the CLI prompts the user to select their SDD framework (`spec-kit`, `openspec`, `none`).

---

### Requirement: Default All Governance Commands
The `architecture-guard init` command MUST install all governance commands by default without presenting an interactive command selection prompt unless `--commands` is explicitly provided.

#### Scenario: Interactive install without --commands flag
- **GIVEN** a user selecting agent(s) interactively
- **WHEN** the agent selection is submitted
- **THEN** the CLI automatically installs all available governance commands without prompting for command selection.

#### Scenario: Explicit --commands flag provided
- **GIVEN** a user running `architecture-guard init --commands init,verify`
- **WHEN** the installation executes
- **THEN** the CLI installs only the specified commands (`init`, `verify`).

---

### Requirement: Automatic Overwrite Mode by Default
The `architecture-guard init` command MUST default overwrite behavior to `replace` for existing skills, commands, and `.architecture-guard/` runtime resources without prompting for confirmation dialogs.

#### Scenario: Overwriting existing installed skills interactively
- **GIVEN** a workspace where command files or `.architecture-guard/` runtime resources already exist
- **WHEN** running `architecture-guard init` without `--overwrite`
- **THEN** the CLI automatically replaces existing files with the latest versions without prompting `skip/replace/keep both`.

#### Scenario: Explicit --overwrite flag overrides default
- **GIVEN** a user running `architecture-guard init --overwrite keep-both` (or `--overwrite skip`)
- **WHEN** existing files are encountered
- **THEN** the CLI respects the explicit overwrite policy without interactive prompting.

---

### Requirement: Direct Antigravity Workspace Scoping & AGENTS.md Update
The `architecture-guard init` command MUST install Antigravity skills directly to the workspace (`.agent/skills` and `.agent/workflows`) and automatically append/update `AGENTS.md` without prompting.

#### Scenario: Installing Antigravity agent skills
- **GIVEN** the `antigravity` agent is selected without a `--target` override
- **WHEN** installation executes
- **THEN** skills are written directly to `<targetDir>/.agent/skills` and workflows to `<targetDir>/.agent/workflows` without prompting for scope.

#### Scenario: Updating AGENTS.md
- **GIVEN** installation completes for selected agents
- **WHEN** finalizing the setup
- **THEN** the CLI automatically appends or updates governance rules in `AGENTS.md` without prompting `(y/n)`.
