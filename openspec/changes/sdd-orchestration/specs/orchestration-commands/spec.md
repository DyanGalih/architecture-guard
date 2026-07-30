# Orchestration Commands

## ADDED Requirements

### Requirement: Framework detection preamble before every command
Every orchestration command SHALL start by loading the framework detection logic and selecting an adapter before executing any governance steps.

#### Scenario: Command loads adapter first
- **WHEN** any orchestration command is invoked
- **THEN** the system first detects the active SDD framework, selects the corresponding adapter, and loads its path and command maps before executing the command body

### Requirement: Init command works across SDD frameworks
The init orchestration command SHALL interview the user about governance principles, architecture boundaries, and enforcement rules identically regardless of which SDD framework is active.

#### Scenario: Init on SpecKit project
- **WHEN** init runs with SpecKit detected
- **THEN** governance interview proceeds unchanged; output is written to constitution files under `.specify/memory/`

#### Scenario: Init on OpenSpec project
- **WHEN** init runs with OpenSpec detected
- **THEN** governance interview proceeds identically; output is written to `openspec/config.yaml` and optionally `openspec/architecture.md`

#### Scenario: Init preserves backward compat
- **WHEN** the SpecKit adapter is active
- **THEN** the legacy `commands/init.md` (unchanged) still works for users who load it directly

### Requirement: Governed discover produces framework-neutral handoff
The discover command SHALL produce a Discovery Summary Draft that uses abstract artifact names, which the adapter resolves into framework-specific references.

#### Scenario: Handoff includes framework-specific next step
- **WHEN** discover completes under OpenSpec adapter
- **THEN** the next-step recommendation says `Use 'openspec propose <name>' or continue to 'architecture-guard spec'` instead of the Speckit slash command equivalent

### Requirement: Governed spec adapts to framework spec creation flow
The spec orchestration command SHALL invoke the correct framework-native spec creation flow, with gap filling where the framework lacks a step.

#### Scenario: SpecKit spec creation
- **WHEN** governed spec runs under SpecKit
- **THEN** it calls `/speckit.specify` then `/speckit.clarify` as orchestrated steps

#### Scenario: OpenSpec spec creation
- **WHEN** governed spec runs under OpenSpec
- **THEN** it creates or reuses the named change through `openspec new change`, reads the change's spec instructions, writes the spec, and handles clarification inline

### Requirement: Governed plan adapts to framework planning
The plan orchestration command SHALL invoke framework-native plan generation, then run architecture validation and optional security review.

#### Scenario: OpenSpec design generation
- **WHEN** governed plan runs under OpenSpec
- **THEN** it generates `openspec/changes/<change>/design.md` using the `openspec instructions design` pattern, followed by architecture validation

#### Scenario: SpecKit plan generation
- **WHEN** governed plan runs under SpecKit
- **THEN** it calls `/speckit.plan` then runs security review and violation-detection as orchestrated hooks

### Requirement: Governed tasks adapts to framework task model
The tasks orchestration command SHALL generate implementation tasks compatible framework format.

#### Scenario: OpenSpec tasks generation
- **WHEN** governed tasks runs under OpenSpec
- **THEN** it generates `openspec/changes/<change>/tasks.md` following the schema's task template format

### Requirement: Implement command uses framework apply mechanism
The implement orchestration command SHALL follow the framework's apply mechanism then run architecture review.

#### Scenario: OpenSpec apply
- **WHEN** governed implement runs under OpenSpec
- **THEN** it invokes the `/openspec-apply-change` skill or inline apply flow, followed by architecture review

### Requirement: OpenSpec change-local specification path
The governed specification workflow SHALL require or create the change before creating a capability, and SHALL write the capability specification only at `openspec/changes/<change>/specs/<capability>/spec.md`.

#### Scenario: Change-local spec creation
- **WHEN** governed spec creates an OpenSpec capability
- **THEN** it creates or reuses the named change first and writes the capability spec at `openspec/changes/<change>/specs/<capability>/spec.md`

### Requirement: Unsupported adapter paths use host capability detection
Orchestration SHALL detect optional capabilities from host registrations when an adapter marks `{adapter_path:extensions}` or `{adapter_path:extensions-dir}` unsupported, and SHALL NOT read or probe those paths.

#### Scenario: Unsupported extension path
- **WHEN** the selected adapter marks an extension path unsupported
- **THEN** orchestration uses host capability detection and does not read or probe the unsupported path

### Requirement: Architecture review is framework-agnostic read-only
The architecture review command SHALL read whatever artifacts exist at their adapter-mapped paths without requiring any framework-native tool.

#### Scenario: Review reads adapter artifacts without mutation
- **WHEN** architecture review runs with resolved adapter paths
- **THEN** it reads those repository artifacts without modifying repository files or requiring a framework-native command

### Requirement: Violation detection is framework-agnostic
The violation-detection command SHALL operate on artifact files at adapter-mapped paths, detecting architecture drift invariants.

#### Scenario: Detection uses resolved artifact paths
- **WHEN** violation detection runs under either built-in adapter
- **THEN** it evaluates the resolved artifacts using the same framework-neutral drift rules

### Requirement: Refactor generator is framework-agnostic
The refactor-generator command SHALL produce refactor tasks that adapters interpret into framework-native suggestions.

#### Scenario: Refactor output remains portable
- **WHEN** a framework-neutral violation is supplied
- **THEN** the generator emits a structured refactor task whose artifact destinations are resolved by the selected adapter

### Requirement: Architecture verify maps implementation evidence
The architecture verify command SHALL cross-reference task status with code evidence regardless of framework.

#### Scenario: OpenSpec verify
- **WHEN** architecture verify runs under OpenSpec
- **THEN** it reads `tasks.md` checkboxes and validates against actual code changes, outputting verification manifest
