## Why

When users run `node install.js` interactively and press `Ctrl+C` to exit the prompts, the `@inquirer/prompts` library throws an `ExitPromptError`. This results in an ugly stack trace being printed to the console rather than gracefully exiting the process. We need to catch this specific error and handle it cleanly so users get a smooth experience when canceling the installer.

## What Changes

- Add a try-catch block around the interactive prompts execution in `src/install.js`.
- Catch the `ExitPromptError` from `@inquirer/prompts` and handle it by exiting the process gracefully (e.g., `process.exit(0)` or `process.exit(1)`) without printing a stack trace.
- Keep other errors untouched so genuine bugs still surface stack traces.

## Capabilities

### New Capabilities
- `installer-error-handling`: Gracefully handles prompt cancellations during the installation process.

### Modified Capabilities
- `installer`: Updates the interactive CLI to support graceful cancellation.

## Impact

- **Affected files**: `src/install.js`
- **Dependencies**: No new dependencies, but we will rely on `@inquirer/prompts` or checking error names/instances to identify the cancellation error.
- **User Experience**: Improved UX when aborting the interactive installer.
