## Context

The interactive installer `src/install.js` relies on `@inquirer/prompts` to ask users for inputs. When a user forces a prompt to close (e.g., by pressing `Ctrl+C`), `@inquirer/prompts` throws an `ExitPromptError`. Because this error is not explicitly handled in the CLI, the Node.js process crashes with an unhandled exception stack trace. This provides a poor user experience.

## Goals / Non-Goals

**Goals:**
- Catch the `ExitPromptError` globally or around the specific prompt invocations in `install.js`.
- Exit the process gracefully (status code 0 or 1, depending on desired semantics, typically 0 for graceful abort) without a stack trace when this specific error is encountered.

**Non-Goals:**
- Handling other unexpected errors gracefully (we still want them to throw stack traces for debugging).
- Updating all CLI scripts (just `src/install.js` needs this fix).

## Decisions

- **Decision 1:** We will catch errors at the highest level of the prompt execution, or specifically inside the `ask()` function wrapper if one exists, to avoid repeating try-catch blocks. If we encounter `ExitPromptError` (or an error whose name is `ExitPromptError`), we will print a polite cancellation message and call `process.exit(0)`.
  - **Alternative Considered:** Catching it per-prompt. This would be too verbose.
  - **Alternative Considered:** Using `process.on('SIGINT')`. This doesn't work well because `@inquirer/prompts` actively intercepts the signal and throws the error itself instead of letting Node.js handle it normally.

## Risks / Trade-offs

- **Risk:** We might accidentally catch other errors if we just check for `error.name === 'ExitPromptError'`. 
  - **Mitigation:** We will only suppress the stack trace and exit if it strictly matches the cancellation signature. Otherwise, we re-throw.
