## Why

Currently, during the interactive initialization flow, users are presented with a prompt to select which governance rules they want to install. If a user wishes to apply all available governance rules, they must manually select each one individually. This is tedious and degrades the user experience. Adding an "all" option will streamline the setup for users who want comprehensive governance coverage out of the box.

## What Changes

- Add a new "All" (or "All Governance Options") option to the governance selection prompt in the `init` command flow.
- When the user selects "All", the system will automatically resolve this to include all available governance rules without requiring individual selections.
- Ensure that this new option seamlessly integrates with the existing prompt mechanisms and does not break the ability to select specific rules if "All" is not chosen.

## Capabilities

### New Capabilities
- `interactive-installer`: Defines the requirements and behaviors of the interactive prompts during the `init` command, specifically the governance selection step and its new "all" option.

### Modified Capabilities

## Impact

- `src/commands/init.js` or the equivalent orchestration file handling the governance selection prompts.
- The interactive CLI experience for new users setting up `architecture-guard`.
