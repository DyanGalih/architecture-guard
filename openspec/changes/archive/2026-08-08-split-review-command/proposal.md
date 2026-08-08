## Why

The current `ag-review` command handles both pre-implementation (artifact-only) reviews and post-implementation (code-level) reviews. This overloaded responsibility creates ambiguity for users and forces complex conditional branching within the command's instructions. Splitting the command clarifies its purpose, ensures users know exactly what is being reviewed, and simplifies orchestration paths like `ag-governed-delivery`.

## What Changes

- Split the existing `ag-review` command into two distinct commands:
  - `ag-review-artifacts`: Specifically designed for the Planning Phase. Strictly validates specification and design artifacts against project constitutions and configuration.
  - `ag-review-implementation`: Specifically designed for the Implementation Phase. Analyzes codebase implementation to identify boundary leaks, DRY violations, complexity issues, and drift from the planned artifacts/constitutions.
- Remove the deprecated `ag-review` command entirely.
- Update orchestration references in `ag-governed-delivery` (and any other documentation) to call `ag-review-artifacts` and `ag-review-implementation` at their appropriate workflow gates.
- **BREAKING**: Users who previously relied on `/ag-review` directly must now choose between `/ag-review-artifacts` and `/ag-review-implementation`.

## Capabilities

### New Capabilities
- `review-artifacts`: Capability for validating planning artifacts against the constitution (extracted from the existing unified review).
- `review-implementation`: Capability for linting implemented code against planning artifacts and the constitution (extracted from the existing unified review).

### Modified Capabilities
- `unified-cli`: The unified TypeScript CLI must be updated to register and route these new commands.

## Impact

- CLI command registration (`src/bin/cli.ts` or `src/cli/*`).
- Command Markdown documents (`src/commands/*`).
- Documentation (`beginner-guide.md`, `workflows.md`, `reference-manual.md`).
- Extension manifest (`extension.yml`).
