## Why

Users of the `architecture-guard` CLI currently have to manually run npm commands (e.g., `npm install -g architecture-guard@latest`) or download from GitHub to update to the latest version. Adding a self-update command will significantly streamline the upgrade process, making it easier for users to stay on the latest version of the tool.

## What Changes

- Add a new CLI command `update` (or `self-update`) to the `architecture-guard` CLI.
- The command will check the npm registry (`https://registry.npmjs.org/architecture-guard/latest`) for the latest version.
- If a newer version is available, it will automatically trigger the update installation.

## Capabilities

### New Capabilities
- `self-update`: Provides the ability for the architecture-guard CLI to check for updates and update itself to the latest version published on npm.

### Modified Capabilities

## Impact

- Modifies the CLI tool (the `src/` repo) to include new commands and update logic.
- Requires network access during execution to query npm and download the package.
