## Why

The project currently relies on a mix of Bash scripts, PowerShell scripts, and an `install.js` script for various functionalities. This creates fragmentation, cross-platform compatibility issues, and maintenance overhead. By rewriting these into a unified TypeScript application, we establish a single source of truth for all CLI commands and installation logic, improving maintainability, cross-platform consistency, and developer experience.

## What Changes

- **BREAKING**: Remove all existing standalone Bash (`.sh`) and PowerShell (`.ps1`) scripts.
- **BREAKING**: Remove the standalone `install.js` script.
- Introduce a new unified TypeScript application to handle installation and all script functions.
- Consolidate CLI routing to route all former script functions through this new TS application.
- Ensure the new TS application can be compiled or run easily across platforms without relying on OS-specific shell interpreters.

## Capabilities

### New Capabilities
- `unified-cli`: A consolidated TypeScript CLI application that houses all previous shell script functionalities and installation logic in a single executable/entrypoint.

### Modified Capabilities
- `installer`: The installation process is migrated from `install.js` to the new unified TypeScript application.

## Impact

- **Code**: Removal of `scripts/` containing shell scripts, removal of `install.js`. Introduction of a new TS application entrypoint.
- **Developer Workflow**: Developers and users will use a single CLI command instead of invoking separate OS-specific scripts.
- **Dependencies**: May require additional TypeScript CLI scaffolding libraries (e.g., `commander`, `yargs`) if not already present.
- **Systems**: Any CI/CD pipelines or external tools calling the old scripts will need to be updated to call the new CLI application.
