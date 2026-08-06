---
description: Apply Node.js CLI-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Node.js CLI Architecture Adapter

## Init Interview

Ask these questions sequentially after the Node.js CLI preset is selected. Skip questions already resolved by existing constitution context.

### Application Architecture

Ask:

```text
How should the CLI application be organized?

- Commands → Core Services
- Commands → Controllers → Services
- Feature-oriented modules
- Minimal command handlers for simple tools
- Hybrid based on complexity
```

### Dependency Wiring

Ask:

```text
How should dependencies be wired?

- Direct imports for stateless infrastructure
- Explicit factory functions
- Request/Context objects passed down
- A project-adopted DI container
```

### Persistence and File System

Ask:

```text
Which strategy is used for data boundaries like File System or External APIs, and where are they coordinated?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, file length, and pattern names as signals, not proof.
- Start from the Constitution and patterns already working in the repository. Do not introduce layers solely because this preset lists them.
- Distinguish correctness requirements from maintainability advice.
- For each finding, teach the reasoning.
- Evaluate tradeoffs that matter for CLI tools, such as startup time, terminal output verbosity, error codes, and graceful exits.
- Use the core architecture review rules first. This adapter refines generic architecture concepts with **Node.js CLI** conventions, emphasizing command entry points, terminal I/O boundaries, and file-system/data access.

---

## Boundary Mapping

When reviewing a Node.js CLI project, map generic architecture boundaries to CLI primitives:

### Entry Boundary

| Generic Concept | Node.js CLI Equivalent |
| --- | --- |
| Entry point for execution | Command Parsers (Commander, Yargs, Oclif, `process.argv`) |
| Request processing | Command Handlers (`action()` or `handler()`) |
| Terminal Output/Input | `console.log`, `console.error`, `chalk`, `ora`, `inquirer`, `stdin`/`stdout` |

### Application/Domain Boundary

| Generic Concept | Node.js CLI Equivalent |
| --- | --- |
| Shared logic coordination | Core Services (`src/services/` or `src/core/`) |
| Business rules and decisions | Pure functions independent of terminal or parsing |

### Data Boundary

| Generic Concept | Node.js CLI Equivalent |
| --- | --- |
| Data persistence | File System access (`fs`, `path`), databases |
| External communication | External APIs, sub-process execution (`child_process`) |

---

## Detection Rules

### Fat Command Handlers

- **Description:** Command handlers must only orchestrate arguments parsing and call core services. They should not contain complex business logic, long procedural steps, or deep conditional logic.
- **Why:** Fat command handlers make testing business logic impossible without mocking `process.argv` and stdout, leading to fragile tests and spaghetti code.
- **Rule:** If a command handler exceeds coordinating inputs and calling a service (e.g., performing actual file manipulation loops or API data mapping), flag it as a violation. Respect an existing repository convention when the handler is deliberately the application boundary.

### Scattered Process Exit

- **Description:** Calls to `process.exit()` must be constrained to the outermost entry boundary (e.g. `bin/cli.js` or top-level command catch blocks).
- **Why:** Deeply nested `process.exit()` calls make the CLI untestable and prevent the application from cleanly cleaning up resources or being used programmatically.
- **Rule:** Flag direct `process.exit()` calls found inside Core Services, Domain logic, or Data layers. Prefer throwing typed errors and handling them at one top-level boundary; `process.exitCode` may be set by that boundary when cleanup must still run. Allow a documented adapter-specific exception only when the project already centralizes exits through that adapter.

### Hardcoded UI in Core

- **Description:** Terminal UI libraries (`chalk`, `ora`, `inquirer`, `console.log`) should not be used deep within Application or Domain services.
- **Why:** Coupling core logic to terminal output prevents the logic from being reused across different commands, in tests, or in a web/GUI context.
- **Rule:** Flag UI rendering library imports or terminal writes (`console.log`, `console.error`, and equivalent stdout/stderr writes) inside Core Services. Services should return data or emit events, and the Entry boundary should handle presentation. A dedicated output/presentation adapter is an explicit boundary and is not a violation merely because it uses a terminal library.

---

## Examples

### Spaghetti Command vs Clean Command

**Violation (Spaghetti Command):**
```javascript
// src/commands/build.js
const fs = require('fs');
const chalk = require('chalk');

program.command('build <dir>')
  .action((dir) => {
    console.log(chalk.blue(`Building ${dir}...`));

    // Core logic mixed with entry boundary and UI
    if (!fs.existsSync(dir)) {
      console.log(chalk.red('Directory not found!'));
      throw new Error('Directory not found!'); // Handle once at the top-level boundary
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.js')) {
        // Business logic...
      }
    }

    console.log(chalk.green('Done!'));
  });
```

**Clean (Proper Boundaries):**
```javascript
// src/commands/build.js
const chalk = require('chalk');
const buildService = require('../core/buildService');

program.command('build <dir>')
  .action(async (dir) => {
    try {
      const result = await buildService.buildDirectory(dir);
      console.log(chalk.green(`Done! Built ${result.filesProcessed} files.`));
    } catch (error) {
      console.error(chalk.red(error.message));
      process.exitCode = 1;
    }
  });

// src/core/buildService.js
const fs = require('fs');

async function buildDirectory(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error('Directory not found!'); // Throws instead of process.exit
  }
  // Pure business logic...
  return { filesProcessed: 10 }; // Returns data instead of console.log
}

module.exports = { buildDirectory };
```

---

## Output Format

When generating an architecture review for a CLI application, structure the output as follows:

1. **Summary:** Brief overview of architecture health, focusing on separation of CLI parsing from core logic.
2. **Boundary Violations:** List of infractions related to Entry, Application, or Data boundaries.
3. **Anti-Patterns Detected:** Highlight occurrences of Fat Command Handlers, Scattered Process Exits, or Hardcoded UI in Core.
4. **Actionable Recommendations:** Provide precise refactoring steps with code snippets for each violation.
