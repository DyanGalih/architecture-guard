# Deprecated and Obsolete Code Governance Specification

## ADDED Requirements

### Requirement: Deprecated & Dangerous Code Hygiene Rule
Architecture Guard MUST provide a dedicated hygiene rule (`src/hygiene-rules/deprecated-and-dangerous-code.md` and `.architecture-guard/hygiene-rules/deprecated-and-dangerous-code.md`) with default **Critical / Blocking** severity that logs obsolete, deprecated, and dangerous code patterns organized by language and framework.

#### Scenario: Evaluating code against deprecated pattern catalog
- **GIVEN** code containing deprecated language functions (e.g. PHP deprecated syntax, dangerous eval/unserialize) or obsolete framework idioms (e.g. unmanaged Angular subscriptions, legacy lifecycle methods)
- **WHEN** Architecture Guard performs verification (`ag-verify`) or pre-implementation self-checks (`ag-governed-implement`)
- **THEN** it flags the pattern as a Critical blocking hygiene violation and provides the approved modern replacement.

### Requirement: Pre-Implementation Deprecation Reference Check
The planning, task generation, and implementation workflows MUST reference the deprecated code catalog prior to and during code execution.

#### Scenario: Running governed implementation (`ag-governed-implement`)
- **GIVEN** an active task to implement in `tasks.md`
- **WHEN** the agent or developer begins implementation
- **THEN** it MUST check the target files against the active language/framework section of `deprecated-and-dangerous-code.md` before generating or modifying code.

### Requirement: Documentation and Verification Updates
Architecture Guard documentation (`docs/repository-hygiene.md`) MUST document the new rule, its schema per entry, and its integration in the SDD lifecycle.

#### Scenario: Discovering repository hygiene rules
- **GIVEN** a developer inspecting Architecture Guard hygiene rules
- **WHEN** reviewing available rules
- **THEN** `deprecated-and-dangerous-code` is listed with Critical severity and usage instructions.
