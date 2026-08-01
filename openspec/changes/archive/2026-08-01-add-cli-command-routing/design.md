## Context

The `architecture-guard` installer is a single file script (`src/install.js`) that runs interactively on start. Users expect a typical CLI experience where they can query the version or invoke specific actions like `init`. Currently, any unrecognized argument, including `--version`, triggers the fallback installer mode, which can be confusing. We need to introduce basic native CLI routing for flags and subcommands without adding external dependencies.

## Goals / Non-Goals

**Goals:**
- Provide native subcommand and flag routing in `install.js`.
- Make `--version` (or `-v`) short-circuit and output the current version from `package.json`.
- Enforce `init` as an explicit subcommand for the installer workflow.

**Non-Goals:**
- Using an external CLI framework (like `commander` or `yargs`).
- Changing the existing CLI configuration file structure or logic.
- Splitting `install.js` into multiple files (we keep it single-source to maintain the current pattern).

## Decisions

- **Routing in `main()`**: We will update the `main` function to check for standalone flags (`opts.version` and `opts.help`) early, executing them and returning if matched. Then, we look at the first non-flag positional argument (`opts.values[0]`) to determine the command.
- **`parseArgs()` Updates**: The existing argument parser will be enhanced to explicitly catch `-v` and `--version` and set `opts.version = true`.
- **Command Dispatching**: The existing installation prompt logic will be moved into a helper function `runInit(target, opts)` inside `install.js`, which `main()` invokes when the command is `init`. 
- **Error Handling**: If an explicitly unknown command is provided (e.g. `architecture-guard build`), the CLI will log an error and show the help text, preventing accidental prompt triggers. However, if *no* command is provided, it will default to `init` to preserve backward compatibility.

## Risks / Trade-offs

- **Risk: Breaking backwards compatibility for AI orchestrators (like `spec-kit` extensions) running `architecture-guard` with no arguments.**
  - **Mitigation:** If `opts.values[0]` is undefined, the routing logic will default to `init`. This allows existing integrations (such as `architecture-guard --yes --agent opencode`) to continue functioning exactly as before without modification.
