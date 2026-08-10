# apply-orchestrator Specification

## Purpose
Extends `ag-apply` into an orchestrator that resolves all architecture findings through a single invocation, regardless of which artifact type each finding targets. Plan/tasks findings are applied directly (preserving existing behavior), while upstream artifact findings (proposal, spec) are delegated to the SDD tool's native update capability—or handled via an AG-native inline artifact-fix fallback—with explicit user confirmation.

## ADDED Requirements

### Requirement: Finding Partitioning
`ag-apply` SHALL partition review findings by target artifact type, separating plan/tasks findings from upstream artifact findings (proposal, spec).

#### Scenario: Partitioning mixed findings
- **WHEN** `ag-apply` receives review output containing findings targeting design.md, tasks.md, spec.md, and proposal.md
- **THEN** it partitions the findings into two groups: plan/tasks findings (design.md, tasks.md) and upstream findings (spec.md, proposal.md)

#### Scenario: All findings target plan/tasks only
- **WHEN** `ag-apply` receives review output where every finding targets design.md or tasks.md
- **THEN** all findings are placed in the plan/tasks group and no upstream delegation is triggered

### Requirement: Direct Apply for Plan/Tasks
`ag-apply` SHALL apply findings targeting design.md and tasks.md directly, preserving the existing apply behavior.

#### Scenario: Applying plan/tasks findings directly
- **WHEN** `ag-apply` processes findings in the plan/tasks group
- **THEN** it applies them directly to design.md and tasks.md using the existing apply logic without delegation or additional confirmation

### Requirement: Upstream Delegation
`ag-apply` SHALL delegate upstream artifact findings to the SDD tool's native update capability when that capability is available.

#### Scenario: Delegating spec finding to SDD tool
- **WHEN** `ag-apply` processes an upstream finding targeting spec.md and the SDD tool exposes a native update capability (e.g., `openspec-update-change`)
- **THEN** it delegates the fix to the SDD tool's native update capability with the finding details

#### Scenario: Delegating proposal finding to SDD tool
- **WHEN** `ag-apply` processes an upstream finding targeting proposal.md and the SDD tool exposes a native update capability
- **THEN** it delegates the fix to the SDD tool's native update capability with the finding details

### Requirement: Fallback AG-Native Fix
When the SDD tool lacks a native update capability, `ag-apply` SHALL run an inline AG-native artifact-fix with the same confirmation UX as the delegation path.

#### Scenario: SDD tool lacks native update capability
- **WHEN** `ag-apply` processes an upstream finding and the configured SDD tool does not expose a native update capability
- **THEN** it runs an inline AG-native artifact-fix against the target artifact

#### Scenario: Fallback uses same confirmation UX
- **WHEN** the AG-native fallback path is triggered
- **THEN** the user is presented with the same grouped summary table and confirmation prompt as the delegation path

### Requirement: User Confirmation
Before delegating upstream fixes, `ag-apply` SHALL present a grouped summary table of upstream findings and ask for a single confirmation from the user.

#### Scenario: User confirms upstream fixes
- **WHEN** `ag-apply` has upstream findings ready for delegation
- **THEN** it presents a grouped summary table (organized by target artifact) and waits for a single user confirmation before proceeding

#### Scenario: User declines upstream fixes
- **WHEN** the user declines the confirmation prompt
- **THEN** `ag-apply` skips all upstream delegations, reports the skipped findings in the output, and exits without modifying upstream artifacts

### Requirement: Authoritative-First Multi-Artifact Fix
For findings spanning multiple artifacts, `ag-apply` SHALL fix the authoritative artifact first following the hierarchy spec > plan > tasks, then propagate changes downstream for coherence.

#### Scenario: Findings span spec and plan
- **WHEN** findings target both spec.md and design.md
- **THEN** `ag-apply` fixes spec.md first, then propagates the fix downstream to design.md to maintain coherence

#### Scenario: Findings span spec, plan, and tasks
- **WHEN** findings target spec.md, design.md, and tasks.md
- **THEN** `ag-apply` fixes spec.md first, then design.md, then tasks.md in authoritative order

### Requirement: Unified Output
`ag-apply` SHALL report all results—both direct applies and delegated fixes—in a single unified output at the end of the invocation.

#### Scenario: Mixed direct and delegated results
- **WHEN** `ag-apply` completes processing with both plan/tasks direct applies and upstream delegated fixes
- **THEN** it produces a single output report listing all findings, their resolution method (direct or delegated), and their outcome (applied, skipped, or failed)

#### Scenario: Output includes skipped findings
- **WHEN** the user declined upstream delegation during the confirmation step
- **THEN** the unified output marks those findings as "skipped" with the reason
