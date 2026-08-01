# Installer

## ADDED Requirements

### Requirement: Standalone CLI installer for all AI agents
The system SHALL provide a standalone Node.js installer (`install.js`) that writes governance command files into the target project's chosen AI agent directories.

#### Scenario: Installer asks to pick AI agent type
- **WHEN** user runs `node install.js` in the project root
- **THEN** the installer displays a multi-select list of 35+ AI agents and the user picks one or more

#### Scenario: Installer asks to pick SDD framework
- **WHEN** user picks AI agent types
- **THEN** the installer asks which SDD framework to target (SpecKit, OpenSpec, or none/generic)

#### Scenario: Installer writes markdown commands
- **WHEN** user picks OpenCode and OpenSpec
- **THEN** the installer writes `.md` command files into `.opencode/commands/` with OpenSpec adapter pre-configured

#### Scenario: Installer writes SKILL.md commands
- **WHEN** user picks Claude Code
- **THEN** the installer writes `SKILL.md` files into `.claude/skills/architecture-guard-*/` directories

#### Scenario: Installer supports TOML format agents
- **WHEN** user picks Gemini CLI
- **THEN** the installer writes `.toml` command files into `.gemini/commands/`

#### Scenario: Installer writes YAML format recipes
- **WHEN** user picks Goose
- **THEN** the installer writes `.yaml` recipe files into `.goose/recipes/`

### Requirement: Installer uses Node.js stdlib only
The installer SHALL depend only on Node.js standard library (`fs`, `path`). No external dependencies.

#### Scenario: No npm install required
- **WHEN** user clones or downloads architecture-guard
- **THEN** `node install.js` works immediately on any Node.js 18+ installation

### Requirement: Installer supports targeted command selection
The installer SHALL let the relieved user pick which governance commands to install (not all 15 at once).

#### Scenario: Installing only review commands
- **WHEN** user wants only architecture review and violation detection
- **THEN** the installer allows selecting individual commands and writes only those

### Requirement: Installer preserves existing files
The installer SHALL not overwrite existing command files without asking.

#### Scenario: Command file already exists
- **WHEN** the target command file path already exists
- **THEN** the installer asks user whether to skip, replace, or keep both

### Requirement: Installer includes all 15 governance commands
The installer SHALL ship with all 15 Architecture Guard commands available user selection: init, init-brownfield, governed-discover, governed-spec, governed-plan, governed-tasks, governed-delivery, governed-implement, architecture-review, architecture-verify, architecture-apply, architecture-workflow, violation-detection, refactor-generator, consolidate-specs.

#### Scenario: All governance commands are selectable
- **WHEN** the installer displays governance command choices
- **THEN** all 15 named commands are available for individual selection

### Requirement: AGENTS.md integration
After installation, the installer SHALL offer to append Architecture Guard governance rules to the project's `AGENTS.md` file.

#### Scenario: AGENTS.md already exists
- **WHEN** `AGENTS.md` exists in project root
- **THEN** the installer appends a section referencing architecture guard rules requiring the AI agent apply guard contract during all SDD workflow phases
