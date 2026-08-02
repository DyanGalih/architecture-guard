## Why

When Architecture Guard is used alongside other tools, especially as an extension to Spec-kit, there's a risk of skill name conflicts. For instance, a generic skill name like `init` could collide with another tool's `init` command. To prevent this, all Architecture Guard skills should be prefixed with `ag-` (e.g., `ag-init`), ensuring safe coexistence in any environment.

## What Changes

- Update the generated skill names to include the `ag-` prefix.
- Ensure the `init` skill becomes `ag-init`.
- Update any skill installation or generation scripts to consistently apply this prefix.
- Ensure the prefix logic is generalized so it applies correctly even when Architecture Guard is used as a Spec-kit extension.
- **BREAKING**: Users who previously relied on the un-prefixed skill names (like `/init`) will now need to use the prefixed versions (like `/ag-init`).

## Capabilities

### New Capabilities
- `skill-prefix`: Enforces the `ag-` prefix on all generated skills to prevent naming collisions.

### Modified Capabilities
- `interactive-installer`: Modify the installer to generate prefixed skill directories and documentation.

## Impact

- All generated skills in the `.agent/skills`, `.codex/skills`, and `.opencode/skills` directories will have the `ag-` prefix.
- Users and agents will invoke skills using `/ag-*` instead of the raw names.
- The `src/commands` or `src/templates` where skill scaffolding is defined will need to be updated.
