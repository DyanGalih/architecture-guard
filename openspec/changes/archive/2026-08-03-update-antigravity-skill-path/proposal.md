## Why

Antigravity expects project-specific skills to be placed in the singular `.agent/skills` directory, not plural `.agents/skills`. Currently, the installation process for Architecture Guard places skills in `.agents/skills`, which causes them to be ignored by Antigravity, preventing users from seeing the `/ag-init-brownfield` slash command (or others) in their chat menu. This change will align the installation path with Antigravity's expected directory structure.

## What Changes

- Update the installation scripts/logic to copy `SKILL.md` and related command files into `.agent/skills` instead of `.agents/skills`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `installer`: Updating the installation path for skills from `.agents/skills` to `.agent/skills`.

## Impact

- **Affected code**: Installation scripts in `src/` (e.g., `src/install.js`, `scripts/*`, or related CLI installer logic).
- **Users**: Users will no longer have to manually rename the directory to use Architecture Guard skills in Antigravity. Existing users might have dead `.agents` folders that can be ignored or cleaned up manually.
