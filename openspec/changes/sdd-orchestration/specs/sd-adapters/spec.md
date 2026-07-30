# SDD Adapters

## ADDED Requirements

### Requirement: Adapter contract defines canonical path map
Each adapter SHALL define a mapping from abstract artifact names to concrete file paths within that SDD framework's project layout.

#### Scenario: SpecKit adapter path map
- **WHEN** the SpecKit adapter is loaded
- **THEN** `constitution` maps to `.specify/memory/constitution.md`, `arch-constitution` maps to `.specify/memory/architecture_constitution.md`, `spec` maps to `specs/<feature>/spec.md`, `plan` maps to `specs/<feature>/plan.md`, `tasks` maps to `specs/<feature>/tasks.md`

#### Scenario: OpenSpec adapter path map
- **WHEN** the OpenSpec adapter is loaded
- **THEN** `constitution` maps to `openspec/config.yaml` context section, `spec` maps deterministically to `openspec/changes/<change>/specs/<capability>/spec.md`, `plan` maps to `openspec/changes/<change>/design.md`, `tasks` maps to `openspec/changes/<change>/tasks.md`

### Requirement: Adapter contract defines command map
Each adapter SHALL define a mapping from abstract governance operations to framework-native CLI invocations or direct artifact creation instructions.

Each adapter SHALL define an `architecture-apply` command token. Orchestration SHALL use that token, and the adapter's `consolidate-specs` token, instead of package-specific executable names.

#### Scenario: SpecKit command map
- **WHEN** the governance orchestrator needs to create a spec
- **THEN** the SpecKit adapter returns `/speckit.specify` with instructions to generate `specs/<feature>/spec.md`

#### Scenario: OpenSpec command map
- **WHEN** the governance orchestrator needs to create a spec
- **THEN** the OpenSpec adapter returns either `openspec instructions specs --change <name>` + inline spec creation, or `openspec propose` for the full proposal flow

### Requirement: Adapter declares framework gaps
Each adapter SHALL declare a list of governance features that the underlying SDD framework does not provide, along with suggested fill actions.

#### Scenario: OpenSpec gap declarations
- **WHEN** the OpenSpec adapter is loaded
- **THEN** it declares: branch creation is missing (fill: `git checkout -b`), specification clarification step is missing (fill: inline clarify loop), architecture verify is missing (fill: architecture-guard verify command)

#### Scenario: SpecKit gap declarations
- **WHEN** the SpecKit adapter is loaded
- **THEN** it declares: architecture verification is missing (fill: architecture-guard verify command), DRY duplication detection is missing (fill: violation-detection command)

### Requirement: Adapter files are self-contained markdown
Each adapter file SHALL be a single markdown document that lists path maps in tables, command maps in bullet form, and gaps as numbered items. No code execution is needed from the adapter — the AI agent interprets it directly.

#### Scenario: Adapter file format
- **WHEN** reading `adapters/openspec.md`
- **THEN** the file contains sections: `## Path Map`, `## Command Map`, `## Constitution Layout`, `## Gap Fill Actions`, `## Hook Events`

### Requirement: Framework-specific constitution adaptation
The init command SHALL produce different output formats depending on the active adapter while asking the same governance questions.

#### Scenario: SpecKit init output
- **WHEN** init runs under SpecKit adapter
- **THEN** output files are `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md`

#### Scenario: OpenSpec init output
- **WHEN** init runs under OpenSpec adapter
- **THEN** output updates `openspec/config.yaml` context and rules sections, with separate `openspec/architecture.md` and `openspec/security.md` if the user prefers split files
