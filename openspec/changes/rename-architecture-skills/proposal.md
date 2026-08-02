## Why

The current naming convention for Architecture Guard skills is redundant and overly verbose (e.g., `ag-architecture-review`). Since the `ag-` prefix already stands for "Architecture Guard", including `architecture-` as an infix creates unnecessarily long and repetitive command names. Removing this infix reduces ambiguity and significantly improves the usability and typing experience for developers.

## What Changes

- **BREAKING**: Rename all skill identifiers, directories, templates, and installation outputs from the `ag-architecture-*` format to the cleaner `ag-*` format (e.g., `ag-architecture-review` becomes `ag-review`).
- Update the `src/install.js` script to generate skills using the new, shorter names.
- Update any internal templates, presets, and documentation (e.g., `AGENTS.md`) that reference the old skill names.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `skill-naming`: The naming convention for generated skills is updated to remove the redundant infix.

## Impact

- **Affected code:** `src/install.js`, `src/templates/`, `AGENTS.md`, and any test assertions checking for specific skill names (like `src/install.test.js`).
- **Impacted Systems:** Users will need to use the new shorter names when invoking the Architecture Guard skills via their AI agents. Existing CI/CD or workflow scripts hardcoding the old names will break and require an update.
