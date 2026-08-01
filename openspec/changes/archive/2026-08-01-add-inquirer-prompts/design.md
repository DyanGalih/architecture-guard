## Context

The `architecture-guard` installer (`src/install.js`) previously relied on Node's native `readline` module. While functional and dependency-free, the user experience was spartan, requiring users to manually type comma-separated numbers to select items from large lists (e.g., 35 AI agents). Since the project has lifted the "stdlib only" constraint, we can integrate a richer interactive CLI prompt library to improve UX, particularly for multi-selection scenarios.

## Goals / Non-Goals

**Goals:**
- Replace the native `readline` prompting in `src/install.js` with `@inquirer/prompts`.
- Implement `checkbox` prompts for multi-selection (AI Agents, Commands).
- Implement `select` prompts for single-selection (Framework, Overwrite actions).
- Ensure the non-interactive `--yes` flags bypass the new inquirer prompts identically.

**Non-Goals:**
- We are NOT adopting an external argument parsing framework (like Commander or Yargs); `parseArgs` will remain custom to minimize refactor scope.
- We are NOT splitting `install.js` into multiple files.

## Decisions

- **Library Choice**: We will use `@inquirer/prompts` as it is the modern, lightweight, functional API version of Inquirer. It provides the exact arrow-key, space-to-toggle, and type-to-search functionality the user requested.
- **Handling `ask()` Migration**: The existing `ask(promptText, choices, multi)` function signature will be modified or split. Because Inquirer's `checkbox` and `select` APIs differ, we will replace calls to `ask()` with direct calls to `checkbox({ message, choices })` or `select({ message, choices })`.
- **Package.json Updates**: We will add `@inquirer/prompts` to `dependencies` in `src/package.json`.

## Risks / Trade-offs

- **Risk: Package bloat.**
  - **Trade-off**: The project is no longer zero-dependency. This increases the installation footprint slightly, but the DX improvement justifies the trade-off. We chose `@inquirer/prompts` over the legacy `inquirer` package to minimize the dependency tree.
- **Risk: TTY availability in CI.**
  - **Mitigation**: The `requireInteractiveOrYes` check will remain to ensure environments lacking a TTY are cleanly rejected with instructions to use `--yes`, preventing Inquirer from crashing or hanging in headless environments.
