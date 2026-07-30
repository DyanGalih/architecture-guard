# Framework Detection

## ADDED Requirements

### Requirement: Detect active SDD framework from project root markers
The system SHALL detect which SDD framework is active by scanning the project root directory for known framework markers. Detection occurs at the start of every orchestration command before any framework-specific logic runs.

#### Scenario: SpecKit project detected
- **WHEN** the project root contains a `.specify/` directory
- **THEN** the system selects the SpecKit adapter and uses `.specify/` paths for all artifact operations

#### Scenario: OpenSpec project detected
- **WHEN** the project root contains an `openspec/` directory and a `config.yaml` inside it
- **THEN** the system selects the OpenSpec adapter and uses `openspec/` paths for all artifact operations

#### Scenario: Both frameworks detected
- **WHEN** both `.specify/` and `openspec/` directories exist in the project root
- **THEN** the system asks the user which one to use; a persisted or session selection cannot silently suppress this prompt

#### Scenario: No framework detected
- **WHEN** neither `.specify/` nor `openspec/` markers are found
- **THEN** the system asks the user which SDD framework they intend to use and proceeds to initialize or degrade gracefully

#### Scenario: Custom adapter requested
- **WHEN** the user explicitly specifies an adapter name (e.g., `--adapter openspec`)
- **THEN** the system uses the specified adapter regardless of detected framework markers

### Requirement: Adapter selection is marker-aware within session
The system MAY reuse an adapter within the AI session, but SHALL re-check filesystem markers before every command. Persisted selections and installer defaults SHALL never outrank current markers.

#### Scenario: Adapter reused across commands
- **WHEN** the user runs `architecture-guard init` (which detects OpenSpec) followed by `architecture-guard spec`
- **THEN** the system reuses it only after re-scanning markers and confirming that the marker state still agrees

#### Scenario: Adapter override mid-session
- **WHEN** the user explicitly requests a different adapter mid-session
- **THEN** the system switches adapters and the new selection applies to all subsequent commands in that session

### Requirement: Degrade gracefully when detection fails
The system SHALL not block governance operations when detection is ambiguous or impossible. Core governance rules, ponytail contract, and hygiene checks run regardless of framework state.

#### Scenario: Spec artifacts exist but no config marker found
- **WHEN** project has `specs/` or `changes/` directories but no `.specify/` or `openspec/`
- **THEN** the system asks the user which framework to adapt, or proceeds in framework-agnostic mode if user declines

#### Scenario: Read-only governance operations require no framework
- **WHEN** running architecture-review or violation-detection commands
- **THEN** the system reads artifact files directly by path, ignoring the framework detection layer entirely
