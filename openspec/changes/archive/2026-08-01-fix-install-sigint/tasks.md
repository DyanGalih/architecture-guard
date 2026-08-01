## 1. Implementation

- [x] 1.1 In `src/install.js`, locate the `ask()` function or wherever `select` and `checkbox` from `@inquirer/prompts` are invoked.
- [x] 1.2 Wrap the invocation in a `try...catch` block.
- [x] 1.3 In the `catch` block, check if the error is an instance of `ExitPromptError` or if `error.name === 'ExitPromptError'`.
- [x] 1.4 If it is the cancellation error, print a cancellation message (e.g., "Installation aborted.") and call `process.exit(0)`.
- [x] 1.5 If it is any other error, re-throw it so that normal error handling and stack traces are preserved.

## 2. Verification

- [x] 2.1 Run `node src/install.js init` manually and press `Ctrl+C` when prompted. Verify that the process exits cleanly without a stack trace.
