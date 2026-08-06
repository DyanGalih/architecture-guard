## Why

The documentation and markdown files currently use inconsistent command prefixes, mixing `speckit` and `architecture-guard`. To improve brand consistency and developer experience, we need to unify the command references to use the shorter `ag` prefix and remove legacy `speckit` references.

## What Changes

- Scan all markdown files (`.md`) across the repository.
- Replace any references to `speckit` commands with `ag`.
- Replace instances where the full `architecture-guard` command is used with the shorter `ag` command alias for consistency.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Impact

- All documentation files (`README.md`, `docs/*.md`, etc.) will be updated to reflect the consistent `ag` command prefix.
- No application code or behavioral changes.
