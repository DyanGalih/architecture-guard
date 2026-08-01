## Why

The current `architecture-guard` CLI (powered by `install.js`) processes all arguments and falls through to the interactive installer prompt. This prevents standard CLI behaviors like running `architecture-guard --version` without triggering the full installation. Adding CLI command routing allows us to support flags (like `--version`) and explicit subcommands (like `init`) gracefully without heavy external dependencies.

## What Changes

- Update `parseArgs` in `src/install.js` to recognize `-v` and `--version` flags.
- Update `main` in `src/install.js` to handle standalone flags (printing version and exiting).
- Enforce explicit command routing in `main` so that `architecture-guard init [target]` runs the installation flow, while unknown commands show an error and help text.

## Capabilities

### New Capabilities
- `cli-command-routing`: Native CLI flag and subcommand routing mechanism for the architecture-guard installer.

### Modified Capabilities

## Impact

- `src/install.js`: Minor refactoring to move the main installation logic into a helper function and wrap it with native routing based on the positional arguments and flags parsed.
- User experience: Users can now query the version via `--version`, and the installer behaves more like a standard CLI application.
