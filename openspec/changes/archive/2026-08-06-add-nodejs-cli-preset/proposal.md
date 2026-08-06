## Why

Our architecture guard presets currently index heavily on web and mobile frameworks (Express, Laravel, React, etc.). However, CLI applications have fundamentally different architectural boundaries—such as shell/stdin instead of HTTP requests, command parsers instead of routers, and direct file system access. We need a preset to prevent the common "spaghetti CLI" anti-pattern where argument parsing, terminal output, and business logic are all tangled together.

## What Changes

- Add a new `nodejs-cli.md` preset.
- Map generic architecture boundaries (Entry, Application, Domain, Data) to Node.js CLI primitives (Command Parsers, stdout/stdin, Core Services).
- Enforce separation of command definition/argument parsing from the business logic.
- Prevent raw `console.log` and `process.exit()` deep within the core application layers.

## Capabilities

### New Capabilities
- `nodejs-cli-preset`: Adds architecture rules, boundary mappings, and anti-pattern definitions specific to Node.js CLI applications.

### Modified Capabilities

## Impact

- `src/presets/nodejs-cli.md` will be created.
- This will allow developers using `architecture-guard` on Node.js CLI projects to select this preset and get tailored architecture validations.
