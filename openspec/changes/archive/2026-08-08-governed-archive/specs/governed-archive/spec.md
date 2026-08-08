## Purpose

Orchestrates the finalization and archival of a feature across any supported SDD framework, along with automated release notes, git operations, and memory extraction.

## ADDED Requirements

### Requirement: SDD Framework Archival Execution
The `governed-archive` command SHALL orchestrate the finalization of the current change based on the active SDD framework.

#### Scenario: Archiving with OpenSpec
- **WHEN** the active framework is OpenSpec
- **THEN** it triggers `openspec archive` to sync delta specs and move the change directory to the archive.

#### Scenario: Archiving with SpecKit
- **WHEN** the active framework is SpecKit
- **THEN** it triggers final architectural verification and runs `consolidate-specs` to generate a fallback index.

### Requirement: Automated Changelog Update
The command SHALL parse the archived feature's purpose and requirements to automatically append an entry to the project's changelog.

#### Scenario: Generating Release Notes
- **WHEN** the archival is successful
- **THEN** it appends a formatted release note summarizing the feature to `CHANGELOG.md` or `RELEASE_NOTES.md`.

### Requirement: Interactive Git Orchestration
The command SHALL provide an interactive prompt to execute final Git operations, automatically generating commit messages and PR descriptions from SDD artifacts.

#### Scenario: Committing and Creating a PR
- **WHEN** the user selects "Commit, Push, and Create PR"
- **THEN** it generates a semantic commit message, pushes the branch, and creates a PR with a description populated from `proposal.md`.

### Requirement: Optional Memory Extraction
The command SHALL attempt to extract architectural decisions and lessons learned into `flash-mem` if the MCP server is available.

#### Scenario: Flash-Mem is Available
- **WHEN** the `flash-mem` MCP server is accessible
- **THEN** it extracts key decisions from `design.md` and records them as durable memory.

#### Scenario: Flash-Mem is Unavailable
- **WHEN** the `flash-mem` MCP server is not accessible
- **THEN** it gracefully skips the memory extraction step without throwing an error.

### Requirement: Workspace Cleanup
The command SHALL offer to clean up the local workspace after a successful archive and push.

#### Scenario: User accepts cleanup
- **WHEN** the user accepts the workspace cleanup prompt
- **THEN** it checks out the `main` branch and deletes the local feature branch.
