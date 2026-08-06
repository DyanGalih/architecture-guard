## Context

The `architecture-guard` project currently utilizes multiple Bash and PowerShell scripts along with an `install.js` script to manage installation and other utility functions. This creates fragmentation. See `proposal.md` for the motivation to unify these into a single TypeScript application. The goal is to build a CLI that executes natively across OS platforms via Node.js.

## Goals / Non-Goals

**Goals:**
- Replace all functionality in `scripts/` (Bash/PS1) with TypeScript functions.
- Replace `install.js` with a dedicated installation command within the new CLI.
- Provide a single executable entrypoint (e.g., `bin/architecture-guard.js`) for all commands.
- Ensure cross-platform compatibility (Windows, macOS, Linux) without relying on native shells.

**Non-Goals:**
- We are not changing the core business logic of the architecture guard orchestration, only how it is invoked and installed.
- We are not dropping support for any currently supported SDD framework.

## Decisions

- **CLI Framework**: We will use a standard Node.js CLI framework like `commander` (or similar, depending on what is already in `package.json`) to parse arguments and route to the appropriate command handlers. 
  - *Alternative*: Writing a custom arg parser. *Rationale*: A framework provides better help menus, argument validation, and routing out of the box.
- **Entrypoint**: A new file `src/bin/cli.ts` (or similar) will serve as the main entrypoint. It will import command handlers from `src/commands/`.
- **Installation Logic**: The logic currently in `install.js` will be moved to `src/commands/install.ts` and executed via `architecture-guard install`.

## Risks / Trade-offs

- **Risk**: External tools or CI pipelines may be hardcoded to call the old `.sh` or `.ps1` scripts. 
  - *Mitigation*: Clearly document the breaking changes in the release notes. For critical scripts, we could temporarily leave a wrapper script that echoes a deprecation warning and forwards to the new CLI, though the proposal specifies removing them.
- **Risk**: Node.js environment issues on Windows. 
  - *Mitigation*: Ensure the `package.json` `bin` field is properly configured so npm generates the correct `.cmd` and shell wrappers automatically upon installation.
