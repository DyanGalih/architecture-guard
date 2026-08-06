## Context

Our existing architecture presets evaluate applications based on web boundaries (HTTP requests, routers, models). See `proposal.md` for motivation. For CLI applications, the boundaries differ significantly. The `architecture-guard` CLI must correctly map these generic concepts into CLI specifics in order to review and lint Node.js CLIs against their architecture constraints.

## Goals / Non-Goals

**Goals:**
- Provide a robust mapping between generic architecture layers and CLI primitives (Commander/Yargs to routes, chalk/ora to presentation, etc.).
- Clearly define rules against fat command handlers and deeply nested process exits.

**Non-Goals:**
- Do not build a new CLI framework parser.
- Do not add rules for every possible CLI library; keep the rules abstract enough to apply to Commander, Yargs, Oclif, and plain `process.argv` where applicable.

## Decisions

1. **Format of Preset File**
   - **Decision:** Create a markdown preset file `src/presets/nodejs-cli.md` matching the structure of `expressjs.md` and `laravel.md`.
   - **Rationale:** The architecture-guard orchestrates on top of SDD frameworks via markdown files. Adding a new markdown preset allows seamless integration without changing the core validation logic.
   - **Alternative:** Add hardcoded logic in the CLI. Rejected because it violates the "markdown constitutions and command files are the review source of truth" convention.

2. **Boundary Mapping Definitions**
   - **Decision:** Map "Entry Boundary" to CLI arguments parser (e.g. `bin/cli.js`, `src/commands/`), "Application/Domain Boundary" to core logic services, and "Data Boundary" to filesystem/API clients.
   - **Rationale:** This gives developers using the guard a mental model that translates 1:1 with how they think about API layers.

## Risks / Trade-offs

- **Risk:** Developers might use frameworks that completely obscure the command handler boundaries (like some decorators-based CLI frameworks), making static mapping hard.
- **Mitigation:** The preset will provide structural definitions that the guard's LLM engine can interpret conceptually rather than through strict static AST analysis.
