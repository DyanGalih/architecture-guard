## Why

The `architecture-guard detect-changed-files` command currently fails when executed with the `--json` option because the flag is not registered in the CLI command definition. This prevents programmatic usage of the command output.

## What Changes

- Add `--json` flag to `architecture-guard detect-changed-files` command
- Ensure the command outputs valid JSON when this flag is provided

## Capabilities

### New Capabilities
- `detect-changed-files`: The `detect-changed-files` command capability, which now supports JSON output.

### Modified Capabilities
- 

## Impact

- CLI parsing logic for `detect-changed-files` will be updated to handle the new flag.
- Output format for `detect-changed-files` will be altered when `--json` is present.
