## Why
We currently have two maintenance issues causing friction for users and maintainers:
1. `specify extension add` throws warnings because our commands don't follow the required `speckit.{extension_id}.{command}` pattern. The tool forcefully renames them to include our extension ID (`architecture-guard`), so we should align our manifest and hooks to match reality.
2. The unified CLI (`src/bin/cli.ts`) hard-codes its version, requiring manual updates for every release.

## What Changes
- Rename all commands and hooks in `extension.yml` to use the `speckit.architecture-guard.*` prefix format.
- Update `src/bin/cli.ts` to dynamically load its version from `package.json` at runtime instead of hard-coding it.

## Capabilities
### New Capabilities
- `dynamic-cli-version`: Implement dynamic package.json version parsing in the CLI entry point.

### Modified Capabilities
- `unified-cli`: Modify the CLI spec to require dynamic versioning instead of a hardcoded string.
- `extension-manifest`: Update manifest standards to require the strict `speckit.{extension_id}.{command}` naming convention.

## Impact
- `src/extension.yml` and any install scripts referencing command names.
- `src/bin/cli.ts`
