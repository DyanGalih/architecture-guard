## Why

The current installation process (`init`) for Architecture Guard skills is placing skills in incorrect directory structures when the user selects the Antigravity or Codex agents. This prevents those agents from correctly detecting and loading the governance skills.

## What Changes

- Modify the initialization script to fix the installation paths and file structures for skills.
- For **Antigravity**: Install skills under `.agent/skills/<skill-name>/SKILL.md` (specifically using `.agent` without an 's', and placing the skill content in `SKILL.md` inside a folder named after the skill).
- For **Codex**: Install skills under `.codex/skills/<skill-name>/SKILL.md` (following the exact same folder structure as Antigravity).

## Capabilities

### New Capabilities

### Modified Capabilities
- `interactive-installer`: Updating the file path and structure generation logic for Antigravity and Codex agent options.

## Impact

- `src/install.js` (the installation logic)
- Directly impacts users installing the governance rules into repositories for Antigravity or Codex, ensuring the tools actually pick up the generated skills.
