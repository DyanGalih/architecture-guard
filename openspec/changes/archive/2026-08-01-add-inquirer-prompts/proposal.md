## Why

The current `architecture-guard` installer uses Node's native `readline` module for interactive prompts, which only supports basic text input (typing numbers). Users expect a modern, rich CLI experience with arrow-key navigation, spacebar toggling, and search filtering (similar to `openspec init`). The `"stdlib only"` constraint has been lifted from the `config.yaml`, enabling the introduction of a robust interactive prompt library.

## What Changes

- Add `@inquirer/prompts` as a dependency in `src/package.json`
- Refactor the interactive prompt utility in `src/install.js` to use `inquirer` instead of `readline`
- Implement search/filtering for the AI Agent selection list
- Keep the non-interactive `--yes` flags functioning identically for automated orchestration

## Capabilities

### New Capabilities

- `interactive-prompts`: Implement rich terminal UI components for CLI installation menus.

### Modified Capabilities

- `cli-command-routing`: The interactive mode of the `init` command now utilizes richer terminal rendering.

## Impact

- Adds `node_modules` dependency footprint to the previously zero-dependency `architecture-guard` package.
- Modifies `src/package.json` to declare dependencies.
- Changes the standard output format during interactive installation, impacting any tooling that attempts to scrape the interactive TTY output instead of using `--yes`.
