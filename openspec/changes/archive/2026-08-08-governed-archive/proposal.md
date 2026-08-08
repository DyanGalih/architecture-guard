## Why

Currently, SDD frameworks like OpenSpec and SpecKit handle the end-of-feature lifecycle differently (OpenSpec syncs deltas, SpecKit edits in place). We need a unified orchestration command in Architecture Guard that finalizes a feature smoothly across all supported frameworks. It will synchronize specs, update lightweight context indexes (like `consolidate-specs`), and add massive quality-of-life automation like auto-changelog, smart git operations (commit/push/PR), memory extraction, and workspace cleanup.

## What Changes

- Create a new orchestration command: `governed-archive`.
- For OpenSpec adapters, this will trigger the native archive/sync flow.
- For SpecKit adapters, this will trigger final verification and `consolidate-specs`.
- Add interactive Git orchestration to auto-generate commit messages and PR descriptions based on the feature's specs and proposal.
- Add an automatic changelog updater.
- Add an optional step to extract feature lessons/decisions into `flash-mem` MCP if available.
- Add an optional cleanup step to checkout main and delete the local feature branch.

## Capabilities

### New Capabilities
- `governed-archive`: Orchestrates the finalization and archival of a feature across any supported SDD framework, along with automated release notes, git operations, and memory extraction.

### Modified Capabilities

## Impact

- Adds a new markdown command script in `src/orchestration/governed-archive.md`.
- Does not break existing commands. Provides a natural successor to `governed-delivery` or `governed-implement`.
