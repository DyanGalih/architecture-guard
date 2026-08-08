## 1. CLI Command Update

- [x] 1.1 Locate `detect-changed-files` CLI definition.
- [x] 1.2 Add `--json` boolean option to the command registration using commander.
- [x] 1.3 Update the command handler to accept the `--json` option flag.

## 2. Output Formatting

- [x] 2.1 Update the output logic in `detect-changed-files` handler to check if `options.json` is true.
- [x] 2.2 If true, format the list of changed files using `JSON.stringify` and `console.log` it.
- [x] 2.3 Ensure no other unstructured output is printed to `stdout` when `--json` is enabled so the JSON remains valid.
