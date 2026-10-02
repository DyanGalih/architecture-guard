# SDD Flow Template

This document defines the Spec-Driven Development (SDD) flow for projects using the Generic adapter.
When this file is customized, Architecture Guard skills (`ag-governed-spec`, `ag-governed-plan`, `ag-governed-tasks`, `ag-governed-implement`, `ag-verify`) adjust their behavior to align with the declared conventions.

## 1. Artifact Layout

Defines where and how planning, specification, and implementation tracking artifacts are structured.

```
changes/{change}/
├── spec.md              # Requirements and observable behavior contracts
├── plan.md              # Technical design, boundary interactions, and architectural choices
└── tasks.md             # Execution task list with verification checkpoints
```

- **Change Directory**: `changes/{change}/`
- **Spec Path**: `changes/{change}/spec.md`
- **Plan Path**: `changes/{change}/plan.md`
- **Tasks Path**: `changes/{change}/tasks.md`
- **Security Constraints**: `changes/{change}/security-constraints.md` (optional)
- **Archive Destination**: `changes/archive/{YYYY-MM-DD}-{change}/`

*Customization Note*: To consolidate all phases into a single document (e.g. `changes/{change}/sdd.md`), update the paths above and configure the single-file layout section below.

## 2. Workflow Lifecycle Steps

The SDD lifecycle follows these sequential phases:

1. **Discovery (`ag-governed-discover`)**:
   - Align on user goals, boundary impacts, and architectural constraints.
   - Output: Discovery Summary Draft.
2. **Specification (`ag-governed-spec`)**:
   - Establish formal behavior contracts with normative requirements (`SHALL`/`MUST`) and verifiable scenarios (`WHEN`/`THEN`).
   - Template: Resolves bundled `generic_spec` (`architecture-guard resolve template generic_spec`) unless overridden locally.
   - Target: `changes/{change}/spec.md`.
3. **Planning & Design (`ag-governed-plan`)**:
   - Decompose architecture layers, data contracts, and verification plans.
   - Enforce Ponytail Core minimalism (YAGNI, stdlib-first, minimal abstractions).
   - Template: Resolves bundled `generic_plan` (`architecture-guard resolve template generic_plan`) unless overridden locally.
   - Target: `changes/{change}/plan.md`.
4. **Task Decomposition (`ag-governed-tasks`)**:
   - Break technical design into sequential, test-backed execution items.
   - Template: Resolves bundled `generic_tasks` (`architecture-guard resolve template generic_tasks`) unless overridden locally.
   - Target: `changes/{change}/tasks.md`.
5. **Implementation (`ag-governed-implement`)**:
   - Execute unchecked tasks sequentially.
   - Enforce the Verification Floor (runnable automated tests for all non-trivial logic).
   - Maintain repository hygiene (zero leftover scratch/temporary files).
6. **Verification (`ag-verify`)**:
   - Confirm code evidence satisfies acceptance criteria across all tasks and specifications.
7. **Archival (`ag-governed-archive` or `architecture-guard archive`)**:
   - Move completed `changes/{change}/` to date-stamped archive directory.

## 3. Required Artifact Sections

### `spec.md`
- `## Purpose`: Summary of feature intent and user outcome.
- `## Requirements`: Normative statements (`### Requirement: <Name>`).
- `## Scenarios`: Concrete validation cases (`#### Scenario: <Name>` with `WHEN`/`THEN`).

### `plan.md`
- `## System Boundaries & Affected Components`: Components and contracts touched.
- `## Architecture Decisions`: Choices made and trade-offs considered.
- `## Data Contracts & Interfaces`: Schemas and payload models.
- `## Verification Strategy`: Automated test and validation mechanisms.

### `tasks.md`
- `## Tasks`: Checklist items (`- [ ] Task description`).
- Every task must declare acceptance criteria and targeted unit/integration checks.

## 4. Customization Guide

### Combining Spec, Plan, and Tasks into a Single File
If your team prefers a single consolidated design file rather than separate documents:
1. Set artifact path for spec, plan, and tasks to `changes/{change}/sdd.md`.
2. Structure `changes/{change}/sdd.md` with top-level sections:
   - `# SDD: {feature-name}`
   - `## 1. Specification & Requirements`
   - `## 2. Technical Design & Architecture`
   - `## 3. Implementation Tasks`
3. Skills referencing this flow template will locate all context within `changes/{change}/sdd.md`.

### Changing the Directory Structure
If you want specifications under `specs/{feature}` instead of `changes/{change}`:
1. Update section 1 to point to `specs/{change}/spec.md`.
2. Update the archive directory accordingly.
